import BudgetCard from "./BudgetCard";
import { useBudgets } from "../contexts/BudgetsContext";

export default function TotalBudgetCard() {
  const { expenses, budgets } = useBudgets();

  const amount = expenses.reduce(
    (total, expense) => total + expense.amount,
    0
  );

  const allocated = budgets.reduce(
    (total, budget) => total + budget.allocated,
    0
  );

  if (allocated === 0) return null;

  return <BudgetCard
  name="Total"
  amount={amount}
  isGray
  allocated={allocated}
  hideButtons
/>;
}
