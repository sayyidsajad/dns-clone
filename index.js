const dnsPacket = require("dns-packet");
const dgram = require("dgram");

const socket = dgram.createSocket("udp4");
const db = {
  "www.abc.in": {
    type: "A",
    data: "1.2.3.4",
  },
  "www.yohire.in": {
    type: "CNAME",
    data: "abc.test.com",
  },
};
socket.on("message", (msg, rinfo) => {
  const incomingReq = dnsPacket.decode(msg);
  const ipFromDb = db[incomingReq.questions[0].name];
  const ans = dnsPacket.encode({
    id: incomingReq.id,
    type: "response",
    flags: dnsPacket.AUTHORITATIVE_ANSWER,
    questions: incomingReq.questions,
    answers: [
      {
        type: ipFromDb.type,
        class: "IN",
        name: incomingReq.questions[0].name,
        data: ipFromDb.data,
      },
    ],
  });
  socket.send(ans, rinfo.port, rinfo.address);
});

socket.bind(53, () => {
  console.log("server is running on port 53");
});
