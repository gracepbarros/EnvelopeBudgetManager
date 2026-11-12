import React, {
  useContext,
  useEffect,
  useState,
} from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "./AuthContext";

const IncomeContext = React.createContext();

export function useIncome() {
  return useContext(IncomeContext);
}

function mapIncome(income) {
  return {
    id: income.id,
    description: income.description,
    amount: Number(income.amount),
    date: income.date,
    accountId: income.account_id,
  };
}

export function IncomeProvider({ children }) {
  const { user } = useAuth();

  const [incomes, setIncomes] = useState([]);
  const [loadingIncomes, setLoadingIncomes] =
    useState(true);

  useEffect(() => {
    if (!user) {
      setIncomes([]);
      setLoadingIncomes(false);
      return;
    }

    let ignore = false;

    async function loadIncomes() {
      setLoadingIncomes(true);

      const { data, error } = await supabase
        .from("incomes")
        .select(
          `
            id,
            description,
            amount,
            date,
            account_id
          `
        )
        .eq("user_id", user.id)
        .order("created_at", {
          ascending: true,
        });

      if (error) {
        console.error(
          "Error loading incomes:",
          error
        );

        if (!ignore) {
          setLoadingIncomes(false);
        }

        return;
      }

      if (!ignore) {
        setIncomes(
          (data ?? []).map(mapIncome)
        );

        setLoadingIncomes(false);
      }
    }

    loadIncomes();

    return () => {
      ignore = true;
    };
  }, [user]);

  async function addIncome({
    description,
    amount,
    date,
    accountId,
  }) {
    const { data, error } = await supabase
      .from("incomes")
      .insert({
        user_id: user.id,
        description,
        amount: Number(amount),
        date,
        account_id: accountId,
      })
      .select(
        `
          id,
          description,
          amount,
          date,
          account_id
        `
      )
      .single();

    if (error) {
      console.error(
        "Error adding income:",
        error
      );
      throw error;
    }

    const newIncome = mapIncome(data);

    setIncomes((prevIncomes) => [
      ...prevIncomes,
      newIncome,
    ]);

    return newIncome;
  }

  async function editIncome({
    incomeId,
    newDescription,
    newAmount,
    newDate,
    newAccountId,
  }) {
    const { data, error } = await supabase
      .from("incomes")
      .update({
        description: newDescription,
        amount: Number(newAmount),
        date: newDate,
        account_id: newAccountId,
      })
      .eq("id", incomeId)
      .eq("user_id", user.id)
      .select(
        `
          id,
          description,
          amount,
          date,
          account_id
        `
      )
      .single();

    if (error) {
      console.error(
        "Error editing income:",
        error
      );
      throw error;
    }

    const updatedIncome =
      mapIncome(data);

    setIncomes((prevIncomes) =>
      prevIncomes.map((income) =>
        income.id === incomeId
          ? updatedIncome
          : income
      )
    );

    return updatedIncome;
  }

  async function deleteIncome(incomeId) {
    const { error } = await supabase
      .from("incomes")
      .delete()
      .eq("id", incomeId)
      .eq("user_id", user.id);

    if (error) {
      console.error(
        "Error deleting income:",
        error
      );
      throw error;
    }

    setIncomes((prevIncomes) =>
      prevIncomes.filter(
        (income) =>
          income.id !== incomeId
      )
    );
  }

  return (
    <IncomeContext.Provider
      value={{
        incomes,
        loadingIncomes,
        addIncome,
        editIncome,
        deleteIncome,
      }}
    >
      {children}
    </IncomeContext.Provider>
  );
}
