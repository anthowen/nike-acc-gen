(async function() {
  "use strict";

  const express = require("express");
  const logger = require("morgan");
  const request = require("request");
  const bodyParser = require("body-parser");
  const cors = require("cors");
  const puppeteer = require("puppeteer");
  const proxyChain = require("proxy-chain");
  const TaskQueue = require("cwait").TaskQueue;
  const activateRouter = require("./activate");

  const createAccountBot = require("./crawler/create-bot");
  const verifyAccountBot = require("./crawler/verify-bot");
  const chineseAccountBot = require("./crawler/chinese-bot");

  const socketIo = require("socket.io");
  const PORT = 5000;

  global.Promise = require("bluebird");

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

  /*
  Overriding console.log, save to file
  */

  const fs = require("fs");
  const logFile = fs.createWriteStream("log.txt", { flags: "a" });
  // Or 'w' to truncate the file every time the process starts.
  // const logStdout = process.stdout;
  const originalLog = console.log;

  let flagAbc = 3;

  console.log = (msg, ...params) => {
    originalLog(msg, ...params);

    logFile.write(msg + ", " + params.join(", ") + "\n");
    // logStdout.write(util.format.apply(null, arguments) + "\n");

    io.sockets.emit("ApplicationLog", msg, ...params);
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

  const initializePuppeteer = async data => {
    if (!data.mode) return;

    // Get Proxy Address and Proxy password
    const proxyElements = data.proxy.split(":");

    // const oldProxyUrl = `http://${proxyElements[2]}:${proxyElements[3]}@${
    //   proxyElements[0]
    // }:${proxyElements[1]}`;
    // const newProxyUrl = await proxyChain.anonymizeProxy(oldProxyUrl);

    // console.log(newProxyUrl);

    const browser = await puppeteer.launch({
      headless: false,
      slowMo: 100,
      args: [
        "--disable-infobars",
        "--window-position=0,0",
        "--ignore-certifcate-errors",
        "--ignore-certifcate-errors-spki-list",
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-accelerated-2d-canvas",
        "--disable-gpu",
        "--window-size=1920x1080",
        "--hide-scrollbars",
        "--proxy-server=" + proxyElements[0] + ":" + proxyElements[1]
        // `--proxy-server=${newProxyUrl}`
      ],
      executablePath:
        process.env.NODE_ENV === "production"
          ? "./chrome-win/chrome.exe"
          : "./node_modules/puppeteer/.local-chromium/win64-672088/chrome-win/chrome.exe"
    });

    const context = await browser.createIncognitoBrowserContext();
    const page = await context.newPage();
    await page.authenticate({
      username: proxyElements[2],
      password: proxyElements[3]
    });

    await page.setRequestInterception(true);
    // await page
    //   .setViewport({ width: 1200, height: 800 })
    //   .catch(error => console.log("viewport error: " + error.message));

    // Ignores image loading
    page.on("request", req => {
      if (
        // req.resourceType() == "stylesheet" ||
        req.resourceType() == "font" ||
        req.resourceType() == "image"
      ) {
        req.abort();
      } else {
        req.continue();
      }
    });

    // await page.goto("https://ipinfo.io/");
    // await page.screenshot({
    //   path: proxyElements[0] + ":" + proxyElements[1] + "-proxyinfo.png"
    // });

    try {
      if (data.mode === "create") {
        if (data.user.country === "China")
          await chineseAccountBot.doCreate(page, io, data.user, data.sms);
        else await createAccountBot.doCreate(page, io, data.user, data.sms);
      } else if (data.mode === "verify") {
        await verifyAccountBot.doVerify(page, io, data.user, data.sms);
      }
    } catch (ex) {
      console.log("At MainBot()", ex);
    }

    await browser.close();
  };

  const runMultiPuppeteer = async data => {
    try {
      // a concurrency parameter of 1 makes all api requests secuential
      const MAX_SIMULTANEOUS_DOWNLOADS = 4;
      // init your manager.
      const queue = new TaskQueue(Promise, MAX_SIMULTANEOUS_DOWNLOADS);

      await Promise.map(data, queue.wrap(initializePuppeteer));
    } catch (e) {
      console.log("At runMultiPuppeteer()", e);
    }
  };

  app.post("/create", function(req, res) {
    if (clientList && clientList.length) {
      try {
        const proxies = req.body.proxies;
        const users = req.body.users;
        const smsInfo = req.body.sms;

        const data = users.map((user, index) => {
          return {
            mode: "create",
            user: user,
            proxy: proxies[index % proxies.length],
            sms: smsInfo
          };
        });

        runMultiPuppeteer(data);
      } catch (err) {
        return res.end("Error: " + err.message);
      }

      return res.json({
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

  // Endpoint for verifying accounts
  app.post("/verify", function(req, res) {
    console.log("flagABC", flagAbc);
    if (clientList && clientList.length) {
      try {
        const proxies = req.body.proxies;
        const users = req.body.users;
        const smsInfo = req.body.sms;

        const data = users.map((user, index) => {
          return {
            mode: "verify",
            user: user,
            proxy: proxies[index % proxies.length],
            sms: smsInfo
          };
        });

        runMultiPuppeteer(data);
      } catch (err) {
        return res.end("Error: " + err.message);
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

  // Endpoint for testing proxy
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

        console.log("Error: ", err);
        console.log("Reponse code: ", resp && resp.statusCode);
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
