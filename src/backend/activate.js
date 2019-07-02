const express = require("express");
const Router = express.Router;
const router = new Router();
const usernameService = require("username");

router.post("/", async (req, res) => {
  let username = await usernameService();

  username = !username ? process.env.USER || "" : username;
  console.log("user: " + username);

  res.json({
    username: username,
    activated: false
  });
});

router.post("/verify", async (req, res) => {
  let username = await usernameService();

  username = !username ? process.env.USER || "" : username;
  console.log("user: " + username);

  res.json({
    username: username,
    verified: true
  });
});

module.exports = router;
