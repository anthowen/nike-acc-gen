const fs = require("fs");

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
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

const doCreate = async (page, io, user, sms) => {
  console.log("selected sms provider : " + sms.provider);
  let smsProvider = null;
  if (sms.provider === "pvacodes")
    smsProvider = require("./sms-providers/pvacodes");
  else if (sms.provider === "getsmscode")
    smsProvider = require("./sms-providers/getsmscode");
  if (!smsProvider) {
    io.sockets.emit("CreateLog", {
      index: user.tableIndex,
      code: 3,
      message: "Unsupported SMS Service"
    });
    return;
  }

  console.log("The chinese bot is starting...");

  io.sockets.emit("CreateLog", {
    index: user.tableIndex,
    code: 0,
    message: "Bot started"
  });

  await page
    .setViewport({ width: 1200, height: 800 })
    .catch(error => console.log("viewport error: " + error.message));

  // The promise resolves after navigation has finished
  await page.goto("https://www.nike.com/cn/launch/");

  page.on("dialog", async dialog => {
    console.log("dialog message", dialog.message());
    await dialog.dismiss();
  });

  console.log("navigated to launch page");
  //await page.click(AcceptCookies);
  //console.log("Accepted Cookies...");

  await page.waitFor(500);

  await page.click(loginBtn);
  console.log("Login Button Clicked...");

  await page.click(registerBtn);
  console.log("Register Button Clicked");

  await page.waitFor(2000);

  try {
    // eslint-disable-next-line no-unused-vars
    const balanceCallback = balance => {};
    const errorCallback = errorMessage => {
      throw new Error(errorMessage);
    };

    const numberCallback = async phoneNum => {
      if (isNaN(phoneNum)) {
        throw new Error(phoneNum.charAt(0).toUpperCase() + phoneNum.slice(1));
      }
      if (phoneNum.startsWith("86") && phoneNum.length > 10) {
        phoneNum = phoneNum.slice(2, phoneNum.length);
      }
      console.log("Phone number: " + phoneNum);
      console.log("waiting 5s");
      await page.waitFor(5000);
      console.log("waiting done");

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

      await sleep(3000);
      // await page.screenshot({
      //   path: `${user.firstName}.${user.lastName} after sent sms.png`
      // });

      io.sockets.emit("CreateLog", {
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

      io.sockets.emit("CreateLog", {
        index: user.tableIndex,
        code: 2,
        message: "Enter SMS code"
      });
    };

    await smsProvider.doProcess(
      { country: "CN", token: sms.token, username: sms.username },
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
    }

    io.sockets.emit("CreateLog", {
      index: user.tableIndex,
      code: 3,
      message: errMessage
    });
    return;
  }

  console.log("waiting 8s");
  await sleep(8000);
  console.log("waiting done");

  // await page.screenshot({
  //   path: `${user.firstName}.${user.lastName} after login.png`
  // });

  io.sockets.emit("CreateLog", {
    index: user.tableIndex,
    code: 3,
    message: "SMS code success"
  });

  await page.type(fName, user.firstName);
  await sleep(500);
  await page.type(sName, user.lastName);
  await sleep(500);
  await page.type(password, user.password);
  await sleep(500);
  await page.click(gender);

  await page.click(submit);
  console.log("submited name and password");

  io.sockets.emit("CreateLog", {
    index: user.tableIndex,
    code: 4,
    message: "Inputing details"
  });

  console.log("waiting 8s");
  await sleep(8000);
  console.log("waiting done");

  // await page.screenshot({
  //   path: `${user.firstName}.${user.lastName} before email.png`
  // });

  console.log("email: " + user.email);
  await page.type(email, user.email);

  io.sockets.emit("CreateLog", {
    index: user.tableIndex,
    code: 5,
    message: "Filling email"
  });

  await page.click(submitEmail);
  console.log("submit email");

  console.log("waiting 8s");
  await sleep(8000);
  console.log("waiting done");

  await page.waitFor(dob, 3000);
  await page
    .type(
      dob,
      "01/02/19" + Math.floor(Math.random() * (99 - 55) + 55).toString()
    )
    .catch(err => {
      console.log("Email duplicates");
      console.log(err);
    });

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

  fs.appendFile("VerifiedAccounts.txt", "\n" + userpass, err => {
    if (err) throw err;
    console.log("Added User/Pass To VerifiedAccounts.txt!");
  });

  console.log("waiting for 8s");
  await sleep(8000);
  console.log("waiting done");
};

module.exports = {
  doCreate
};
