const request = require("request");
const fs = require("fs");
const config = require("./config");

var info;
var themessage;
var phoneNum;
var userpass;

//GET DOM TRAVERSAL VALUES
// const AcceptCookies =
//   "#cookie-settings-layout > div > div > div > div.ncss-row.mt5-sm.mb7-sm > div:nth-child(2) > button";
const naviToLoginBtn = "li.member-nav-item.d-sm-ib.va-sm-m > button";

const naviToMobileBtn =
  "div.mex-account-settings-wrapper .mex-mobile-input button";

const email = 'input[type="email"]';
const password = 'input[type="password"]';

const loginSubmitBtn =
  '.loginSubmit.nike-unite-component > input[type="button"]';

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
  } else {
    console.log("Reponse.statuscode = " + response.statusCode);
  }
}

//callback for text message response
function callbacktwo(error, response, body) {
  if (!error && response.statusCode == 200) {
    themessage = body;
    console.log("Message: " + themessage);
  }
}

let doVerify = async (page, io, proxy, user, sms) => {
  if (proxy && proxy.user && proxy.pass) {
    console.log("authenticating proxy user/pass");
    await page.authenticate({
      username: proxy.user,
      password: proxy.pass
    });
  }

  let country = "";
  if (user.country === "United Kingdom") country = "gb";

  await page.setViewport({ width: 1200, height: 800 });
  await page.goto(`https://www.nike.com/${country}/launch/`);

  // page.on("console", msg => {
  //   for (let i = 0; i < msg.args().length; ++i)
  //     console.log(`Console log from page; ${i}: ${msg.args()[i]}`);
  // });

  // await page.click(AcceptCookies);
  // console.log("Accepted Cookies...");

  io.sockets.emit("VerifyLog", "Web page opened");
  await page.waitFor(1000);

  await page.click(naviToLoginBtn);
  console.log("Login Dialog opened ...");

  await page.waitFor(2000);
  await page.waitForSelector(email);

  console.log("input email: " + user.email);
  await page.type(email, user.email);

  console.log("input password: " + user.password);
  await page.type(password, user.password);

  await page.click(loginSubmitBtn);

  await page.waitFor(8000);

  const submitError = await page.evaluate(() =>
    document.querySelector(
      "form.nike-unite-loginForm div.nike-unite-error-message"
    )
      ? document.querySelector(
          "form.nike-unite-loginForm div.nike-unite-error-message"
        ).innerHTML
      : null
  );

  if (submitError) {
    console.log(submitError);
    io.sockets.emit("VerifyLog", {
      index: user.tableIndex,
      code: 3,
      message: "Email/pwd mismatch"
    });
    return;
  }

  // await new Promise(async function(resolve, reject) {
  //   try {
  //     const selectorPromise = page
  //       .waitForSelector("div.root-controller>div.js-modal.modal", {
  //         hidden: true,
  //         timeout: 10000
  //       })
  //       .catch(reject);

  //     await selectorPromise.then(resolve);
  //   } catch (err) {
  //     reject(err);

  //     io.sockets.emit("VerifyLog", {
  //       index: user.tableIndex,
  //       code: 3,
  //       message: "Email/pwd mismatch"
  //     });
  //     browser.close();
  //     return;
  //   }
  // });

  console.log("login credential submitted");

  io.sockets.emit("VerifyLog", {
    index: user.tableIndex,
    code: 1,
    message: "Login success"
  });

  // await page.goto(`https://www.nike.com/${country}/member/settings`);
  await page.waitForSelector("ul.right-nav li[data-qa=UserMenu] button", {
    visible: true
  });
  await page.click("ul.right-nav li[data-qa=UserMenu] button");
  await sleep(1500);
  await page.click(
    "ul.right-nav li[data-qa=UserMenu] ul.dropdown-list-container li:first-child>a"
  );

  io.sockets.emit("VerifyLog", {
    index: user.tableIndex,
    code: 2,
    message: "Open settings"
  });

  await page.waitFor(10000);

  console.log("Settings page opened ...");

  await page.waitFor(naviToMobileBtn);
  await page.click(naviToMobileBtn);
  console.log("Mobile phone dialog opened ...");

  //values for phone number request
  let params = "?username=" + sms.username + "&token=" + sms.token + "&action=";

  let hostUrl =
    "http://www.getsmscode.com/usdo.php" + params + "getmobile" + "&pid=628";
  if (country === "gb") {
    hostUrl =
      "http://www.getsmscode.com/vndo.php" +
      params +
      "getmobile" +
      "&pid=462&cocode=uk";
  }

  const options = {
    url: hostUrl,
    headers: { "User-Agent": "request" }
  };

  console.log(hostUrl);

  try {
    request(options, callback);
    await sleep(10000);

    if (info.includes("balance")) {
      console.log("LOW BALANCE: Add money to your getsmscode account. ");
      io.sockets.emit("VerifyLog", {
        index: user.tableIndex,
        code: 3,
        message: "Low Balance on SMS Provider"
      });
      return;
    }

    phoneNum = info.toString().slice(country === "gb" ? 2 : 1);

    console.log("Phone number: " + phoneNum);

    console.log("waiting 2s");
    await page.waitFor(2000);
    console.log("waiting done");

    await page.screenshot({ path: "screenshot.png" });
    await page.click(phone);

    await page.type(phone, phoneNum);

    io.sockets.emit("VerifyLog", {
      index: user.tableIndex,
      code: 3,
      message: "Enter phonenumber",
      phonenumber: (country === "gb" ? "+44 " : "+1 ") + phoneNum
    });

    console.log("waiting 2s");
    await page.waitFor(2000);
    console.log("waiting done");

    await page.click(sendNum);

    io.sockets.emit("VerifyLog", {
      index: user.tableIndex,
      code: 4,
      message: "Send SMS"
    });

    console.log("pressed send number button");

    console.log("Phone Number: " + phoneNum);

    hostUrl =
      "http://www.getsmscode.com/usdo.php" +
      params +
      "getsms" +
      "&pid=628&mobile=1" +
      phoneNum;

    if (country === "gb") {
      hostUrl =
        "http://www.getsmscode.com/vndo.php" +
        params +
        "getsms" +
        "&pid=462&cocode=uk&mobile=44" +
        phoneNum;
    }
    const values = {
      url: hostUrl,
      headers: { "User-Agent": "request" }
    };

    await request(values, callbacktwo);

    themessage = null;
    console.log("Getting Text Message: 30s wait");
    await sleep(15000);

    if (themessage === null) {
      await sleep(15000);
      if (themessage === null) {
        await sleep(10000);
        if (themessage === null) {
          await sleep(10000);
        }
      }
    }

    if (themessage.includes("Nike")) {
      console.log("request complete");
      var theMessaging = themessage.slice(themessage.length - 6);
      console.log("Message: " + theMessaging.toString());

      await page.click(enterTheValue);
      await page.type(enterTheValue, theMessaging);
      console.log("entered phone message");

      await sleep(500);

      io.sockets.emit("VerifyLog", {
        index: user.tableIndex,
        code: 5,
        message: "Enter SMS code"
      });

      await page.click(storedSubmit);
      console.log("submitted");

      userpass = user.email + ":" + user.password;
      console.log(userpass);

      fs.appendFile("VerifiedAccounts.txt", "\n" + userpass, err => {
        if (err) throw err;
        console.log("Added User/Pass To VerifiedAccounts.txt!");
      });
    } else {
      console.log("failed to get sms from getsmscode.com");

      throw new Error("SMS fetch error");
    }

    io.sockets.emit("VerifyLog", {
      index: user.tableIndex,
      code: 5,
      message: "SMS code success"
    });

    await sleep(1000);
  } catch (error) {
    console.error(error);

    io.sockets.emit("VerifyLog", {
      index: user.tableIndex,
      code: 3,
      message: "Failed to get SMS"
    });
    return;
  }

  await sleep(3000);

  io.sockets.emit("VerifyLog", {
    index: user.tableIndex,
    code: 6,
    message: "Accont verified"
  });
};

module.exports = {
  doVerify
};
