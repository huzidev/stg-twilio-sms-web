import axios from "axios";
import { Authentication, toCredentials } from "../context/AuthenticationProvider";

const ACCOUNT_SID = import.meta.env.VITE_ACCOUNT_SID
const AUTH_TOKEN = import.meta.env.VITE_AUTH_TOKEN

console.log("SW what is ACCOUNT_SID,AUTH_TOKEN", ACCOUNT_SID, AUTH_TOKEN);

export const sendTwilioMessage = async (authentication = new Authentication(), to = "", from = "", body = "") => {
  const credentials = toCredentials(ACCOUNT_SID, AUTH_TOKEN)

  const data = new URLSearchParams()
  data.append("To", to)
  data.append("From", from)
  data.append("Body", body)

  const url = `https://api.twilio.com/2010-04-01/Accounts/${ACCOUNT_SID}/Messages.json`
  const response = await axios.post(url, data, {
    auth: credentials,
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  })
  return response.data.sid
}
