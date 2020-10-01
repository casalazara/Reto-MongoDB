const mdbconn = require("../../lib/utils/mongo.js");

function getMessages() {
  return mdbconn.conn().then((client) => {
    return client.db("chat").collection("messages").find({}).toArray();
  });
}

function postMessage(message) {
  return mdbconn.conn().then((client) => {
    return client.db("chat").collection("messages").insertOne(message); // Si no se provee un ID, este será generado automáticamente
  });
}

function getMessage(ts) {
  return mdbconn.conn().then((client) => {
    return client
      .db("chat")
      .collection("messages")
      .findOne({ ts: parseInt(ts) });
  });
}

function putMessage(body, oldTs) {
  return mdbconn.conn().then((client) => {
    client
      .db("chat")
      .collection("messages")
      .updateOne(
        { ts: oldTs }, // Filtro al documento que queremos modificar
        {
          $set: {
            author: body.author,
            message: body.message,
            ts: parseInt(body.ts),
          },
        } // El cambio que se quiere realizar
      );
  });
}

function deleteMessage(ts) {
  return mdbconn.conn().then((client) => {
    client
      .db("chat")
      .collection("messages")
      .deleteOne({ ts: parseInt(ts) });
  });
}

module.exports = [
  getMessages,
  postMessage,
  getMessage,
  putMessage,
  deleteMessage,
];
