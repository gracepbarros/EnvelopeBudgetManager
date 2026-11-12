import React, {
  useContext,
  useEffect,
  useState,
} from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "./AuthContext";

const BudgetsContext = React.createContext();

export const UNASSIGNED_BUDGET_ID = "Unassigned";

export function useBudgets() {
  return useContext(BudgetsContext);
}

function mapEnvelope(envelope) {
  return {
    id: envelope.id,
    name: envelope.name,
    allocated: Number(envelope.allocated),
  };
}

function mapExpense(expense) {
  return {
    id: expense.id,
    budgetId:
      expense.envelope_id ??
      UNASSIGNED_BUDGET_ID,
    amount: Number(expense.amount),
    description: expense.description,
    date: expense.date,
    accountId: expense.account_id,
  };
}

export function BudgetsProvider({ children }) {
  const { user } = useAuth();

  const [budgets, setBudgets] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [
    loadingBudgetData,
    setLoadingBudgetData,
  ] = useState(true);

  useEffect(() => {
    if (!user) {
      setBudgets([]);
      setExpenses([]);
      setLoadingBudgetData(false);
      return;
    }

    let ignore = false;

    async function loadBudgetData() {
      setLoadingBudgetData(true);

      const [
        envelopesResult,
        expensesResult,
      ] = await Promise.all([
        supabase
          .from("envelopes")
          .select(
            "id, name, allocated"
          )
          .eq("user_id", user.id)
          .order("created_at", {
            ascending: true,
          }),

        supabase
          .from("expenses")
          .select(
            `
              id,
              envelope_id,
              account_id,
              amount,
              description,
              date
            `
          )
          .eq("user_id", user.id)
          .order("created_at", {
            ascending: true,
          }),
      ]);

      if (envelopesResult.error) {
        console.error(
          "Error loading envelopes:",
          envelopesResult.error
        );
      }

      if (expensesResult.error) {
        console.error(
          "Error loading expenses:",
          expensesResult.error
        );
      }

      if (!ignore) {
        if (!envelopesResult.error) {
          setBudgets(
            (envelopesResult.data ?? []).map(
              mapEnvelope
            )
          );
        }

        if (!expensesResult.error) {
          setExpenses(
            (expensesResult.data ?? []).map(
              mapExpense
            )
          );
        }

        setLoadingBudgetData(false);
      }
    }

    loadBudgetData();

    return () => {
      ignore = true;
    };
  }, [user]);

  function getBudgetExpenses(budgetId) {
    return expenses.filter(
      (expense) =>
        expense.budgetId === budgetId
    );
  }

  async function addBudget({
    name,
    allocated,
  }) {
    const duplicateBudget = budgets.find(
      (budget) => budget.name === name
    );

    if (duplicateBudget) {
      return null;
    }

    const { data, error } = await supabase
      .from("envelopes")
      .insert({
        user_id: user.id,
        name,
        allocated: Number(allocated),
      })
      .select(
        "id, name, allocated"
      )
      .single();

    if (error) {
      console.error(
        "Error adding envelope:",
        error
      );
      throw error;
    }

    const newBudget = mapEnvelope(data);

    setBudgets((prevBudgets) => [
      ...prevBudgets,
      newBudget,
    ]);

    return newBudget;
  }

  async function editBudget({
    budgetId,
    newName,
    newAllocated,
  }) {
    const { data, error } = await supabase
      .from("envelopes")
      .update({
        name: newName,
        allocated: Number(newAllocated),
      })
      .eq("id", budgetId)
      .eq("user_id", user.id)
      .select(
        "id, name, allocated"
      )
      .single();

    if (error) {
      console.error(
        "Error editing envelope:",
        error
      );
      throw error;
    }

    const updatedBudget =
      mapEnvelope(data);

    setBudgets((prevBudgets) =>
      prevBudgets.map((budget) =>
        budget.id === budgetId
          ? updatedBudget
          : budget
      )
    );

    return updatedBudget;
  }

  async function deleteBudget(budgetId) {
    const { error } = await supabase
      .from("envelopes")
      .delete()
      .eq("id", budgetId)
      .eq("user_id", user.id);

    if (error) {
      console.error(
        "Error deleting envelope:",
        error
      );
      throw error;
    }

    setBudgets((prevBudgets) =>
      prevBudgets.filter(
        (budget) =>
          budget.id !== budgetId
      )
    );

    setExpenses((prevExpenses) =>
      prevExpenses.map((expense) => {
        if (
          expense.budgetId !== budgetId
        ) {
          return expense;
        }

        return {
          ...expense,
          budgetId:
            UNASSIGNED_BUDGET_ID,
        };
      })
    );
  }

  async function addExpense({
    budgetId,
    amount,
    description,
    date,
    accountId,
  }) {
    const envelopeId =
      budgetId === UNASSIGNED_BUDGET_ID ||
      !budgetId
        ? null
        : budgetId;

    const { data, error } = await supabase
      .from("expenses")
      .insert({
        user_id: user.id,
        envelope_id: envelopeId,
        account_id: accountId,
        amount: Number(amount),
        description,
        date,
      })
      .select(
        `
          id,
          envelope_id,
          account_id,
          amount,
          description,
          date
        `
      )
      .single();

    if (error) {
      console.error(
        "Error adding expense:",
        error
      );
      throw error;
    }

    const newExpense =
      mapExpense(data);

    setExpenses((prevExpenses) => [
      ...prevExpenses,
      newExpense,
    ]);

    return newExpense;
  }

  async function editExpense({
    expenseId,
    newName,
    newAmount,
    newBudgetId,
    newDate,
    newAccountId,
  }) {
    const envelopeId =
      newBudgetId ===
        UNASSIGNED_BUDGET_ID ||
      !newBudgetId
        ? null
        : newBudgetId;

    const { data, error } = await supabase
      .from("expenses")
      .update({
        envelope_id: envelopeId,
        account_id: newAccountId,
        description: newName,
        amount: Number(newAmount),
        date: newDate,
      })
      .eq("id", expenseId)
      .eq("user_id", user.id)
      .select(
        `
          id,
          envelope_id,
          account_id,
          amount,
          description,
          date
        `
      )
      .single();

    if (error) {
      console.error(
        "Error editing expense:",
        error
      );
      throw error;
    }

    const updatedExpense =
      mapExpense(data);

    setExpenses((prevExpenses) =>
      prevExpenses.map((expense) =>
        expense.id === expenseId
          ? updatedExpense
          : expense
      )
    );

    return updatedExpense;
  }

  async function deleteExpense(
    expenseId
  ) {
    const { error } = await supabase
      .from("expenses")
      .delete()
      .eq("id", expenseId)
      .eq("user_id", user.id);

    if (error) {
      console.error(
        "Error deleting expense:",
        error
      );
      throw error;
    }

    setExpenses((prevExpenses) =>
      prevExpenses.filter(
        (expense) =>
          expense.id !== expenseId
      )
    );
  }

  return (
    <BudgetsContext.Provider
      value={{
        budgets,
        expenses,
        loadingBudgetData,
        getBudgetExpenses,
        addExpense,
        addBudget,
        deleteBudget,
        deleteExpense,
        editBudget,
        editExpense,
      }}
    >
      {children}
    </BudgetsContext.Provider>
  );
}
