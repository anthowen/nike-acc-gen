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
  const response = await axios.post(
    // "http://45.77.99.181:3000/authenticated",
    // "http://iisnode.local/authenticated",
    "http://45.77.99.181/authenticated",
    {
      user: username,
      os: ostype,
      host: hostname
    }
  );

  console.log(response.data);

  return res.json({
    username: username,
    activated: response && response.data ? response.data.status : false
  });
});

router.post("/verify", async (req, res) => {
  const { username, ostype, hostname } = await getSysMetrics();

  console.log(username);
  console.log(ostype);
  console.log(hostname);
  console.log(req.body.key);

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
  console.log(response.data);

  res.json({
    username: username,
    verified: response && response.data ? response.data.status : false
  });
});

module.exports = router;
