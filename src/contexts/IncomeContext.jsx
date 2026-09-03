import React, { useContext } from "react";
import { v4 as uuidV4 } from "uuid";
import useLocalStorage from "../hooks/localStorage";

const IncomeContext = React.createContext();

export function useIncome() {
  return useContext(IncomeContext);
}

export function IncomeProvider({ children }) {
  // Income contains: id, description, amount, date, accountId
  const [incomes, setIncomes] = useLocalStorage("incomes", []);

  function addIncome({
    description,
    amount,
    date,
    accountId,
  }) {
    const newIncome = {
      id: uuidV4(),
      description,
      amount,
      date,
      accountId,
    };

    setIncomes((prevIncomes) => [
      ...prevIncomes,
      newIncome,
    ]);
  }

  function editIncome({
    incomeId,
    newDescription,
    newAmount,
    newDate,
    newAccountId,
  }) {
    setIncomes((prevIncomes) =>
      prevIncomes.map((income) => {
        if (income.id !== incomeId) return income;

        return {
          ...income,
          description: newDescription,
          amount: newAmount,
          date: newDate,
          accountId: newAccountId,
        };
      })
    );
  }

  function deleteIncome(incomeId) {
    setIncomes((prevIncomes) =>
      prevIncomes.filter(
        (income) => income.id !== incomeId
      )
    );
  }

  return (
    <IncomeContext.Provider
      value={{
        incomes,
        addIncome,
        editIncome,
        deleteIncome,
      }}
    >
      {children}
    </IncomeContext.Provider>
  );
}
