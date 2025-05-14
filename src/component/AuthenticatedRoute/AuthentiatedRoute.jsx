import { Navigate } from "react-router-dom"

export const AuthenticatedRoute = ({ children }) => {
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true"

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />
  }

  return children
}
