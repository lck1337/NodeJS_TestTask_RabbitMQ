const amqplib = require('amqplib');

class mqWorker {
constructor(data) {
  this.connect = null;
  this.host = data.host;
  this.channel = data.channel;
  this.queue = data.queue;
  this.queueResponses = data.queueResponses;
}

async Connect() {
  this.connect = await amqplib.connect(this.host);
  this.channel = await this.connect.createChannel();
  await this.channel.assertQueue(this.queue);
  this.channel.consume(this.queue, msg=>this.messageHandler(msg, this.channel));
}

messageFromStringJSON(msg) {
  try {
  return JSON.parse(msg.content.toString());
  } catch(e) {
  console.log(e);
  return null
  }
}

messageFormat(uuid, msg) {
  return Buffer.from(JSON.stringify({
    correlationId: uuid,
    message: msg
  }));
}

async messageHandler(msg, channel) {
  const msgJSON = this.messageFromStringJSON(msg);
  if (msg !== null & msgJSON !== null) {
    if(msgJSON.message == "ping") {
    console.log(`[${msgJSON.correlationId}]Received: ${msgJSON.message}`);
    channel.sendToQueue(msgJSON.correlationId, this.messageFormat(msgJSON.correlationId, "pong"));
    this.channel.ack(msg);
    }
  } else {
    console.log('Consumer cancelled by server');
  }
}

}

const channel = new mqWorker({
host: "amqp://0.0.0.0",
channel: "ch1",
queue: 'tasks',
queueResponses: "responses"
}).Connect();

