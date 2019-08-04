const fs = require("fs");

var userpass;

//GET DOM TRAVERSAL VALUES
// const AcceptCookies =
//   "#cookie-settings-layout > div > div > div > div.ncss-row.mt5-sm.mb7-sm > div:nth-child(2) > button";
const loginBtn = "li.member-nav-item.d-sm-ib.va-sm-m > button";
const registerBtn = ".loginJoinLink.current-member-signin > a";
const email = 'input[type="email"]';
const password = 'input[type="password"]';
const fName = '.firstName.nike-unite-component.empty > input[type="text"]';
const sName = '.lastName.nike-unite-component.empty > input[type="text"]';
const dob = 'input[type="date"]';
const gender = 'li:nth-child(1) > input[type="button"]';
const submit = '.joinSubmit.nike-unite-component > input[type="button"]';

//Create Sleep function to use in Async/Await function
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

let doCreate = async (page, io, user) => {
  // page.on("console", msg => {
  //   for (let i = 0; i < msg.args().length; ++i)
  //     console.log(`Console log from page; ${i}: ${msg.args()[i]}`);
  // });

  let country = "";
  if (user.country === "United Kingdom") country = "gb";

  console.log(`The ${user.country} bot is starting...`);

  await page.setViewport({ width: 1200, height: 800 });
  await page.goto(`https://www.nike.com/${country}/launch/`);

  // await page.click(AcceptCookies);
  // console.log("Accepted Cookies...");

  io.sockets.emit("CreateLog", "Web page opened");
  await page.waitFor(1000);

  await page.click(loginBtn);
  console.log("Login Button Clicked...");

  await page.click(registerBtn);
  console.log("Register Button Clicked");

  await page.waitFor(2000);

  io.sockets.emit("CreateLog", {
    index: user.tableIndex,
    code: 1,
    message: "Filling in details"
  });

  console.log("email: " + user.email);
  await page.type(email, user.email);

  console.log("password: " + user.password);
  await page.type(password, user.password);

  io.sockets.emit("CreateLog", {
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

  io.sockets.emit("CreateLog", {
    index: user.tableIndex,
    code: 3,
    message: "Firing submit"
  });

  await page.click(submit);
  console.log("submitting");

  io.sockets.emit("CreateLog", {
    index: user.tableIndex,
    code: 4,
    message: "Submitted"
  });

  await page.waitFor(8000);

  const submitError = await page.evaluate(() =>
    document.querySelector(".invalid div.error")
      ? document.querySelector(".invalid div.error").innerHTML
      : null
  );

  if (!submitError) {
    userpass = user.email + ":" + user.password;
    console.log(userpass);

    fs.appendFile("Accounts.txt", "\n" + userpass, err => {
      if (err) throw err;
      console.log("Added User/Pass To Accounts.txt!");
    });
    io.sockets.emit("CreateLog", {
      index: user.tableIndex,
      code: 5,
      message: "Credential saved"
    });

    await sleep(2000);

    io.sockets.emit("CreateLog", {
      index: user.tableIndex,
      code: 6,
      message: "Account created"
    });
  } else {
    console.log(submitError);
    io.sockets.emit("CreateLog", {
      index: user.tableIndex,
      code: 3,
      message: "Error occured"
    });
  }
};

module.exports = {
  doCreate
};
