(async function() {
  "use strict";

  const express = require("express");
  const logger = require("morgan");
  const request = require("request");
  const bodyParser = require("body-parser");
  const cors = require("cors");
  const { Cluster } = require("puppeteer-cluster");
  const activateRouter = require("./activate");

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
  const util = require("util");
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

  // Puppeteer Cluster

  const browserArgs = [
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
    "--hide-scrollbars"
  ];

  // each new call to workerInstance() will
  // left pop() one element from this list
  let cluster;
  let proxyPassword = "proxy189960:vNm1Q1Oh";
  // maxConcurrency should be equal to perBrowserOptions.length
  const initPuppeteerClusterWithProxy = async proxies => {
    let perBrowserOptions = [];
    proxies.forEach(proxy => {
      perBrowserOptions.push({
        headless: true,
        ignoreHTTPSErrors: true,
        args: browserArgs.concat(["--proxy-server=http://" + proxy])
      });
      console.log("proxy", proxy);
    });

    cluster = await Cluster.launch({
      // monitor: true,
      timeout: 160000,
      concurrency: Cluster.CONCURRENCY_BROWSER,
      maxConcurrency: 4,
      puppeteerOptions: {
        // headless: false,
        // args: browserArgs.concat(["38.87.150.199:14888"]),
        // slowMo: 100,
        // ignoreHTTPSErrors: true,
        executablePath:
          process.env.NODE_ENV === "production"
            ? "./chrome-win/chrome.exe"
            : "./node_modules/puppeteer/.local-chromium/win64-672088/chrome-win/chrome.exe"
      },
      perBrowserOptions: perBrowserOptions.slice(0, 4)
    });
  };

  const clusterTaskFunction = async ({ page, data: pack }) => {
    var proxy = pack.body.proxy;
    var user = pack.body.user;
    var sms = pack.body.sms;

    try {
      if (pack.mode === "create") {
        if (user.country === "China")
          await chineseAccountBot.doCreate(page, io, proxyPassword, user, sms);
        else await createAccountBot.doCreate(page, io, proxyPassword, user);
      } else if (pack.mode === "verify") {
        await verifyAccountBot.doVerify(page, io, proxyPassword, user, sms);
      }
    } catch (e) {
      console.log("Error from axios cluster.task");
      console.log(e.message);

      const emitTag = pack.mode === "create" ? "CreateLog" : "VerifyLog";
      let message = "Error";

      if (e.message.includes("ERR_NO_SUPPORTED_PROXIES")) {
        message += ": Proxy";
      } else if (e.message.includes("")) {
        message += ": " + e.message.slice(0, 7);
      }

      io.sockets.emit(emitTag, {
        index: user.tableIndex,
        code: 3,
        message: message
      });
    }
  };

  // await initPuppeteerClusterWithProxy([]);
  // await cluster.task(clusterTaskFunction);
  // console.log("cluster", cluster);
  // Endpoint for creating accounts

  app.post("/create", function(req, res) {
    if (clientList && clientList.length) {
      try {
        cluster.execute({
          body: req.body,
          mode: "create"
        });
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
        cluster.execute({
          body: req.body,
          mode: "verify"
        });
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

  app.post("/set-proxy", async (req, res) => {
    console.log("flagABC", flagAbc);
    flagAbc += 1;
    const proxies = req.body.proxies;
    proxyPassword = req.body.proxyPwd;

    try {
      // await cluster.close();
      await initPuppeteerClusterWithProxy(proxies);
      await cluster.task(clusterTaskFunction);
      // In case of problems, log them
      cluster.on("taskerror", (err, data) => {
        console.log(`DEBUG - Error with cluster ${data}: ${err.message}`);
      });
    } catch (e) {
      console.log("crreating cluster error", e);
    }

    if (!cluster) {
      console.log("/set-proxy", "cluster null");
      return res.json({
        status: false,
        message: "set proxies done"
      });
    }

    return res.json({
      status: true,
      message: "set proxies done"
    });
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
