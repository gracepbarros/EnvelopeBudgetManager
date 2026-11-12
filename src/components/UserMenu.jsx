import { useState } from "react";
import {
  Button,
  Dropdown,
  Image,
} from "react-bootstrap";
import { useAuth } from "../contexts/AuthContext";

export default function UserMenu() {
  const { user, signOut } = useAuth();
  const [showMenu, setShowMenu] = useState(false);

  if (!user) return null;

  const name =
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.email;

  const avatar =
    user.user_metadata?.avatar_url ||
    user.user_metadata?.picture;

  async function handleSignOut() {
    try {
      await signOut();
    } catch (error) {
      console.error(
        "Error signing out:",
        error
      );
    }
  }

  return (
    <Dropdown
      show={showMenu}
      onToggle={(isOpen) =>
        setShowMenu(isOpen)
      }
      onMouseEnter={() =>
        setShowMenu(true)
      }
      onMouseLeave={() =>
        setShowMenu(false)
      }
      align="end"
    >
      <Dropdown.Toggle
        variant="outline-secondary"
        className="d-flex align-items-center gap-2 px-3 "
      >
        {avatar && (
          <Image
            src={avatar}
            alt={name}
            roundedCircle
            width={28}
            height={28}
          />
        )}

        <span className="d-none d-md-inline">
          {name}
        </span>
      </Dropdown.Toggle>

      <Dropdown.Menu>
        <Dropdown.Header>
          <div className="fw-semibold">
            {name}
          </div>

          <small className="text-secondary">
            {user.email}
          </small>
        </Dropdown.Header>

        <Dropdown.Divider />

        <Dropdown.Item
          as={Button}
          onClick={handleSignOut}
        >
          Sign Out
        </Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  );
}