const amqplib = require('amqplib');
const fs = require('fs/promises');
const express = require('express');

class mqWorker {

constructor(data) {
  this.connect = null;
  this.host = data.host;
  this.channel = data.channel;
  this.queue = data.queue;
  this.app = express();
  this.appPort = data.appPort;
}

async Connect() {
  this.connect = await amqplib.connect(this.host);
  this.channel = await this.connect.createChannel();
  this.initRoutes();
  this.app.listen(this.appPort);
}

async initRoutes() {
  const routes = await fs.readdir('./api');

  routes.map(async (file) => {
    const route = require(`./api/${file}`);
    this.app[route.method](route.path, async (req, res, next) => {
      await route.execute(req, res, next, this.channel, this.queue);
    });
  });
}

}

const channel = new mqWorker({
host: "amqp://0.0.0.0",
channel: "ch1",
queue: 'tasks',
appPort:22222
}).Connect();

