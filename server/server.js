const express = require("express");
const cors = require("cors");
const redis = require("redis");
const redisClient = redis.createClient();
const app = express();
app.use(cors());
const port = 8000
const http = require('http');
const { Server } = require('socket.io');
const server = http.createServer(app);
const { promisify } = require('util');
const moment = require('moment');

const client = redis.createClient();
const getAsync = promisify(client.get).bind(client);

const subscribeToRedis = () => {
  const redisSubscriber = redis.createClient();
  redisSubscriber.config('set', 'notify-keyspace-events', '$Eg');
  redisSubscriber.psubscribe('*');
  return redisSubscriber;
}

const ListenToPublishMessages = (sub, io) => {
  sub.on('pmessage', async (pattern, channel, message) => {
    if (channel === '__keyevent@0__:set') {
      try {
        const value = JSON.parse(await getAsync(message));
        const bid = { id: message, ...value };
        if (!bid.status) bid.time = moment() //pending
        io.emit(value.campaign, bid);
      } catch (err) { console.log(`Error handleSetEvent : ${err}`); }
    }
  });
}
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    credentials: true
  }
});


io.on('connection', (socket) => {
  console.log(`user ${socket.id} connected`);
  socket.on('disconnect', () => {
    console.log(`user ${socket.id} disconnected`);
  });
});

const subscribe = subscribeToRedis();
ListenToPublishMessages(subscribe, io);

app.get("/getAllCampaigns", (req, res) => {
  try {
    redisClient.smembers('LIST_OF_CAMPAIGNS', (err, data) => {
      if (err) {
        console.error(err);
        throw err;
      }

      if (data)
      {
        res.status(200).send(data);
      }
    });
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

server.listen(8080, () => { // websocket
  console.log(`listen on port 8080`);
});


app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))
