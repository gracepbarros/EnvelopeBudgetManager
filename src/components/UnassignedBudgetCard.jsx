import BudgetCard from "./BudgetCard";
import {
  UNASSIGNED_BUDGET_ID,
  useBudgets,
} from "../contexts/BudgetsContext";

export default function UnassignedBudgetCard(props) {
  const { getBudgetExpenses } = useBudgets();

  const amount = getBudgetExpenses(UNASSIGNED_BUDGET_ID).reduce(
    (total, expense) => total + expense.amount,
    0
  );

  if (amount === 0) return null;

  return <BudgetCard 
    name="Unassigned" 
    amount={amount} 
    isWarning {...props} 
  />;
}
