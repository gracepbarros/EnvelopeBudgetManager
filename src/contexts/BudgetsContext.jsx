import React, { useContext } from "react";
import { v4 as uuidV4 } from "uuid";
import useLocalStorage from "../hooks/localStorage";

const BudgetsContext = React.createContext();

export const UNCATEGORIZED_BUDGET_ID = "Uncategorized";

export function useBudgets() {
  return useContext(BudgetsContext);
}

export const BudgetsProvider = ({ children }) => {
  // Budget contains: id, name, allocated
  const [budgets, setBudgets] = useLocalStorage("budgets", []);
  // Expense contains: id, budgetId, amount, description, date, paymentMethod
  const [expenses, setExpenses] = useLocalStorage("expenses", []);

  function getBudgetExpenses(budgetId) {
    return expenses.filter((expense) => expense.budgetId === budgetId);
  }

  function addExpense({ budgetId, amount, description, date, paymentMethod }) {
    const newExpense = {
      id: uuidV4(),
      budgetId,
      amount,
      description,
      date,
      paymentMethod,
    };

    setExpenses((prevExpenses) => {
      return [...prevExpenses, newExpense];
    });
  }

  function addBudget({ name, allocated }) {
    const newBudget = {
      id: uuidV4(),
      name,
      allocated,
    };

    setBudgets((prevBudgets) => {
      if (prevBudgets.find((budget) => budget.name === name)) {
        return prevBudgets;
      }
      return [...prevBudgets, newBudget];
    });
  }

  function deleteBudget(budgetId) {
    setExpenses((prevExpenses) => {
      return prevExpenses.map((expense) => {
        if (expense.budgetId !== budgetId) return expense;
        return { ...expense, budgetId: UNCATEGORIZED_BUDGET_ID };
      });
    });

    setBudgets((prevBudgets) => {
      return prevBudgets.filter((budget) => budget.id !== budgetId);
    });
  }

  function deleteExpense(expId) {
    return setExpenses(expenses.filter((exp) => exp.id !== expId));
  }

  function editBudget({ budgetId, newName, newAllocated }) {
    setBudgets((prevBudgets) => {
      return prevBudgets.map((budget) => {
        if (budget.id !== budgetId) return budget;
        return { ...budget, name: newName, allocated: newAllocated };
      });
    });
  }

  function editExpense({ expenseId, newName, newAmount, newBudgetId, newDate, newPaymentMethod }) {
    setExpenses((prevExpenses) => {
      return prevExpenses.map((exp) => {
        if (exp.id !== expenseId) return exp;
        return {
          id: exp.id,
          budgetId: newBudgetId,
          amount: newAmount,
          description: newName,
          date: newDate,
          paymentMethod: newPaymentMethod,
        };
      });
    });
  }

  return (
    <BudgetsContext.Provider
      value={{
        budgets,
        expenses,
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
};
