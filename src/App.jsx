import { HashRouter, Route, Routes } from "react-router-dom"

import Login from "./component/Auth/Login"
import { AuthenticatedRoute } from "./component/AuthenticatedRoute/AuthentiatedRoute"
import { ConversationPage } from "./component/ConversationPage/ConversationPage"
import { InboxPage } from "./component/InboxPage/InboxPage"
import { MessagePage } from "./component/MessagePage/MessagePage"
import { NotFoundPage } from "./component/NotFoundPage/NotFoundPage"
import { SendBulkPage } from "./component/SendBulkPage/SendBulkPage"
import { SendPage } from "./component/SendPage/SendPage"
import { SentPage } from "./component/SentPage/SentPage"
import { UiPage } from "./component/UiPage/UiPage"
import { AuthenticationProvider } from "./context/AuthenticationProvider"
import { ComposerProvider } from "./context/ComposerProvider"

export const App = () => {
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true"

  console.log("SW is user logged in:", isLoggedIn)

  return (
    <div className="h-full">
      <AuthenticationProvider>
        <ComposerProvider>
          <HashRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              {/* <Route
                path="/"
                element={
                  <AuthenticatedLoggedInRoute>
                    <AuthenticationPage />
                  </AuthenticatedLoggedInRoute>
                }
              />
              <Route
                path="/authentication"
                element={
                  <AuthenticatedLoggedInRoute>
                    <AuthenticationPage />
                  </AuthenticatedLoggedInRoute>
                }
              />
              <Route
                path="/authentication-token"
                element={
                  <AuthenticatedLoggedInRoute>
                    <AuthenticationAuthTokenPage />
                  </AuthenticatedLoggedInRoute>
                }
              />
              <Route
                path="/authentication-api-key"
                element={
                  <AuthenticatedLoggedInRoute>
                    <AuthenticationApiKeyPage />
                  </AuthenticatedLoggedInRoute>
                }
              /> */}

              <Route
                path="/"
                element={
                  <AuthenticatedRoute>
                    <InboxPage />
                  </AuthenticatedRoute>
                }
              />

              <Route
                path="/inbox"
                element={
                  <AuthenticatedRoute>
                    <InboxPage />
                  </AuthenticatedRoute>
                }
              />
              <Route
                path="/message/:messageSid"
                element={
                  <AuthenticatedRoute>
                    <MessagePage />
                  </AuthenticatedRoute>
                }
              />
              <Route
                path="/sent/:messageSid"
                element={
                  <AuthenticatedRoute>
                    <SentPage />
                  </AuthenticatedRoute>
                }
              />
              <Route
                path="/conversation/:from/:to"
                element={
                  <AuthenticatedRoute>
                    <ConversationPage />
                  </AuthenticatedRoute>
                }
              />
              <Route
                path="/send"
                element={
                  <AuthenticatedRoute>
                    <SendPage />
                  </AuthenticatedRoute>
                }
              />
              <Route
                path="/send-bulk"
                element={
                  <AuthenticatedRoute>
                    <SendBulkPage />
                  </AuthenticatedRoute>
                }
              />
              <Route
                path="/send/:from/:to"
                element={
                  <AuthenticatedRoute>
                    <SendPage />
                  </AuthenticatedRoute>
                }
              />
              <Route path="/ui" element={<UiPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </HashRouter>
        </ComposerProvider>
      </AuthenticationProvider>
    </div>
  )



}
