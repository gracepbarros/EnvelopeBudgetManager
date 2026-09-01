import { Button, Card, ProgressBar, Stack } from "react-bootstrap";
import { currencyFormatter } from "../utils";

export default function BudgetCard({
  name,
  amount,
  allocated,
  isGray,
  isDanger,
  hideButtons,
  onAddExpenseClick,
  onViewExpenseClick,
  onEditBudgetClick,
}) {
  const classNames = [];
  const hasAllocation = Number.isFinite(allocated);
  const available = hasAllocation ? allocated - amount : null;  
    if (isDanger || hasAllocation && amount > allocated) {
      classNames.push("bg-danger", "bg-opacity-10");
    } else if (isGray) {
      classNames.push("bg-light");
    }

  return (
    <Card className={classNames.join(" ")}>
      <Card.Body>
        <Card.Title className="fw-normal mb-3">
          {name}
        </Card.Title>

          {hasAllocation ? (
            <>
              <div className="d-flex justify-content-between mb-1">
                <span className="text-muted">Allocated Amount</span>
                <span>{currencyFormatter.format(allocated)}</span>
              </div>

              <div className="d-flex justify-content-between mb-1">
                <span className="text-muted">Already Spent</span>
                <span>{currencyFormatter.format(amount)}</span>
              </div>

              <div className="d-flex justify-content-between mb-3 fw-bold">
                <span>Available</span>
                <span className={available < 0 ? "text-danger" : "text-success"}>
                  {currencyFormatter.format(available)}
                </span>
              </div>
            </>
          ) : (
            <div className="d-flex justify-content-between mb-3 fw-bold">
              <span>Unassigned Amount</span>
              <span className="text-danger">{currencyFormatter.format(amount)}</span>
            </div>
          )}

        {hasAllocation && allocated > 0 && (
          <ProgressBar
            className="rounded-pill"
            variant={getProgressBarVariant(amount, allocated)}
            min={0}
            max={allocated}
            now={amount}
          />
        )}
        {!hideButtons && (
          <Stack direction="horizontal" gap="2" className="mt-4">
            <Button
              className="ms-auto"
              variant="primary"
              onClick={onAddExpenseClick}>
              Add Expense
            </Button>
            <Button 
              variant="outline-primary" 
              onClick={onViewExpenseClick}>
              View Expenses
            </Button>
            {onEditBudgetClick && (
              <Button
                variant="outline-secondary"
                onClick={onEditBudgetClick}
              >
                Edit Envelope
              </Button>
            )}
          </Stack>
        )}
      </Card.Body>
    </Card>
  );
}

function getProgressBarVariant(amount, allocated) {
  const ratio = amount / allocated;
  if (ratio < 0.5) return "primary";
  if (ratio < 0.8) return "warning";
  return "danger";
}
