// smspva
const nodeFetch = require("node-fetch");
// price
const prices = {
  UK: 1,
  US: 0.75
};

const country = "UK";
let respTxt = "API KEY Incorrect";

const errorCodes = {
  2: "numbers are already taken, try to get a number again in 60 seconds. ",
  5: " You have exceeded the number of requests per minute",
  6: "You will be banned for 10 minutes, because scored negative karma",
  7: "You have exceeded the number of concurrent streams. SMS Wait from previous orders"
};
const token = "oG3bjxrWLS6cSD1iEUh40ERVbNkLCb";
const host =
  "http://smspva.com/priemnik.php?apikey=" + token + "&service=opt86&metod=";

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
  const response = await nodeFetch(host + action + params);
  respTxt = await response.text(); // Parse it as text
  const json = JSON.parse(respTxt); // Try to parse it as json
  // Do your JSON handling here

  if (json.response === "1") {
    console.log(">>> Success with | " + action + " |");
    return json;
  }
  throw new SMSPvaError(action, json.response, "Unexpected response code");
};

(async () => {
  try {
    let resp = await getData("get_balance", "");
    console.log("Balance: " + resp.balance);

    if (parseInt(resp.balance) < prices[country])
      throw new Error("Low balance");

    await sleep(500);
    resp = await getData("get_number", "&country=" + country);
    console.log("Phone number : ", resp.number);

    await sleep(500);
    resp = await getData("get_sms", "&country=" + country + "&id=" + resp.id);

    console.log("SMS received : " + resp.sms);
  } catch (e) {
    if (e instanceof SyntaxError) {
      console.log("Catched SyntaxError:");
      console.log(respTxt);
    } else if (e instanceof SMSPvaError) {
      console.log("Catched SMSPvaError: " + e.message);

      if (e.action.includes("get_sms")) {
        console.log("SMS hasn't found yet");
      } else {
        console.log(errorCodes[e.code]);
      }
    } else if (e instanceof Error) console.log(e.message);
  }
})();
