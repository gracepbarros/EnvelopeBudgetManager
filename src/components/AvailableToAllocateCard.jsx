import { Card } from "react-bootstrap";
import { useIncome } from "../contexts/IncomeContext";
import { useBudgets } from "../contexts/BudgetsContext";
import { currencyFormatter } from "../utils";

export default function AvailableToAllocateCard() {
  const { incomes } = useIncome();
  const { budgets } = useBudgets();

  const totalIncome = incomes.reduce(
    (total, income) => total + Number(income.amount),
    0
  );

  const totalAllocated = budgets.reduce(
    (total, budget) => total + Number(budget.allocated),
    0
  );

  const availableToAllocate =
    totalIncome - totalAllocated;

  return (
    <Card>
      <Card.Body>
        <Card.Title>
          Available to Allocate
        </Card.Title>

        <Card.Text className="fs-4 fw-semibold mb-0">
          {currencyFormatter.format(
            availableToAllocate
          )}
        </Card.Text>
      </Card.Body>
    </Card>
  );
}