import { Loading3QuartersOutlined } from "@ant-design/icons"
import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useAuthentication } from "../../context/AuthenticationProvider"
import { getTwilioPhoneNumbers } from "../../js/getTwilioPhoneNumbers"
import { sendTwilioMessage } from "../../js/sendTwilioMessage"
import { phonePattern } from "../../js/util"
import { ErrorLabel } from "../ErrorLabel/ErrorLabel"
import { Layout } from "../Layout/Layout"
import { PhoneCombobox } from "../PhoneCombobox/PhoneComboox"
import Papa from "papaparse";

export const SendBulkPage = () => {
  const { from: fromParam, to: toParam } = useParams()
  const [phoneNumbers, setPhoneNumbers] = useState([])
  const [from, setFrom] = useState(fromParam ?? "")
  const [to, setTo] = useState(toParam ?? "")
  const [message, setMessage] = useState("")
  const [loadingPhoneNumbers, setLoadingPhoneNumbers] = useState(true)
  const [sendingMessage, setSendingMessage] = useState(false)
  const [error, setError] = useState(null)
  const [csvFile, setCsvFile] = useState(null)
  const [extractedPhoneNumbers, setExtractedPhoneNumbers] = useState([])
  const [processingCsv, setProcessingCsv] = useState(false)
  const [authentication] = useAuthentication()
  const navigate = useNavigate()

  useEffect(() => {
    getTwilioPhoneNumbers()
      .then(setPhoneNumbers)
      .catch(setError)
      .finally(() => setLoadingPhoneNumbers(false))
  }, [])

  const handleCsvFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
  
    setProcessingCsv(true);
    setCsvFile(file);
  
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const phoneColumnNames = ["phone", "mobile", "number", "contact"];
        const phoneNumbersSet = new Set();
  
        results.data.forEach((row) => {
          for (const key of Object.keys(row)) {
            if (phoneColumnNames.includes(key.toLowerCase())) {
              const rawValue = row[key];
              if (rawValue) {
                const candidates = rawValue.split(/[\n,;]/);
                candidates.forEach((number) => {
                  const cleaned = number.replace(/\D/g, "");
                  if (cleaned.length >= 10) {
                    // Prepend + if not present
                    const formatted = cleaned.startsWith("+" ) ? cleaned : `+${cleaned}`;
                    phoneNumbersSet.add(formatted);
                  }
                });
              }
            }
          }
        });
  
        const extracted = Array.from(phoneNumbersSet);
        setExtractedPhoneNumbers(extracted);
        setTo(extracted.join(", "));
        setProcessingCsv(false);
      },
      error: (err) => {
        setError("Failed to parse CSV file.");
        console.error(err);
        setProcessingCsv(false);
      },
    });
  };

  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  const handleSend = async () => {
    if (sendingMessage) return;

    setSendingMessage(true);
    setError(null);

    const recipients = extractedPhoneNumbers.length > 0 ? extractedPhoneNumbers : [to];

    try {
      if (recipients.length === 1) {
        const messageSid = await sendTwilioMessage(authentication, recipients[0], from, message);
        navigate(`/sent/${messageSid}`);
      } else {
        const messageSids = [];

        for (let i = 0; i < recipients.length; i++) {
          const recipient = recipients[i];

          try {
            const sid = await sendTwilioMessage(authentication, recipient, from, message);
            messageSids.push({ recipient, sid });
          } catch (err) {
            console.error(`Failed to send to ${recipient}:`, err);
            messageSids.push({ recipient, sid: null, error: true });
          }

          if ((i + 1) % 10 === 0 && i !== recipients.length - 1) {
            await delay(3000);
          }
        }

        navigate(`/inbox`);
      }
    } catch (err) {
      setError("Failed to send message.");
      console.error(err);
    } finally {
      setSendingMessage(false);
    }
  };

  const isValid = () => {
    const isValidFrom = phoneNumbers.includes(from);
    const isValidMessage = message.length > 0 && message.length < 1001;
  
    const pattern = new RegExp(phonePattern);
  
    if (sendingMessage || !isValidFrom || !isValidMessage) {
      return false;
    }
  
    const hasCsvRecipients = extractedPhoneNumbers.length > 0;
  
    if (hasCsvRecipients) {
      const allValid = extractedPhoneNumbers.every(num => pattern.test(num));
      return allValid;
    }
  
    return pattern.test(to);
  };

  const updatePhoneNumbersFromText = (text) => {
    const numbers = text
      .split(",")
      .map(n => n.trim().replace(/\D/g, ""))
      .filter(n => n.length >= 10);
  
    const formatted = numbers.map(n =>
      n.startsWith("+") ? n : `+${n}`
    );
  
    setExtractedPhoneNumbers(formatted);
  };

  const handleToOnChange = e => {
    const val = e.target.value
    setTo(val)

    if (extractedPhoneNumbers.length > 0 || val.includes(",")) {
      updatePhoneNumbersFromText(val)
    } else if (!val.includes(",")) {
      const cleaned = "+" + val.replace(/\D/g, "")
      setTo(cleaned)
    }
  }

  const clearCsvData = () => {
    setCsvFile(null)
    setExtractedPhoneNumbers([])
    setTo("")
    setError(null)
  }

  const hint = `Send a message from ${from === "" ? "?" : from} to ${
    extractedPhoneNumbers.length > 0 ? `${extractedPhoneNumbers.length} recipients from CSV` : to === "" ? "?" : to
  }`
  return (
    <Layout>
      <h3>Send</h3>
      <p className="my-4">Select phone number to send a message from.</p>
      <ErrorLabel error={error} className="mb-4" />
      <div className="flex items-center">
        <label className="w-14">From:</label>
        <PhoneCombobox
          initial={from}
          options={phoneNumbers}
          onSelect={setFrom}
          loading={loadingPhoneNumbers}
          disabled={sendingMessage}
        />
      </div>
      <div className="flex items-center mt-2">
        <label className="w-14">To:</label>
        <div className="flex-1">
          {" "}
          <input
            type="tel"
            value={to}
            pattern={phonePattern}
            onChange={handleToOnChange}
            disabled={sendingMessage}
            placeholder={
              extractedPhoneNumbers.length > 0
                ? "Edit phone numbers (comma separated)"
                : "Enter phone number or upload CSV file"
            }
            className="w-full"
          />{" "}
          {extractedPhoneNumbers.length > 0 && (
            <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg text-sm shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <span className="font-semibold text-gray-800">
                Phone Numbers ({extractedPhoneNumbers.length} total)
              </span>
              <button
                onClick={clearCsvData}
                disabled={sendingMessage}
              >
                Clear All
              </button>
            </div>
          
            <div className="max-h-32 overflow-y-auto text-xs bg-white p-2 rounded border border-gray-300 font-mono whitespace-pre-wrap leading-5">
              {extractedPhoneNumbers.join(", ")}
            </div>
          
            <p className="text-xs text-gray-500 mt-2">
              You can edit the phone numbers in the input field above (comma separated).
            </p>
          </div>
          )}
        </div>
      </div>
      <div className="flex items-center mt-2">
        <label className="w-14">CSV File:</label>
        <div className="flex-1">
          <input
            type="file"
            accept=".csv"
            onChange={handleCsvFileChange}
            disabled={sendingMessage}
            className="w-full"
          />
          {processingCsv && (
            <div className="mt-1 text-sm text-blue-600">
              <Loading3QuartersOutlined spin="true" /> Processing CSV file...
            </div>
          )}{" "}
          <div className="text-xs text-gray-500 mt-1">
            Upload a CSV file with a column containing phone numbers (Phone, Mobile, Number, etc.) like +14145816778,
            14145816778, or (414) 581-6778
          </div>
        </div>
      </div>
      <textarea
        className="w-full mt-2 p-2"
        placeholder={hint}
        onChange={i => setMessage(i.target.value)}
        minLength="1"
        maxLength="1000"
        disabled={sendingMessage}
        rows="5"
      ></textarea>
      <div className="flex justify-between text-xs font-thin mb-2">
        <p>Messages must be between 1 and 1000 characters.</p>
        <p>{message.length} / 1000</p>
      </div>{" "}
      <button className="float-right" onClick={handleSend} disabled={!isValid()}>
        {!sendingMessage &&
          (extractedPhoneNumbers.length > 0 ? `Send to ${extractedPhoneNumbers.length} recipients` : "Send")}
        {sendingMessage && <Loading3QuartersOutlined spin="true" />}
      </button>
    </Layout>
  )
}
