import axios from "axios"
import { isEmpty } from "lodash"
import { Authentication, getAuthentication, toCredentials } from "../context/AuthenticationProvider"

const ACCOUNT_SID = import.meta.env.VITE_ACCOUNT_SID
const AUTH_TOKEN = import.meta.env.VITE_AUTH_TOKEN

export const buildUrl = (accountSid = "", pageSize = 8, pageNumber = 0) =>
  `https://api.twilio.com/2010-04-01/Accounts/${ACCOUNT_SID}/IncomingPhoneNumbers.json?Beta=false&PageSize=${pageSize}&Page=${pageNumber}`

/**
 * Represents a collection of incoming phone numbers and pagination details.
 * @typedef {Object} TwilioPhoneNumberResponse
 * @property {string} first_page_uri - The URI of the first page of the incoming phone numbers list.
 * @property {number} end - The position of the last item on the current page.
 * @property {string|null} previous_page_uri - The URI of the previous page, if available.
 * @property {IncomingPhoneNumber[]} incoming_phone_numbers - A list of incoming phone numbers.
 */

/**
 * Represents a single incoming phone number and its details.
 * @typedef {Object} IncomingPhoneNumber
 * @property {string} origin - The origin of the phone number.
 * @property {string} status - The current status of the phone number.
 * @property {Capabilities} capabilities - The capabilities of the phone number.
 * @property {string} phone_number - The phone number in E.164 format.
 */

/**
 * Represents the capabilities of a phone number.
 * @typedef {Object} Capabilities
 * @property {boolean} fax - Indicates if fax is supported.
 * @property {boolean} voice - Indicates if voice is supported.
 * @property {boolean} sms - Indicates if SMS is supported.
 * @property {boolean} mms - Indicates if MMS is supported.
 */

/**
 * @param {Authentication} [authentication]
 * @param {Number} [pageSize]
 * @param {Array<string>} [accumulator]
 * @returns {Promise<Array<TwilioPhoneNumberResponse>>}
 */
const getTwilioPhoneNumbersResursively = async (
  authentication = new Authentication(),
  pageSize = 50,
  accumulator = [],
) => {
  const currentPage = await axios.get(buildUrl(ACCOUNT_SID, pageSize, accumulator.length), {
    auth: toCredentials(ACCOUNT_SID, AUTH_TOKEN),
  })
  const pages = [...accumulator, currentPage]

  const nextPage = currentPage?.data?.next_page_uri
  const phoneNumbersLength = currentPage?.data?.incoming_phone_numbers?.length ?? 0
  if (nextPage && phoneNumbersLength > 0) {
    return getTwilioPhoneNumbersResursively(authentication, pageSize, pages)
  }

  return pages
}

let cache = []
/**
 * @returns {Promise<Array<string>>}
 */
export const getTwilioPhoneNumbers = async () => {
  if (isEmpty(cache)) {
    const response = await getTwilioPhoneNumbersResursively(getAuthentication())
    cache = response
      .flatMap(r => r?.data?.incoming_phone_numbers)
      .filter(pn => pn?.capabilities?.sms)
      .map(pn => pn?.phone_number)
      .sort()
    return cache
  }
  return cache
}
