// smsaccs
const axios = require("axios");
// price
const prices = {
  uk: 0.3,
  us: 0.5,
  cn: 0.4
};

let token =
  "b849f583ff3b8321648d5381cce7c3904c0f86505923390224511c7fb6bf96c05d5806f1";
const host =
  "http://www.smsaccs.com/api/v1/?token=" + token + "&service=nike&action=";

class SMSAccsError extends Error {
  constructor(action = "default", ...params) {
    // Pass remaining arguments (including vendor specific ones) to parent constructor
    super(...params);

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, SMSAccsError);
    }

    this.name = "SMSAccsError";
    // Custom debugging information
    this.action = action;
    this.date = new Date();
  }
}

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

const getData = async (action, params) => {
  const response = await axios(host + action + params);
  const json = response.data; // Try to parse it as json
  // Do your JSON handling here
  if (json.status === 200) {
    console.log(">>> Success with | " + action + " |");
    return json;
  }
  throw new SMSAccsError(action, json.msg);
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
      console.log("Balance: " + resp.msg);

      if (parseInt(resp.msg) < prices[country]) throw new Error("Low balance");
      balanceCallback(resp);
    }

    await sleep(500);
    resp = await getData("get_number", "&country=" + country);

    await numberCallback(resp.fullNumber);
    console.log("Phone number : ", resp.fullNumber);

    await sleep(30000);
    resp = await getData(
      "get_sms",
      "&number=" + resp.fullNumber + "&id=" + resp.id
    );

    if (resp.msg && resp.msg.includes("Waiting for")) {
      throw new Error(resp.msg);
    } else {
      const parse = require("parse-otp-message");
      const result = parse(resp.code);

      if (result && result.code) {
        console.log("SMS received : " + result.code);
        await smsCallback(result.code);
      } else {
        throw new Error(resp.code);
      }
    }
  } catch (e) {
    if (e instanceof SMSAccsError) {
      console.log("Catched SMSAccsError: ");
      console.log(" > Action: " + e.action);
      console.log(" > Message: " + e.message);
    } else if (e instanceof Error) {
      console.log(e.message);
    } else {
      console.log(e.message);
    }
    errorCallback(e.message);
  }
};

module.exports = {
  doProcess
};
