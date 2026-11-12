import { Container, Spinner } from "react-bootstrap";
import { useAuth } from "../contexts/AuthContext";
import LoginPage from "./LoginPage";

export default function AuthGate({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <Container
        className="d-flex align-items-center justify-content-center"
        style={{ minHeight: "100vh" }}
      >
        <Spinner animation="border" />
      </Container>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  return children;
}