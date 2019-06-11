const puppeteer = require("puppeteer");
const request = require("request");
const fs = require("fs");

var emailVal = "cto.sporting2019@gmail.com";
var smsEmail = "ENTER GETSMSCODE.COM EMAIL ADDRESS";
var token = "ENTER GETSMSCODE API TOKEN";
var passwordVal = "aw@it2019#123AD";
var fNameVal = "Mike";
var sNameVal = "Johnatan";
var proxyUrl = ""; //if proxy exists enter it in format IP:PORT, if not leave blank
var proxyUser = ""; //If proxy username/pass exists insert it here if not leave both variables blank
var proxyPass = "";
var info;
var themessage;
var phoneNum;
var userpass;

//GET DOM TRAVERSAL VALUES
const AcceptCookies =
  "#cookie-settings-layout > div > div > div > div.ncss-row.mt5-sm.mb7-sm > div:nth-child(2) > button";
const loginBtn = "li.member-nav-item.d-sm-ib.va-sm-m > button";
const registerBtn = ".loginJoinLink.current-member-signin > a";
const email = 'input[type="email"]';
const password = 'input[type="password"]';
const fName = '.firstName.nike-unite-component.empty > input[type="text"]';
const sName = '.lastName.nike-unite-component.empty > input[type="text"]';
const dob = 'input[type="date"]';
const gender = 'li:nth-child(1) > input[type="button"]';
const submit = '.joinSubmit.nike-unite-component > input[type="button"]';
const phone = "div.sendCode > div.mobileNumber-div > input";
const sendNum =
  '#nike-unite-progressiveForm > div > div > input[type="button"]';
const enterTheValue = 'input[type="number"]';
const storedSubmit = '#nike-unite-progressiveForm > div > input[type="button"]';

//Create Sleep function to use in Async/Await function
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

//callback for phone number request
function callback(error, response, body) {
  if (!error && response.statusCode == 200) {
    info = body;
    console.log("Phone Number: " + info);
  }
}

//values for phone number request
const options = {
  url:
    "http://www.getsmscode.com/vndo.php?action=getmobile&username=" +
    smsEmail +
    "&token=" +
    token +
    "&cocode=uk&pid=462",
  headers: { "User-Agent": "request" }
};

//callback for text message response
function callbacktwo(error, response, body) {
  if (!error && response.statusCode == 200) {
    themessage = body;
    console.log("Message: " + themessage);
  }
}

