// getsmscode
const GetSMSCodeClient = require("getsmscode");
const parseOtpMessage = require("parse-otp-message");

// price
const prices = {
  US: 1,
  CN: 0.75
};

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

const doProcess = async (
  requestDetails,
  balanceCallback,
  numberCallback,
  smsCallback,
  errorCallback
) => {
  try {
    const client = new GetSMSCodeClient({
      username: requestDetails.username,
      token: requestDetails.token,
      domain: requestDetails.country === "US" ? "usa" : "china"
    });

    console.log("getsmscode requestDetails", requestDetails);

    await sleep(500);
    const number = await client.getNumber({
      service: "nike"
    });

    await numberCallback(number);

    await sleep(30000);
    let sms = await client.getSMS({
      service: "nike",
      number: number
    });

    if (sms.includes("Message")) {
      await sleep(15000);
      sms = await client.getSMS({
        service: "nike",
        number: number
      });
    }

    const result = parseOtpMessage(sms);
    if (result && result.code) {
      console.log("SMS received : " + result.code);
      await smsCallback(result.code);
    } else {
      throw new Error(sms);
    }
  } catch (e) {
    console.log(e);
    errorCallback(e.message);
  }
};

module.exports = {
  doProcess
};
