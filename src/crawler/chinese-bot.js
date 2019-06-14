const request = require("request");
const fs = require("fs");
const config = require("./config");

var info;
var themessage;
var phoneNum;
var userpass;

//GET DOM TRAVERSAL VALUES
//const AcceptCookies = '#cookie-settings-layout > div > div > div > div.ncss-row.mt5-sm.mb7-sm > div:nth-child(2) > button';
const loginBtn = "li.member-nav-item.d-sm-ib.va-sm-m > button";
const registerBtn =
  "#nike-unite-mobileLoginForm > div.nike-unite-component.action-link.mobileLoginJoinLink.current-member-signin > a";

const phone =
  "#nike-unite-mobileJoinForm > div.nike-unite-component.nike-unite-verifyMobileNumber > div.sendCode > div.mobileNumber-div > input";
const sendNum =
  "#nike-unite-mobileJoinForm > div.nike-unite-component.nike-unite-verifyMobileNumber > div.sendCode > input";
const enterValue =
  "#nike-unite-mobileJoinForm > div.nike-unite-component.nike-unite-verifyMobileNumber > div.verifyCode > input";
const enterTheValue = 'input[type="number"]';
const storedSubmit =
  '#nike-unite-mobileJoinForm > div.nike-unite-submit-button.mobileJoinContinue.nike-unite-component > input[type="button"]';

const password = 'input[type="password"]';
const fName =
  '#nike-unite-mobileJoinForm > div.nike-unite-text-input.firstName.nike-unite-component.empty > input[type="text"]';
const sName =
  '#nike-unite-mobileJoinForm > div.nike-unite-text-input.lastName.nike-unite-component.empty > input[type="text"]';
const gender =
  '#nike-unite-mobileJoinForm > div.nike-unite-gender-buttons.shoppingGender.nike-unite-component > ul > li:nth-child(1) > input[type="button"]';
const submit =
  '#nike-unite-mobileJoinForm > div.nike-unite-submit-button.mobileJoinSubmit.nike-unite-component > input[type="button"]';
const dob = 'input[type="date"]';

const jumpOver =
  '#nike-unite-mobileJoinDobEmailForm > div.nike-unite-action-button.mobileJoinDobEmailSkipButton.nike-unite-component > font > font > input[type="button"]';
const email = 'input[type="email"]';
const submitEmail = 'input[type="button"]';

//Create Sleep function to use in Async/Await function
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

//callback for phone number request
function callback(error, response, body) {
  if (!error && response.statusCode == 200) {
    info = body;
    console.log("Phone Number: " + info);
  } else console.log("Reponse.statuscode = " + response.statusCode);
}

//callback for text message response
function callbacktwo(error, response, body) {
  if (!error && response.statusCode == 200) {
    themessage = body;
    console.log("Message: " + themessage);
  }
}

console.log("The Bot is starting...");

