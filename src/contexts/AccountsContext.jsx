import React, { useContext } from "react";
import { v4 as uuidV4 } from "uuid";
import useLocalStorage from "../hooks/localStorage";

const AccountsContext = React.createContext();

export const ACCOUNT_TYPES = [
  {
    value: "Chequing",
    label: "Chequing",
    bg: "primary",
  },
  {
    value: "Savings",
    label: "Savings",
    bg: "success",
  },
  {
    value: "Credit Card",
    label: "Credit Card",
    bg: "danger",
  },
  {
    value: "Cash",
    label: "Cash",
    bg: "warning",
  },
  {
    value: "Other",
    label: "Other",
    bg: "secondary",
  },
];

export function useAccounts() {
  return useContext(AccountsContext);
}

export function AccountsProvider({ children }) {
  // Account contains: id, name, type, archived
  const [accounts, setAccounts] = useLocalStorage("accounts", []);

  const activeAccounts = accounts.filter(
    (account) => !account.archived
  );

  function addAccount({ name, type }) {
    const newAccount = {
      id: uuidV4(),
      name,
      type,
      archived: false,
    };

    setAccounts((prevAccounts) => {
      return [...prevAccounts, newAccount];
    });
  }

  function editAccount({ accountId, newName, newType }) {
    setAccounts((prevAccounts) => {
      return prevAccounts.map((account) => {
        if (account.id !== accountId) return account;

        return {
          ...account,
          name: newName,
          type: newType,
        };
      });
    });
  }

  function deleteAccount(accountId) {
    setAccounts((prevAccounts) => {
      return prevAccounts.filter((account) => account.id !== accountId);
    });
  }

  function archiveAccount(accountId) {
    setAccounts((prevAccounts) =>
      prevAccounts.map((account) => {
        if (account.id !== accountId) return account;

        return {
          ...account,
          archived: true,
        };
      })
    );
  }

  function restoreAccount(accountId) {
    setAccounts((prevAccounts) =>
      prevAccounts.map((account) => {
        if (account.id !== accountId) return account;

        return {
          ...account,
          archived: false,
        };
      })
    );
  }

  return (
    <AccountsContext.Provider
      value={{
        accounts,
        activeAccounts,
        addAccount,
        editAccount,
        deleteAccount,
        archiveAccount,
        restoreAccount
      }}
    >
      {children}
    </AccountsContext.Provider>
  );
}