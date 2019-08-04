const request = require("request");
const fs = require("fs");

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
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

let doVerify = async (page, io, user, sms) => {
  let country = "";
  if (user.country === "United Kingdom") country = "gb";

  console.log("selected sms provider : " + sms.provider);
  let smsProvider = null;
  if (sms.provider === "pvacodes")
    smsProvider = require("./sms-providers/pvacodes");
  else if (sms.provider === "getsmscode")
    smsProvider = require("./sms-providers/getsmscode");
  else if (sms.provider === "smsaccs")
    smsProvider = require("./sms-providers/smsaccs");
  else if (sms.provider === "smspva")
    smsProvider = require("./sms-providers/smspva");
  if (!smsProvider) {
    io.sockets.emit("VerifyLog", {
      index: user.tableIndex,
      code: 3,
      message: "Unsupported SMS Service"
    });
    return;
  }

  io.sockets.emit("VerifyLog", {
    index: user.tableIndex,
    code: 0,
    message: "Bot started"
  });

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

  await page.waitFor(5000);
  await page.waitForSelector(email);

  io.sockets.emit("VerifyLog", {
    index: user.tableIndex,
    code: 2,
    message: "Logging in ..."
  });

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
  await sleep(2000);
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

  try {
    // eslint-disable-next-line no-unused-vars
    const balanceCallback = balance => {};
    const errorCallback = errorMessage => {
      throw new Error(errorMessage);
    };

    const numberCallback = async phoneNum => {
      // Refine phonenumber based on country
      if (
        user.country === "United Kingdom" &&
        phoneNum.startsWith("44") &&
        phoneNum.length > 10
      ) {
        phoneNum = phoneNum.slice(2, phoneNum.length);
      } else if (
        user.country === "United States" &&
        phoneNum.startsWith("1") &&
        phoneNum.length > 10
      ) {
        phoneNum = phoneNum.slice(1, phoneNum.length);
      }

      console.log("Phone number: " + phoneNum);

      console.log("waiting 5s");
      await page.waitFor(5000);
      console.log("waiting done");

      await page.click(phone);
      await page.type(phone, phoneNum);
      console.log("entered phone number");

      await page.screenshot({
        path: `${user.country}_${phoneNum}_screenshot.png`
      });

      io.sockets.emit("VerifyLog", {
        index: user.tableIndex,
        code: 1,
        message: "Enter phonenumber",
        phonenumber:
          (user.country === "United Kingdom" ? "+44 " : "+1 ") + phoneNum
      });

      console.log("waiting 2s");
      await page.waitFor(2000);
      console.log("waiting done");

      await page.click(sendNum);
      console.log("pressed send number button");

      io.sockets.emit("VerifyLog", {
        index: user.tableIndex,
        code: 1,
        message: "SMS Sent"
      });
    };

    const smsCallback = async code => {
      console.log("SMS code received : " + code);
      await page.click(enterTheValue);
      await page.type(enterTheValue, code);
      console.log("Entered sms code");

      await sleep(500);

      await page.click(storedSubmit);
      console.log("submitted");

      io.sockets.emit("VerifyLog", {
        index: user.tableIndex,
        code: 5,
        message: "Enter SMS code"
      });

      userpass = user.email + ":" + user.password;
      console.log(userpass);

      fs.appendFile("VerifiedAccounts.txt", "\n" + userpass, err => {
        if (err) throw err;
        console.log("Added User/Pass To VerifiedAccounts.txt!");
      });
    };

    await smsProvider.doProcess(
      {
        country: user.country === "United Kingdom" ? "UK" : "US",
        token: sms.token,
        username: sms.username
      },
      null,
      numberCallback,
      smsCallback,
      errorCallback
    );
  } catch (e) {
    let errMessage = "Error";
    if (e.message.includes("sms")) {
      errMessage = "Failed to get SMS";
    } else if (e.message.includes("No free channels")) {
      errMessage = "Phone not available";
    } else if (e.message.includes("balance")) {
      errMessage = e.message;
    }

    io.sockets.emit("VerifyLog", {
      index: user.tableIndex,
      code: 3,
      message: errMessage
    });
    return;
  }

  io.sockets.emit("VerifyLog", {
    index: user.tableIndex,
    code: 5,
    message: "SMS code success"
  });

  await sleep(3000);

  io.sockets.emit("VerifyLog", {
    index: user.tableIndex,
    code: 6,
    message: "Accont verified",
    country: user.country === "United Kingdom" ? "uk" : "us"
  });
};

module.exports = {
  doVerify
};
