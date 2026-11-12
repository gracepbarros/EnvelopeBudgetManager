import { useState } from "react";
import {
  Alert,
  Badge,
  Button,
  Stack,
} from "react-bootstrap";
import { useAuth } from "../contexts/AuthContext";

function GoogleIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      className="me-2"
      aria-hidden="true"
    >
      <path
        fill="#4285F4"
        d="M21.6 12.23c0-.71-.06-1.4-.18-2.07H12v3.92h5.38a4.6 4.6 0 0 1-2 3.02v2.51h3.24c1.9-1.75 2.98-4.33 2.98-7.38Z"
      />
      <path
        fill="#34A853"
        d="M12 22c2.7 0 4.98-.9 6.64-2.39l-3.24-2.51c-.9.6-2.05.96-3.4.96-2.61 0-4.82-1.76-5.61-4.13H3.04v2.59A10 10 0 0 0 12 22Z"
      />
      <path
        fill="#FBBC05"
        d="M6.39 13.93A6 6 0 0 1 6.08 12c0-.67.11-1.32.31-1.93V7.48H3.04A10 10 0 0 0 2 12c0 1.61.38 3.13 1.04 4.52l3.35-2.59Z"
      />
      <path
        fill="#EA4335"
        d="M12 5.94c1.47 0 2.79.5 3.83 1.49l2.87-2.87C16.97 2.95 14.7 2 12 2a10 10 0 0 0-8.96 5.48l3.35 2.59C7.18 7.7 9.39 5.94 12 5.94Z"
      />
    </svg>
  );
}

export default function GoogleAuthButtons() {
  const { signInWithGoogle } = useAuth();

  const [error, setError] = useState("");
  const [connecting, setConnecting] = useState(false);

  async function handleGoogleAuth() {
    try {
      setError("");
      setConnecting(true);

      await signInWithGoogle();
    } catch (error) {
      setError(error.message);
      setConnecting(false);
    }
  }

  return (
    <>
      {error && (
        <Alert variant="danger">
          {error}
        </Alert>
      )}

      <Stack gap={3}>
        <div className="d-flex gap-3">
          <Button
            variant="primary"
            className="flex-fill py-2 fw-semibold d-flex align-items-center justify-content-center"
            onClick={handleGoogleAuth}
            disabled={connecting}
          >
            {connecting ? (
              "Connecting..."
            ) : (
              <>
                <GoogleIcon />
                Sign Up
              </>
            )}
          </Button>

          <Button
            variant="outline-primary"
            className="flex-fill py-2 fw-semibold d-flex align-items-center justify-content-center"
            onClick={handleGoogleAuth}
            disabled={connecting}
          >
            <GoogleIcon />
            Sign In
          </Button>
        </div>

        <div className="d-flex align-items-center gap-3 my-1">
          <hr className="flex-grow-1 my-0" />

          <span
            className="text-secondary text-nowrap"
            style={{ fontSize: "0.85rem" }}
          >
            Portfolio preview
          </span>

          <hr className="flex-grow-1 my-0" />
        </div>

        <div className="text-center">
          <Button
            variant="outline-success"
            className="px-4 py-2"
            disabled
          >
            Test User

            <Badge
              bg="secondary"
              className="ms-2"
            >
              Coming Soon
            </Badge>
          </Button>
        </div>
      </Stack>
    </>
  );
}