// smspva
const axios = require("axios");
// price
const prices = {
  UK: 1,
  US: 0.75
};

let respTxt = "API KEY Incorrect";

const errorCodes = {
  2: "Numbers are already taken, try to get a number again in 60 seconds. ",
  5: " You have exceeded the number of requests per minute",
  6: "You will be banned for 10 minutes, because scored negative karma",
  7: "You have exceeded the number of concurrent streams. SMS Wait from previous orders"
};
let token = "oG3bjxrWLS6cSD1iEUh40ERVbNkLCb";
const host =
  "https://smspva.com/priemnik.php?apikey=" + token + "&service=opt86&metod=";

class SMSPvaError extends Error {
  constructor(action = "default", code = "2", ...params) {
    // Pass remaining arguments (including vendor specific ones) to parent constructor
    super(...params);

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, SMSPvaError);
    }

    this.name = "SMSPvaError";
    // Custom debugging information
    this.action = action;
    this.code = code;
    this.date = new Date();
  }
}

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

const getData = async (action, params) => {
  console.log(host + action + params);
  const response = await axios(host + action + params);
  const json = response.data; // Try to parse it as json
  // Do your JSON handling here

  if (json.response === "1") {
    console.log(">>> Success with | " + action + " |");
    return json;
  } else if (json.response === "2" && action === "get_sms") {
    console.log("Waiting for message");
    return null;
  }
  throw new SMSPvaError(action, json.response, "Unexpected response code");
};

const doProcess = async (
  requestDetails,
  balanceCallback,
  numberCallback,
  smsCallback,
  errorCallback
) => {
  try {
    const country = requestDetails.country;
    token = requestDetails.token;

    console.log("> Request Details: ");
    console.log(requestDetails);

    let resp;

    if (balanceCallback) {
      resp = await getData("get_balance", "");
      console.log("Balance: " + resp.balance);

      if (parseInt(resp.balance) < prices[country])
        throw new Error("Low balance");
      await balanceCallback(resp);
    }

    await sleep(500);
    resp = await getData("get_number", "&country=" + country);
    await numberCallback(resp.number);
    const requestNumberId = resp.id;

    await sleep(30000);
    resp = await getData(
      "get_sms",
      "&country=" + country + "&id=" + requestNumberId
    );

    if (!resp) {
      await sleep(12000);
      resp = await getData(
        "get_sms",
        "&country=" + country + "&id=" + requestNumberId
      );
    }

    await smsCallback(resp.sms);
  } catch (e) {
    console.log(e);
    if (e instanceof SyntaxError) {
      console.log("Catched SyntaxError:");
      errorCallback(respTxt);
    } else if (e instanceof SMSPvaError) {
      console.log("Catched SMSPvaError: " + e.message);

      if (e.action.includes("get_sms")) {
        errorCallback("SMS hasn't found yet");
      } else if (e.action.includes("get_number")) {
        errorCallback("Low balance");
      } else {
        errorCallback(errorCodes[parseInt(e.code)]);
      }
    } else if (e instanceof Error) errorCallback(e.message);
    else errorCallback(e.message);
  }
};

module.exports = {
  doProcess
};
