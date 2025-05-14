import axios from "axios"
import { toCredentials } from "../context/AuthenticationProvider"

const cache = new Map()

/**
 * @param {string} messageSid
 * @returns {Promise<string>} public url for the media
 */

const ACCOUNT_SID = import.meta.env.VITE_ACCOUNT_SID
const AUTH_TOKEN = import.meta.env.VITE_AUTH_TOKEN

export const getTwilioMedia = async messageSid => {
  if (cache.has(messageSid)) {
    return cache.get(messageSid)
  }

  let result = []
  const url = `https://api.twilio.com/2010-04-01/Accounts/${ACCOUNT_SID}/Messages/${messageSid}/Media.json`
  const response = await axios.get(url, {
    auth: toCredentials(ACCOUNT_SID, AUTH_TOKEN),
  })
  if (response?.data?.media_list?.length > 0) {
    result = response.data.media_list.map(m => {
      const suffix = m.uri.substring(0, m.uri.indexOf(".json"))
      return `https://api.twilio.com/${suffix}`
    })
  }
  cache.set(messageSid, result)
  return result
}