let startCreateAccount = async (io, proxy, user, sms) => {
  var page;
  var browser;

  console.log("The Bot is starting...");
  io.sockets.emit("statusEmit", {
    index: user.tableIndex,
    code: 0,
    message: "Bot started"
  });

  if (proxy) {
    browser = await puppeteer.launch({
      args: ["--proxy-server=" + proxy.url],
      headless: false,
      slowMo: 150
    });
    page = await browser.newPage();

    if (proxy.user != "" && proxy.pass != "") {
      console.log("authenticating proxy user/pass");
      await page.authenticate({
        username: proxyUser,
        password: proxyPass
      });
    }
  } else {
    let chromePath =
      "./node_modules/puppeteer/.local-chromium/win64-662092/chrome-win/chrome.exe";
    if (process.env.NODE_ENV === "production")
      chromePath = "./chrome-win/chrome.exe";
    browser = await puppeteer.launch({
      headless: false,
      slowMo: 100,
      // headless: true,
      // args: ["--fast-start", "--disable-extensions", "--no-sandbox"],
      // ignoreHTTPSErrors: true,
      executablePath: chromePath
    });
    page = await browser.newPage();
  }

  let country = "";
  if (user.country === "United Kingdom") country = "uk";
  else if (user.country === "China") country = "ch";
  await page.setViewport({ width: 1200, height: 800 });
  await page.goto(`https://www.nike.com/${country}/launch/`);

  // await page.click(AcceptCookies);
  // console.log("Accepted Cookies...");

  io.sockets.emit("statusEmit", "Web page opened");
  await page.waitFor(1000);

  await page.click(loginBtn);
  console.log("Login Button Clicked...");

  await page.click(registerBtn);
  console.log("Register Button Clicked");

  await page.waitFor(2000);

  io.sockets.emit("statusEmit", {
    index: user.tableIndex,
    code: 1,
    message: "Filling in details"
  });

  console.log("email: " + user.email);
  await page.type(email, user.email);

  console.log("password: " + user.password);
  await page.type(password, user.password);

  io.sockets.emit("statusEmit", {
    index: user.tableIndex,
    code: 2,
    message: "Filling in details"
  });

  console.log("fname: " + user.firstName);
  await page.type(fName, user.firstName);

  console.log("sname: " + user.lastName);
  await page.type(sName, user.lastName);

  await page.type(
    dob,
    "01/05/19" + Math.floor(Math.random() * (99 - 55) + 55).toString()
  );

  await page.click(gender);

  console.log("waiting 0.5s");
  await page.waitFor(500);
  console.log("waiting done");

  io.sockets.emit("statusEmit", {
    index: user.tableIndex,
    code: 3,
    message: "Firing submit"
  });

  await page.click(submit);
  console.log("submitted");

  io.sockets.emit("statusEmit", {
    index: user.tableIndex,
    code: 4,
    message: "Submitted"
  });

  userpass = user.email + ":" + user.password;
  console.log(userpass);

  fs.appendFile("Accounts.txt", "\n" + userpass, err => {
    if (err) throw err;
    console.log("Added User/Pass To Accounts.txt!");
  });
  io.sockets.emit("statusEmit", {
    index: user.tableIndex,
    code: 5,
    message: "Credential saved"
  });

  await sleep(2000);
  browser.close();

  io.sockets.emit("statusEmit", {
    index: user.tableIndex,
    code: 6,
    message: "Account created"
  });

  // process.exit();

  // try {
  //   request(options, callback);
  //   await sleep(10000);

  //   if (info.includes("balance")) {
  //     console.log("LOW BALANCE: Add money to your getsmscode account. ");
  //     browser.close();
  //     process.exit();
  //   }

  //   phoneNum = info.toString().slice(2);

  //   console.log("Phone number: " + phoneNum);

  //   console.log("waiting 5s");
  //   await page.waitFor(5000);
  //   console.log("waiting done");
  //   await page.screenshot({ path: "screenshot.png" });
  //   await page.click(phone);
  //   await page.type(phone, phoneNum);
  //   console.log("entered phone number");

  //   console.log("waiting 2s");
  //   await page.waitFor(2000);
  //   console.log("waiting done");

  //   await page.click(sendNum);
  //   console.log("pressed send number button");

  //   console.log("Getting Text Message: 15s wait");
  //   await sleep(15000);

  //   console.log("Phone Number: " + phoneNum);

  //   const values = {
  //     url:
  //       "http://www.getsmscode.com/vndo.php?action=getsms&username=" +
  //       smsEmail +
  //       "&token=" +
  //       token +
  //       "&pid=462&cocode=uk&mobile=44" +
  //       phoneNum,
  //     headers: { "User-Agent": "request" }
  //   };

  //   await request(values, callbacktwo);

  //   await sleep(1500);

  //   if (themessage.includes("Nike")) {
  //     console.log("request complete");
  //     var theMessaging = themessage.slice(themessage.length - 6);
  //     console.log("Message: " + theMessaging.toString());

  //     await page.click(enterTheValue);
  //     await page.type(enterTheValue, theMessaging);
  //     console.log("entered phone message");

  //     await sleep(500);

  //     await page.click(storedSubmit);
  //     console.log("submitted");
  //     userpass = emailVal + ":" + passwordVal;
  //     console.log(userpass);

  //     fs.appendFile("Accounts.txt", "\n" + userpass, err => {
  //       if (err) throw err;
  //       console.log("Added User/Pass To Accounts.txt!");
  //     });
  //   } else {
  //     console.log("failed to get sms from getsmscode.com");
  //   }

  //   await sleep(1000);
  // } catch (error) {
  //   console.error(error);
  //   browser.close();
  //   process.exit();
  // }

  // browser.close();
  // process.exit();
};

module.exports = {
  startCreateAccount
};
