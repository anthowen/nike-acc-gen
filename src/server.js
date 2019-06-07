(function() {
  "use strict";

  var express = require("express");
  var path = require("path");
  var logger = require("morgan");
  var bodyParser = require("body-parser");
  const cors = require("cors");
  var botUK = require("./crawler/bot-gb");

  const socketIo = require("socket.io");
  const PORT = 5000;

  const app = express(),
    server = require("http").createServer(app);

  const io = socketIo(server, {
    path: "/mypath",
    serveClient: false
  });

  server.listen(PORT, () => {
    console.log("Listening on *:" + PORT);
  });

  const corsOptions = {
    origin: ["http://localhost:8080", "http://127.0.0.1:8080"],
    credentials: true
  };

  let clientList = new Array();

  var publicPath = path.resolve(__dirname, "./public");
  var nodeModulesPath = path.resolve(__dirname, "./node_modules");

  app.use(logger("dev"));
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());

  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept, Authorization"
    );
    if (req.method === "OPTIONS") {
      res.header(
        "Access-Control-Allow-Methods",
        "PUT, POST, PATCH, DELETE, GET"
      );
      return res.status(200).json({});
    }
    next();
  });

  app.use(cors(corsOptions));

  // Back end point for creating and verifying accounts
  app.post("/create", function(req, res) {
    var proxy = req.body.proxy;
    var user = req.body.user;
    var sms = req.body.sms;

    if (clientList && clientList.length) {
      botUK.startCreateAccount(io, proxy, user, sms);
      res.json({
        status: true,
        proxy: proxy,
        user: user,
        sms: sms,
        message: "create account request has finished"
      });
    } else {
      res.json({
        status: false,
        message: "no socket has connected"
      });
    }
  });

  app.get("/clients", (req, res) => {
    res.send(Object.keys(io.sockets.clients().connected));
  });

  app.get("/", (req, res) => {
    res.json({
      status: true,
      user: req.body.user,
      message: "???? Index requested success"
    });
  });

  // app.get("/socket.io", function(req, res) {
  //   res.sendFile(__dirname + "node_modules/socket.io-client/dist/socket.io.js");
  // });

  io.on("connection", function(client) {
    console.info(`Client connected [id=${client.id}]`);
    // initialize this client's sequence number
    clientList.push(client);

    client.emit("statusEmit", "Client connection received");

    client.on("error", error => {
      console.log(`[${client.id}] error: ${error}`);
    });

    client.on("join", message => {
      console.log("joined with message : " + message);
      client.broadcast.emit("statusEmit", "Join broadcasted");
    });
    // when socket disconnects, remove it from the list:
    client.on("disconnect", () => {
      clientList = clientList.filter(function(element) {
        if (element.id !== client.id) {
          return element;
        }
      });

      console.info(`Client gone [id=${client.id}]`);
    });
  });

  module.exports = server;
})();
