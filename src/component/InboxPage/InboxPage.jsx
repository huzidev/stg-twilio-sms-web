import { useEffect, useState } from "react"
import { getTwilioPhoneNumbers } from "../../js/getTwilioPhoneNumbers"
import { ErrorLabel } from "../ErrorLabel/ErrorLabel"
import { Layout } from "../Layout/Layout"
import { MessageRows } from "../MessageRows/MessageRows"
import { getMessages } from "./getMessages"
import { allPhones, MessageFilterEnum, Selector } from "./Selector"

export const InboxPage = () => {
  const [messages, setMessages] = useState([])
  const [phoneNumbers, setPhoneNumbers] = useState([])
  const [phoneNumber, setPhoneNumber] = useState(allPhones)
  const [loadingMessages, setLoadingMessages] = useState(true)
  const [loadingPhones, setLoadingPhones] = useState(true)
  const [messageFilter, setMessageFilter] = useState(MessageFilterEnum.all)
  const [error, setError] = useState(null)
  const [statusFilter, setStatusFilter] = useState("all")

  useEffect(() => {
    const run = async () => {
      setLoadingMessages(true)
      try {
        const ms = await getMessages(phoneNumber, messageFilter)
        setMessages(ms)
      } catch (e) {
        setError(e)
      } finally {
        setLoadingMessages(false)
      }
    }
    run()
  }, [phoneNumber, messageFilter])

  useEffect(() => {
    getTwilioPhoneNumbers()
      .then(setPhoneNumbers)
      .catch(setError)
      .finally(() => setLoadingPhones(false))
  }, [])

  return (
    <Layout>
      <h3>Inbox</h3>
      <p className="my-4">Your messages are displayed on this page, with the most recent ones at the top.</p>
      <ErrorLabel error={error} className="mb-4" />
      <div className="flex flex-wrap gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
          <Selector
            phoneNumbers={phoneNumbers}
            phoneNumber={phoneNumber}
            loading={loadingPhones}
            onMessageFilterChange={setMessageFilter}
            onPhoneNumberChange={setPhoneNumber}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Status Filter</label>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="border px-3 py-2 rounded-md text-sm"
          >
            <option value="all">All</option>
            <option value="delivered">Delivered</option>
            <option value="undelivered">Undelivered</option>
          </select>
        </div>
      </div>

      <MessageRows
        loading={loadingMessages}
        messages={statusFilter === "all" ? messages : messages.filter(msg => msg.status === statusFilter)}
      />
    </Layout>
  )
}
