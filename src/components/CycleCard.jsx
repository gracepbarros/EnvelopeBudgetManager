import { Badge, Button, Card, Stack } from "react-bootstrap";
import { useIncome } from "../contexts/IncomeContext";
import { useBudgets } from "../contexts/BudgetsContext";
import { useBudgetCycle } from "../contexts/BudgetCycleContext";
import { currencyFormatter } from "../utils";

function formatDate(date) {
  if (!date) return null;

  return new Date(
    `${date}T00:00:00`
  ).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function CycleCard({
  onOpenCycleHistory,
  onOpenEditCycleDates,
  onOpenCloseCycle,
}) {
  const { incomes } = useIncome();
  const { budgets } = useBudgets();

  const {
    activeCycle,
    carryoverAmount,
    isReopenedCycle,
  } = useBudgetCycle();

  const totalIncome = incomes.reduce(
    (total, income) =>
      total + Number(income.amount),
    0
  );

  const totalAllocated = budgets.reduce(
    (total, budget) =>
      total + Number(budget.allocated),
    0
  );

  const availableToAllocate =
    carryoverAmount +
    totalIncome -
    totalAllocated;

  const startDate = formatDate(
    activeCycle?.start_date
  );

  const endDate = activeCycle?.end_date
    ? formatDate(activeCycle.end_date)
    : "Present";

  return (
    <Card>
      <Card.Body>
        <div className="d-flex justify-content-between align-items-start mb-3">
          <Card.Title className="fw-normal mb-0">
            {isReopenedCycle
              ? "Editing Cycle"
              : "Current Cycle"}
          </Card.Title>

          <Badge
            bg={
              isReopenedCycle
                ? "warning"
                : "success"
            }
            text={
              isReopenedCycle
                ? "dark"
                : undefined
            }
          >
            {isReopenedCycle
              ? "Reopened"
              : "Active"}
          </Badge>
        </div>

        {startDate && (
          <div className="d-flex justify-content-between mb-1">
            <span className="text-muted">
              Cycle Period
            </span>

            <span>
              {startDate}
              {" – "}
              {endDate}
            </span>
          </div>
        )}

        <div className="d-flex justify-content-between mb-3 fw-bold">
          <span>
            Available to Allocate
          </span>

          <span
            className={
              availableToAllocate < 0
                ? "text-danger"
                : "text-success"
            }
          >
            {currencyFormatter.format(
              availableToAllocate
            )}
          </span>
        </div>

        <Stack
          direction="horizontal"
          gap="2"
          className="mt-4 flex-wrap"
        >
          <Button
            className="ms-auto"
            variant="outline-secondary"
            onClick={onOpenCycleHistory}
          >
            Cycle History
          </Button>

          {isReopenedCycle && (
            <Button
              variant="outline-secondary"
              onClick={
                onOpenEditCycleDates
              }
            >
              Edit Dates
            </Button>
          )}

          <Button
            variant={
              isReopenedCycle
                ? "outline-primary"
                : "outline-danger"
            }
            onClick={onOpenCloseCycle}
          >
            {isReopenedCycle
              ? "Finish Previous Cycle"
              : "Close Cycle"}
          </Button>
        </Stack>
      </Card.Body>
    </Card>
  );
}