let doCreate = async (io, proxy, user, sms) => {
  var browser = await config.browser(proxy);
  var page = await browser.newPage();
  if (proxy && proxy.user && proxy.pass) {
    console.log("authenticating proxy user/pass");
    await page.authenticate({
      username: proxy.user,
      password: proxy.pass
    });
  }

  await page.setViewport({ width: 1200, height: 800 });

  await Promise.all([
    page.waitForNavigation(5000), // The promise resolves after navigation has finished
    await page.goto("https://www.nike.com/cn/launch/")
  ]);

  //await page.click(AcceptCookies);
  //console.log("Accepted Cookies...");

  // await page.waitFor(1000);

  await page.click(loginBtn);
  console.log("Login Button Clicked...");

  await page.click(registerBtn);
  console.log("Register Button Clicked");

  io.sockets.emit("CreateLog", {
    index: user.tableIndex,
    code: 0,
    message: "Bot started"
  });

  await page.waitFor(2000);

  try {
    //values for phone number request
    const options = {
      url:
        "http://www.getsmscode.com/do.php?action=getmobile&username=" +
        sms.email +
        "&token=" +
        sms.token +
        "&pid=628",
      headers: { "User-Agent": "request" }
    };

    console.log("url = " + options.url);

    request(options, callback);
    await sleep(10000);

    if (info.includes("balance")) {
      console.log("LOW BALANCE: Add money to your getsmscode account. ");
      browser.close();
      process.exit();
    }

    phoneNum = info.toString().slice(2);

    console.log("Phone number: " + phoneNum);

    console.log("waiting 5s");
    await page.waitFor(5000);
    console.log("waiting done");
    await page.screenshot({ path: "screenshot.png" });
    await page.click(phone);
    await page.type(phone, phoneNum);
    console.log("entered phone number");

    io.sockets.emit("CreateLog", {
      index: user.tableIndex,
      code: 1,
      message: "Enter phonenumber",
      phonenumber: "+86 " + phoneNum
    });

    console.log("waiting 2s");
    await page.waitFor(2000);
    console.log("waiting done");

    await page.click(sendNum);
    console.log("pressed send number button");

    io.sockets.emit("CreateLog", {
      index: user.tableIndex,
      code: 1,
      message: "Send SMS"
    });

    console.log("Getting Text Message: 30s wait");
    await sleep(30000);

    console.log("Phone Number: 86" + phoneNum);

    const values = {
      url:
        "http://www.getsmscode.com/do.php?action=getsms&username=" +
        sms.email +
        "&token=" +
        sms.token +
        "&pid=628&mobile=86" +
        phoneNum,
      headers: { "User-Agent": "request" }
    };

    await request(values, callbacktwo);

    await sleep(1500);

    if (themessage.includes("NIKE")) {
      console.log("request complete");
      var theMessaging = themessage.slice(themessage.length - 6);
      console.log("Message: " + theMessaging.toString());

      await page.click(enterTheValue);
      await page.type(enterTheValue, theMessaging);
      console.log("entered phone message");

      await sleep(500);

      await page.click(storedSubmit);
      console.log("submitted");

      io.sockets.emit("CreateLog", {
        index: user.tableIndex,
        code: 2,
        message: "Enter SMS code"
      });
    } else {
      console.log("failed to get sms from getsmscode.com");
      browser.close();
      io.sockets.emit("CreateLog", {
        index: user.tableIndex,
        code: 3,
        message: "Failed to get SMS"
      });
      return;
    }

    await sleep(1000);
  } catch (error) {
    console.error(error);
    browser.close();
    // process.exit();

    io.sockets.emit("CreateLog", {
      index: user.tableIndex,
      code: 3,
      message: "Failed to get SMS"
    });
    return;
  }

  console.log("waiting 8s");
  await sleep(8000);
  console.log("waiting done");

  io.sockets.emit("CreateLog", {
    index: user.tableIndex,
    code: 3,
    message: "SMS code success"
  });

  await page.type(sName, user.firstName);
  await page.type(fName, user.lastName);
  await page.type(password, user.password);
  await page.click(gender);

  await page.click(submit);
  console.log("submit name and password");

  io.sockets.emit("CreateLog", {
    index: user.tableIndex,
    code: 4,
    message: "Type details"
  });

  console.log("waiting 8s");
  await sleep(8000);
  console.log("waiting done");

  console.log("email: " + user.email);
  await page.type(email, user.email);

  page.on("dialog", async dialog => {
    console.log(dialog.message());
    await dialog.dismiss();
    await browser.close();
  });

  io.sockets.emit("CreateLog", {
    index: user.tableIndex,
    code: 5,
    message: "Enter Email"
  });

  await page.click(submitEmail);
  console.log("submit email");

  console.log("waiting 8s");
  await sleep(8000);
  console.log("waiting done");

  await page.type(
    dob,
    "01/02/19" + Math.floor(Math.random() * (99 - 55) + 55).toString()
  );

  console.log("Fill Date of birth");

  userpass = user.email + ":" + user.password;
  console.log(userpass);

  await page.click(submitEmail); // final Submit
  console.log("submit Dob");

  io.sockets.emit("CreateLog", {
    index: user.tableIndex,
    code: 6,
    message: "Account created & verified"
  });

  fs.appendFile("Accounts.txt", "\n" + userpass, err => {
    if (err) throw err;
    console.log("Added User/Pass To Accounts.txt!");
  });

  console.log("waiting for 8s");
  await sleep(8000);
  console.log("waiting done");

  browser.close();
};

module.exports = {
  doCreate
};
