const { string } = require("joi");
const WebSocket = require("ws");
var [
  getMessages,
  postMessage,
  getMessage,
  putMessage,
  deleteMessage,
] = require("./public/controllers/messages");
var messageLogic = require("./public/logic/messageLogic");

const clients = [];

const wsConnection = (server) => {
  const wss = new WebSocket.Server({ server });

  wss.on("connection", (ws) => {
    clients.push(ws);
    sendMessages();

    ws.on("message", async function (message) {
      message = JSON.parse(message);
      message["ts"] = new Date().getTime();
      let y = messageLogic.validateMessage(message);
      if (y["details"]) {
        msg = "ERROR " + y.details[0].message;
        message = JSON.stringify(msg);
        ws.send(message);
      }
      let x = await postMessage(message);
      sendMessages();
    });
  });
};

const sendMessages = () => {
  clients.forEach((client) => {
    getMessages().then((result) => {
      messages = JSON.stringify(result);
      client.send(messages);
    });
  });
};

exports.wsConnection = wsConnection;
exports.sendMessages = sendMessages;
