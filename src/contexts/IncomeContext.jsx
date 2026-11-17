import React, {
  useContext,
  useEffect,
  useState,
} from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "./AuthContext";
import { useBudgetCycle } from "./BudgetCycleContext";

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

  const {
    activeCycleId,
    loadingCycle,
  } = useBudgetCycle();

  const [incomes, setIncomes] = useState([]);

  const [
    loadingIncomes,
    setLoadingIncomes,
  ] = useState(true);

  useEffect(() => {
    if (!user) {
      setIncomes([]);
      setLoadingIncomes(false);
      return;
    }

    if (loadingCycle) {
      setLoadingIncomes(true);
      return;
    }

    if (!activeCycleId) {
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
        .eq("cycle_id", activeCycleId)
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
  }, [
    user,
    activeCycleId,
    loadingCycle,
  ]);

  async function addIncome({
    description,
    amount,
    date,
    accountId,
  }) {
    if (!activeCycleId) {
      throw new Error(
        "No active budget cycle found"
      );
    }

    const { data, error } = await supabase
      .from("incomes")
      .insert({
        user_id: user.id,
        cycle_id: activeCycleId,
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
    if (!activeCycleId) {
      throw new Error(
        "No active budget cycle found"
      );
    }

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
      .eq("cycle_id", activeCycleId)
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
    if (!activeCycleId) {
      throw new Error(
        "No active budget cycle found"
      );
    }

    const { error } = await supabase
      .from("incomes")
      .delete()
      .eq("id", incomeId)
      .eq("user_id", user.id)
      .eq("cycle_id", activeCycleId);

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
