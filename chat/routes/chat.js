var express = require("express");
var router = express.Router();
var [
  getMessages,
  postMessage,
  getMessage,
  putMessage,
  deleteMessage,
] = require("../public/controllers/messages");

var messageLogic = require("../public/logic/messageLogic");
const ws = require("../wslib");

/* GET messages listing. */
router.get("/api/messages", async function (req, res, next) {
  const messages = await getMessages();
  res.send(messages);
});

/* GET message with especific ts. */
router.get("/api/messages/:ts", async function (req, res, next) {
  const message = await getMessage(req.params.ts);
  if (message === null) {
    return res.status(404).send("El mensaje con el ts consultado no existe.");
  } else return res.send(message);
});

/* POST a chat message. */
router.post("/api/messages", async function (req, res, next) {
  let valido = messageLogic.validateMessage(req.body);
  if (valido != "OK") {
    return res.status(400).send("El formato no es válido. " + valido);
  }
  req.body["ts"] = new Date().getTime();
  const newMessage = await postMessage(req.body);
  ws.sendMessages();
  res.send(newMessage.ops[0]);
});

/* PUT a chat message with especific ts. */
router.put("/api/messages", async function (req, res, next) {
  const message = await getMessage(req.body.ts);
  if (message === null) {
    return res.status(404).send("El mensaje con el ts a actualizar no existe.");
  } else {
    let valido = messageLogic.validateMessage(req.body);
    if (valido != "OK") {
      return res.status(400).send("El formato no es válido. " + valido);
    }
    req.body.message += " (EDITED, last ts:" + req.body.ts + ")";
    oldTs = req.body.ts;
    req.body.ts = new Date().getTime();
    updated = await putMessage(req.body, oldTs);
    ws.sendMessages();
    return res.send(req.body);
  }
});

/* DELETE a chat message with especific ts. */
router.delete("/api/messages/:ts", async function (req, res, next) {
  const message = await getMessage(req.params.ts);

  if (message === null) {
    return res.status(404).send("El mensaje con el ts a eliminar no existe.");
  } else {
    removed = await deleteMessage(req.params.ts);
    ws.sendMessages();
    return res.send(message);
  }
});

module.exports = router;
