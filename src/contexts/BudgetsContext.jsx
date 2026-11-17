import React, {
  useContext,
  useEffect,
  useState,
} from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "./AuthContext";
import { useBudgetCycle } from "./BudgetCycleContext";

const BudgetsContext = React.createContext();

export const UNASSIGNED_BUDGET_ID = "Unassigned";

export function useBudgets() {
  return useContext(BudgetsContext);
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

  const {
    activeCycleId,
    loadingCycle,
  } = useBudgetCycle();

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

    if (loadingCycle) {
      setLoadingBudgetData(true);
      return;
    }

    if (!activeCycleId) {
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
        allocationsResult,
        expensesResult,
      ] = await Promise.all([
        supabase
          .from("envelopes")
          .select("id, name")
          .eq("user_id", user.id)
          .order("created_at", {
            ascending: true,
          }),

        supabase
          .from("envelope_allocations")
          .select(
            "envelope_id, allocated"
          )
          .eq("user_id", user.id)
          .eq("cycle_id", activeCycleId),

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
          .eq("cycle_id", activeCycleId)
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

      if (allocationsResult.error) {
        console.error(
          "Error loading envelope allocations:",
          allocationsResult.error
        );
      }

      if (expensesResult.error) {
        console.error(
          "Error loading expenses:",
          expensesResult.error
        );
      }

      if (!ignore) {
        if (
          !envelopesResult.error &&
          !allocationsResult.error
        ) {
          const allocations = new Map(
            (allocationsResult.data ?? []).map(
              (allocation) => [
                allocation.envelope_id,
                Number(allocation.allocated),
              ]
            )
          );

          const mappedBudgets =
            (envelopesResult.data ?? []).map(
              (envelope) => ({
                id: envelope.id,
                name: envelope.name,
                allocated:
                  allocations.get(
                    envelope.id
                  ) ?? 0,
              })
            );

          setBudgets(mappedBudgets);
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
  }, [
    user,
    activeCycleId,
    loadingCycle,
  ]);

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
    if (!activeCycleId) {
      throw new Error(
        "No active budget cycle found"
      );
    }

    const duplicateBudget = budgets.find(
      (budget) => budget.name === name
    );

    if (duplicateBudget) {
      return null;
    }

    const {
      data: envelope,
      error: envelopeError,
    } = await supabase
      .from("envelopes")
      .insert({
        user_id: user.id,
        name,
      })
      .select("id, name")
      .single();

    if (envelopeError) {
      console.error(
        "Error adding envelope:",
        envelopeError
      );
      throw envelopeError;
    }

    const {
      data: allocation,
      error: allocationError,
    } = await supabase
      .from("envelope_allocations")
      .insert({
        user_id: user.id,
        cycle_id: activeCycleId,
        envelope_id: envelope.id,
        allocated: Number(allocated),
      })
      .select("allocated")
      .single();

    if (allocationError) {
      console.error(
        "Error adding envelope allocation:",
        allocationError
      );

      // Avoid leaving an envelope behind if
      // its initial allocation failed.
      await supabase
        .from("envelopes")
        .delete()
        .eq("id", envelope.id)
        .eq("user_id", user.id);

      throw allocationError;
    }

    const newBudget = {
      id: envelope.id,
      name: envelope.name,
      allocated: Number(
        allocation.allocated
      ),
    };

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
    if (!activeCycleId) {
      throw new Error(
        "No active budget cycle found"
      );
    }

    const {
      data: envelope,
      error: envelopeError,
    } = await supabase
      .from("envelopes")
      .update({
        name: newName,
      })
      .eq("id", budgetId)
      .eq("user_id", user.id)
      .select("id, name")
      .single();

    if (envelopeError) {
      console.error(
        "Error editing envelope:",
        envelopeError
      );
      throw envelopeError;
    }

    const {
      data: allocation,
      error: allocationError,
    } = await supabase
      .from("envelope_allocations")
      .upsert(
        {
          user_id: user.id,
          cycle_id: activeCycleId,
          envelope_id: budgetId,
          allocated: Number(
            newAllocated
          ),
        },
        {
          onConflict:
            "cycle_id,envelope_id",
        }
      )
      .select("allocated")
      .single();

    if (allocationError) {
      console.error(
        "Error editing envelope allocation:",
        allocationError
      );
      throw allocationError;
    }

    const updatedBudget = {
      id: envelope.id,
      name: envelope.name,
      allocated: Number(
        allocation.allocated
      ),
    };

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
    if (!activeCycleId) {
      throw new Error(
        "No active budget cycle found"
      );
    }

    const envelopeId =
      budgetId === UNASSIGNED_BUDGET_ID ||
      !budgetId
        ? null
        : budgetId;

    const { data, error } = await supabase
      .from("expenses")
      .insert({
        user_id: user.id,
        cycle_id: activeCycleId,
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
      .eq("cycle_id", activeCycleId)
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
      .eq("user_id", user.id)
      .eq("cycle_id", activeCycleId);

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
