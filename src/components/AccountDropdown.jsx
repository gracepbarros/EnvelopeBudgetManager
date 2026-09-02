import { Badge, Dropdown } from "react-bootstrap";
import {
  ACCOUNT_TYPES,
  useAccounts,
} from "../contexts/AccountsContext";

function getAccountType(type) {
  return ACCOUNT_TYPES.find(
    (accountType) => accountType.value === type
  );
}

export default function AccountDropdown({
  value,
  onChange,
}) {
  const { accounts, activeAccounts } = useAccounts();

  const selectedAccount = accounts.find(
    (account) => account.id === value
  );

  function accountLabel(account) {
    const type = getAccountType(account.type);

    return (
      <>
        <span>{account.name}</span>

        <Badge
          bg={type?.bg || "secondary"}
          className="ms-2"
        >
          {account.type}
        </Badge>
      </>
    );
  }

  return (
    <Dropdown>
      <Dropdown.Toggle
        variant="outline-info"
        className="w-100 text-start text-black"
      >
        {selectedAccount
          ? accountLabel(selectedAccount)
          : "Select an account"}
      </Dropdown.Toggle>

      <Dropdown.Menu className="w-100">
        {activeAccounts.map((account) => (
          <Dropdown.Item
            key={account.id}
            onClick={() => onChange(account.id)}
            className="fw-semibold"
          >
            {accountLabel(account)}
          </Dropdown.Item>
        ))}
      </Dropdown.Menu>
    </Dropdown>
  );
}
