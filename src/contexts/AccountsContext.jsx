import React, {
  useContext,
  useEffect,
  useState,
} from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "./AuthContext";

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
  const { user } = useAuth();

  const [accounts, setAccounts] = useState([]);
  const [loadingAccounts, setLoadingAccounts] =
    useState(true);

  const activeAccounts = accounts.filter(
    (account) => !account.archived
  );

  useEffect(() => {
    if (!user) {
      setAccounts([]);
      setLoadingAccounts(false);
      return;
    }

    let ignore = false;

    async function loadAccounts() {
      setLoadingAccounts(true);

      const { data, error } = await supabase
        .from("accounts")
        .select("id, name, type, archived")
        .order("created_at", {
          ascending: true,
        });

      if (error) {
        console.error(
          "Error loading accounts:",
          error
        );

        if (!ignore) {
          setLoadingAccounts(false);
        }

        return;
      }

      if (!ignore) {
        setAccounts(data ?? []);
        setLoadingAccounts(false);
      }
    }

    loadAccounts();

    return () => {
      ignore = true;
    };
  }, [user]);

  async function addAccount({ name, type }) {
    const { data, error } = await supabase
      .from("accounts")
      .insert({
        user_id: user.id,
        name,
        type,
        archived: false,
      })
      .select("id, name, type, archived")
      .single();

    if (error) {
      console.error(
        "Error adding account:",
        error
      );
      throw error;
    }

    setAccounts((prevAccounts) => [
      ...prevAccounts,
      data,
    ]);

    return data;
  }

  async function editAccount({
    accountId,
    newName,
    newType,
  }) {
    const { data, error } = await supabase
      .from("accounts")
      .update({
        name: newName,
        type: newType,
      })
      .eq("id", accountId)
      .eq("user_id", user.id)
      .select("id, name, type, archived")
      .single();

    if (error) {
      console.error(
        "Error editing account:",
        error
      );
      throw error;
    }

    setAccounts((prevAccounts) =>
      prevAccounts.map((account) =>
        account.id === accountId
          ? data
          : account
      )
    );

    return data;
  }

  async function deleteAccount(accountId) {
    const { error } = await supabase
      .from("accounts")
      .delete()
      .eq("id", accountId)
      .eq("user_id", user.id);

    if (error) {
      console.error(
        "Error deleting account:",
        error
      );
      throw error;
    }

    setAccounts((prevAccounts) =>
      prevAccounts.filter(
        (account) =>
          account.id !== accountId
      )
    );
  }

  async function archiveAccount(accountId) {
    const { data, error } = await supabase
      .from("accounts")
      .update({
        archived: true,
      })
      .eq("id", accountId)
      .eq("user_id", user.id)
      .select("id, name, type, archived")
      .single();

    if (error) {
      console.error(
        "Error archiving account:",
        error
      );
      throw error;
    }

    setAccounts((prevAccounts) =>
      prevAccounts.map((account) =>
        account.id === accountId
          ? data
          : account
      )
    );

    return data;
  }

  async function restoreAccount(accountId) {
    const { data, error } = await supabase
      .from("accounts")
      .update({
        archived: false,
      })
      .eq("id", accountId)
      .eq("user_id", user.id)
      .select("id, name, type, archived")
      .single();

    if (error) {
      console.error(
        "Error restoring account:",
        error
      );
      throw error;
    }

    setAccounts((prevAccounts) =>
      prevAccounts.map((account) =>
        account.id === accountId
          ? data
          : account
      )
    );

    return data;
  }

  return (
    <AccountsContext.Provider
      value={{
        accounts,
        activeAccounts,
        loadingAccounts,
        addAccount,
        editAccount,
        deleteAccount,
        archiveAccount,
        restoreAccount,
      }}
    >
      {children}
    </AccountsContext.Provider>
  );
}
