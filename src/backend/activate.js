const express = require("express");
const Router = express.Router;
const router = new Router();
const usernameService = require("username");
const os = require("os");
const axios = require("axios");

const getSysMetrics = async () => {
  let username = await usernameService();
  const hostname = os.hostname();
  const ostype = os.type();

  username = !username ? process.env.USER || "" : username;

  return { username, ostype, hostname };
};

router.post("/", async (req, res) => {
  const { username, ostype, hostname } = await getSysMetrics();
  const response = await axios.post("http://45.77.99.181/authenticated", {
    user: username,
    os: ostype,
    host: hostname
  });

  console.log(response.data);

  return res.json({
    username: username,
    activated: response && response.data ? response.data.status : false,
    userid: response && response.data.userid
  });
});

router.post("/uninstall", async (req, res) => {
  const { username, ostype, hostname } = await getSysMetrics();
  const response = await axios.post("http://45.77.99.181/uninstall", {
    user: username,
    os: ostype,
    host: hostname
  });

  return res.json({
    status: response && response.data ? response.data.status : false
  });
});

router.post("/verify", async (req, res) => {
  const { username, ostype, hostname } = await getSysMetrics();
  const response = await axios.post(
    "http://45.77.99.181/verify",
    // "http://192.168.0.107:3000/verify",
    // "http://iisnode.local/verify",
    {
      user: username,
      os: ostype,
      host: hostname,
      key: req.body.key
    }
  );
  res.json({
    username: username,
    verified: response && response.data ? response.data.status : false
  });
});

module.exports = router;
