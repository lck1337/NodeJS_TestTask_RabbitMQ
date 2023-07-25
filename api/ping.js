const { v4: uuidv4 } = require('uuid');

const messageFromStringJSON = (msg) => {
    try {
    return JSON.parse(msg.content.toString());
    } catch(e) {
    console.log(e);
    return null
    }
  }



module.exports = {
    method: "get",
    path: "/ping",
    execute: async (req, res, next, channel, queue) => {
        const formatMessage = {
            correlationId: uuidv4(),
            message: "ping"
          };
      
          const responsePromise = new Promise(async (resolve, reject) => {
            await channel.assertQueue(formatMessage.correlationId);
             channel.consume(formatMessage.correlationId, (msg) => {
              const msgJSON = messageFromStringJSON(msg);
              console.log(msgJSON.correlationId, " | ", formatMessage.correlationId);
              if (msgJSON.correlationId == formatMessage.correlationId) {
                resolve(msgJSON);
              }
            });
          });
      
          channel.sendToQueue(queue, Buffer.from(JSON.stringify(formatMessage)));
      
          try {
            res.status(200).json(await responsePromise);
          } catch (err) {
            console.error("Error receiving response:", err);
            res.status(500).json({ error: "Failed to receive response" });
          }
    }
  };