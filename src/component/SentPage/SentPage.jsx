import { CheckCircleFilled, LoadingOutlined } from "@ant-design/icons"
import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { getTwilioMessage } from "../../js/getTwilioMessages"
import { ErrorLabel } from "../ErrorLabel/ErrorLabel"
import { Layout } from "../Layout/Layout"
import { MessageInfo } from "../MessageInfo/MessageInfo"

/**
 * @typedef {import("../../js/types").Message} Message
 */

/**
 *
 * @param {Object} props
 * @param {Message} props.message
 */
const MessagePanel = ({ message }) => {
  const navigate = useNavigate()

  console.log("SW what is message", message);

  return (
    <>
      <MessageInfo message={message} />
      <div className="mt-4 text-right space-x-4">
        <button onClick={() => navigate(`/conversation/${message.from}/${message.to}`)}>See Conversation</button>
      </div>
    </>
  )
}

export const SentPage = () => {
  const { messageSid } = useParams()
  const [message, setMessage] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    getTwilioMessage(messageSid)
      .then(setMessage)
      .catch(setError)
      .finally(() => setLoading(false))
  }, [setMessage])

  return (
    <Layout>
      <h3>
        <CheckCircleFilled className="text-green-600" /> Message Sent
      </h3>
      <ErrorLabel error={error} />
      <p className="my-4">Your message has been sent.</p>
      {loading && (
        <p className="mt-10 text-purple-900 text-5xl text-center">
          <LoadingOutlined />
        </p>
      )}
      {!loading && <MessagePanel message={message} />}
    </Layout>
  )
}
