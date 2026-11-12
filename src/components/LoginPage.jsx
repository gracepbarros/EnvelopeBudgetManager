import {
  Card,
  Container,
} from "react-bootstrap";
import Footer from "./Footer";
import GoogleAuthButtons from "./GoogleAuthButtons";

export default function LoginPage() {
  return (
    <div className="d-flex flex-column min-vh-100 bg-light">
      <Container
        className="d-flex flex-grow-1 align-items-center justify-content-center py-5"
        style={{ maxWidth: "560px" }}
      >
        <Card className="border-0 shadow-sm w-100 rounded-4">
          <Card.Body className="p-4 p-md-5">
            <div className="text-center mb-5">
              <div
                className="d-inline-flex align-items-center justify-content-center bg-success text-white rounded-4 mb-4 shadow-sm"
                style={{
                  width: "72px",
                  height: "72px",
                  fontSize: "34px",
                  fontWeight: "600",
                }}
              >
                $
              </div>

              <h1
                className="fw-bold text-primary mb-3"
                style={{ fontSize: "2.4rem" }}
              >
                Envelope Budget Manager
              </h1>

              <p className="text-secondary fs-5 mb-0">
                Create an account or sign in to start managing
                your money with envelopes.
              </p>
            </div>

            <GoogleAuthButtons />
          </Card.Body>
        </Card>
      </Container>

      <Footer />
    </div>
  );
}