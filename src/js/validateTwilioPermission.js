import axios from "axios"
import { Authentication, toCredentials } from "../context/AuthenticationProvider"
import { buildUrl } from "./getTwilioPhoneNumbers"

/**
 * We want to get phone numbers after sign-in because at minimum we want to know
 * if the Authentication have permissions for it before moving forward
 *
 * TODO: Get a list of permissions from Twilio and controll what the user may or may not do.
 *
 * @param {Authentication} authentication
 */

const ACCOUNT_SID = import.meta.env.VITE_ACCOUNT_SID
const AUTH_TOKEN = import.meta.env.VITE_AUTH_TOKEN

export const validatePermission = async (authentication = new Authentication()) => {
  await axios.get(buildUrl(ACCOUNT_SID), {
    auth: toCredentials(ACCOUNT_SID, AUTH_TOKEN),
  })
}
