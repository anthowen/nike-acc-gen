// smspva
const axios = require("axios");
// price
const prices = {
  UK: 3,
  US: 3,
  CN: 3
};

const appNames = {
  UK: "NikeUK",
  US: "Nike",
  CN: "Nikecn"
};

const countryNames = {
  UK: "UK",
  US: "USA",
  CN: "China"
};

let respTxt = "Customer Not Found.";
let customerString = ".php?customer=10905b183e62747505885";

const host = "https://pvacodes.com/user/api/";

class PVACodesError extends Error {
  constructor(action = "default", ...params) {
    // Pass remaining arguments (including vendor specific ones) to parent constructor
    super(...params);

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, PVACodesError);
    }

    this.name = "PVACodesError";
    // Custom debugging information
    this.action = action;
    this.date = new Date();
  }
}

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

const getData = async (action, params) => {
  const response = await axios(host + action + customerString + params);
  const json = response.data; // Try to parse it as json
  // Do your JSON handling here

  console.log(json);
  if (json) {
    console.log(">>> Success with | " + action + " |");
    return json;
  }
  throw new PVACodesError(action, "Response is null.");
};

const serviceExpired = dt => new Date() > new Date(dt);

const doProcess = async (
  requestDetails,
  balanceCallback,
  numberCallback,
  smsCallback,
  errorCallback
) => {
  try {
    const country = requestDetails.country;
    customerString = ".php?customer=" + requestDetails.token;

    console.log("> Request Details: ");
    console.log(requestDetails);

    let resp;
    if (balanceCallback) {
      resp = await getData("get_balance", "");
      console.log("Balance: " + resp.balance);
      console.log("Expiry Date: " + resp.expiry_date);

      if (parseInt(resp.balance) < prices[country])
        throw new Error("Low balance");
      if (serviceExpired(resp.expiry_date)) throw new Error("Service expired");
      await balanceCallback(resp);
    }

    await sleep(500);
    resp = await getData(
      "get_number",
      "&country=" + countryNames[country] + "&app=" + appNames[country]
    );

    if (isNaN(resp)) throw new Error(resp);
    await numberCallback(resp);

    console.log("Getting Text Message: 30s wait");
    await sleep(30000);
    resp = await getData(
      "get_sms",
      "&country=" +
        countryNames[country] +
        "&app=" +
        appNames[country] +
        "&number=" +
        resp
    );

    // Example: 784549
    if (isNaN(resp)) throw new Error(resp);
    await smsCallback(resp);
  } catch (e) {
    console.log(e);
    if (e instanceof SyntaxError) {
      console.log("Catched SyntaxError:");
      console.log(respTxt);
      errorCallback(respTxt);
      // No free channels available check after sometime.
    } else if (e instanceof PVACodesError) {
      console.log("Catched PVACodesError: ");

      console.log(" > Action: " + e.action);
      console.log(" > Message: " + e.message);
      errorCallback(e.message);
    } else {
      console.log(e.message);
      errorCallback(e.message);
    }
  }
};

module.exports = {
  doProcess
};
