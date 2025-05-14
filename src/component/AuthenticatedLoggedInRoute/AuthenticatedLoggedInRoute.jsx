import { Navigate } from "react-router-dom"

export const AuthenticatedLoggedInRoute = ({ children }) => {
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true"

  if (!isLoggedIn) {
    return <Navigate to="/authentication" replace />
  }

  return children
}
