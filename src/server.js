(async function() {
  "use strict";

  const express = require("express");
  const logger = require("morgan");
  const request = require("request");
  const bodyParser = require("body-parser");
  const cors = require("cors");
  const { Cluster } = require("puppeteer-cluster");
  const config = require("./crawler/config");
  const activateRouter = require("./backend/activate");

  const createAccountBot = require("./crawler/create-bot");
  const verifyAccountBot = require("./crawler/verify-bot");
  const chineseAccountBot = require("./crawler/chinese-bot");

  const socketIo = require("socket.io");
  const PORT = 5000;

  const app = express(),
    server = require("http").createServer(app);

  const io = socketIo(server, {
    path: "/mypath",
    serveClient: false
  });

  // const fs = require("fs");
  // const writeStream = fs.createWriteStream("./test.log", {
  //   encoding: "utf8",
  //   flags: "w"
  // });

  // process.stdout = require("stream").Writable();
  // process.stdout._write = function(chunk, encoding, callback) {
  //   writeStream.write(chunk, encoding, callback);
  // };

  server.listen(PORT, () => {
    console.log("Listening on *:" + PORT);
  });

  const corsOptions = {
    origin: ["http://localhost:8080", "http://127.0.0.1:8080"],
    credentials: true
  };

  let clientList = new Array();

  // var publicPath = path.resolve(__dirname, "./public");
  // var nodeModulesPath = path.resolve(__dirname, "./node_modules");

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
  app.use("/activate", activateRouter);

  // Puppeteer Cluster
  const cluster = await Cluster.launch({
    concurrency: Cluster.CONCURRENCY_CONTEXT,
    maxConcurrency: 2,
    timeout: 160000,
    puppeteerOptions: {
      // headless: false,
      // slowMo: 100,
      // headless: true,
      args: ["--fast-start", "--disable-extensions", "--no-sandbox"],
      ignoreHTTPSErrors: true,
      executablePath:
        process.env.NODE_ENV === "production"
          ? "./chrome-win/chrome.exe"
          : "./node_modules/puppeteer/.local-chromium/win64-672088/chrome-win/chrome.exe"
    }
  });

  await cluster.task(async ({ page, data: pack }) => {
    var proxy = pack.body.proxy;
    var user = pack.body.user;
    var sms = pack.body.sms;

    try {
      if (pack.mode === "create") {
        if (user.country === "China")
          await chineseAccountBot.doCreate(page, io, proxy, user, sms);
        else await createAccountBot.doCreate(page, io, proxy, user);
      } else if (pack.mode === "verify") {
        await verifyAccountBot.doVerify(page, io, proxy, user, sms);
      }
    } catch (e) {
      console.log("Error from axios cluster.task");
      console.log(e.message);
    }
  });

  // Back end point for creating accounts
  app.post("/create", function(req, res) {
    if (clientList && clientList.length) {
      try {
        cluster.execute({
          body: req.body,
          mode: "create"
        });
      } catch (err) {
        res.end("Error: " + err.message);
      }

      res.json({
        status: true,
        message: "Create account requested"
      });
    } else {
      res.json({
        status: false,
        message: "no socket has connected"
      });
    }
  });

  // Back end point for verifying accounts
  app.post("/verify", function(req, res) {
    if (clientList && clientList.length) {
      try {
        cluster.execute({
          body: req.body,
          mode: "verify"
        });
      } catch (err) {
        res.end("Error: " + err.message);
      }

      res.json({
        status: true,
        message: "Verify account requested"
      });
    } else {
      res.json({
        status: false,
        message: "no socket has connected"
      });
    }
  });

  app.post("/test-proxy", (req, res) => {
    var proxy = req.body.proxy;
    var tableIndex = req.body.tableIndex;
    var proxyUrl =
      "http://" +
      proxy.username +
      ":" +
      proxy.password +
      "@" +
      proxy.host +
      ":" +
      proxy.port;

    if (clientList && clientList.length) {
      var proxiedRequest = request.defaults({ proxy: proxyUrl });

      console.log("Test Proxy: " + proxyUrl);
      proxiedRequest.get("https://www.nike.com", function(err, resp, body) {
        if (resp && (resp.statusCode === 200 || resp.statusCode === 403)) {
          io.sockets.emit("ProxyStatus", {
            index: tableIndex,
            code: 6,
            message: "Good"
          });
        } else {
          io.sockets.emit("ProxyStatus", {
            index: tableIndex,
            code: 3,
            message: "Bad"
          });
        }

        console.log("Error: ");
        console.log(err);
        console.log("Reponse code: ");
        console.log(resp && resp.statusCode);
      });
      res.json({
        status: true,
        message: "Test Proxy requested"
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
      message: "Index requested success"
    });
  });

  // app.get("/socket.io", function(req, res) {
  //   res.sendFile(__dirname + "node_modules/socket.io-client/dist/socket.io.js");
  // });

  io.on("connection", function(client) {
    console.info(`Client connected [id=${client.id}]`);
    // initialize this client's sequence number
    clientList.push(client);

    client.emit("generalChannel", "Client connection received");

    client.on("error", error => {
      console.log(`[${client.id}] error: ${error}`);
    });

    client.on("join", message => {
      console.log("joined with message : " + message);
      client.emit("generalChannel", "'" + message + "' message broadcasted");
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
