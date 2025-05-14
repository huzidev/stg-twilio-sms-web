import axios from "axios"
import { toCredentials } from "../context/AuthenticationProvider"
import { MessageDirection } from "./types"

/**
 * @typedef {import('./types').Message} Message
 */

const toMessage = (v = {}) => ({
  messageSid: v.sid,
  direction: v.direction.includes("inbound") ? MessageDirection.received : MessageDirection.sent,
  from: v.from,
  to: v.to,
  date: v.date_created,
  status: v.status,
  body: v.body,
  media: parseInt(v.num_media),
})

export const sortByDate = (a, b) => (Date.parse(a.date) > Date.parse(b.date) ? -1 : 1)

/**
 * @param {string} phoneNumber
 * @returns {Array<Message>}
 */

const ACCOUNT_SID = import.meta.env.VITE_ACCOUNT_SID
const AUTH_TOKEN = import.meta.env.VITE_AUTH_TOKEN

export const getTwilioMessagesByPhoneNumber = async phoneNumber => {
  const credentials = toCredentials(ACCOUNT_SID, AUTH_TOKEN)
  const url = `https://api.twilio.com/2010-04-01/Accounts/${ACCOUNT_SID}/Messages.json`
  const fromResult = await axios.get(url, {
    auth: credentials,
    params: { From: phoneNumber },
  })
  const toResult = await axios.get(url, {
    auth: credentials,
    params: { To: phoneNumber },
  })
  return [].concat(fromResult.data.messages).concat(toResult.data.messages).map(toMessage).sort(sortByDate)
}

/**
 * @returns {Promise<Array<Message>>}
 */
export const getTwilioMessages = async (from = "", to = "") => {
  const credentials = toCredentials(ACCOUNT_SID, AUTH_TOKEN)
  const url = `https://api.twilio.com/2010-04-01/Accounts/${ACCOUNT_SID}/Messages.json`

  const params = {}
  if (to.length > 0) {
    params.To = to
  }

  if (from.length > 0) {
    params.From = from
  }

  const response = await axios.get(url, {
    auth: credentials,
    params,
  })

  return response.data.messages.map(toMessage).sort(sortByDate)
}

/**
 * @returns {Promise<Message>}
 */
export const getTwilioMessage = async (messageSid = "") => {
  const credentials = toCredentials(ACCOUNT_SID, AUTH_TOKEN)
  const url = `https://api.twilio.com/2010-04-01/Accounts/${ACCOUNT_SID}/Messages/${messageSid}.json`

  const response = await axios.get(url, {
    auth: credentials,
  })

  return toMessage(response.data)
}
