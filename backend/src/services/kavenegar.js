const axios = require("axios");

const API_KEY = process.env.KAVENEGAR_API_KEY;

async function sendOtp(mobile, code) {
  if (!API_KEY) {
    throw new Error("KAVENEGAR_API_KEY is not set");
  }

  // Adjust URL/params according to your Kavenegar panel settings
  const url = `https://api.kavenegar.com/v1/${API_KEY}/sms/send.json`;

  const params = {
    receptor: mobile,
    message: `کد ورود مینا کافه: ${code}`,
    sender: "", // optional: default sender from panel
  };

  const response = await axios.post(url, null, { params });
  return response.data;
}

module.exports = {
  sendOtp,
};


