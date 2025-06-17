import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"
dayjs.extend(relativeTime)

/**
 *
 * @param {Date | null | undefined} date
 * @returns {string | null} Time from now
 */
export const fromNow = date => {
  if (!date) return null
  return dayjs(date).fromNow()
}

export const copyToClipboard = s =>
  navigator.clipboard
    .writeText(s)
    .then(() => console.log("Text copied", s))
    .catch(() => console.log("Unable to copy to clipboard"))

// Starts with plus followed by at least 10 to 15 digits
// export const phonePattern = "^\\+\\d{11,}$"
export const phonePattern = "^\\+\\d{10,15}$";
