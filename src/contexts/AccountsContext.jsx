import React, { useContext } from "react";
import { v4 as uuidV4 } from "uuid";
import useLocalStorage from "../hooks/localStorage";

const AccountsContext = React.createContext();

export const ACCOUNT_TYPES = [
  "Chequing",
  "Savings",
  "Credit Card",
  "Cash",
];

export function useAccounts() {
  return useContext(AccountsContext);
}

export function AccountsProvider({ children }) {
  // Account contains: id, name, type
  const [accounts, setAccounts] = useLocalStorage("accounts", []);

  function addAccount({ name, type }) {
    const newAccount = {
      id: uuidV4(),
      name,
      type,
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

  return (
    <AccountsContext.Provider
      value={{
        accounts,
        addAccount,
        editAccount,
        deleteAccount,
      }}
    >
      {children}
    </AccountsContext.Provider>
  );
}