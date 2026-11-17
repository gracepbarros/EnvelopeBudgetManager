import { useEffect, useRef, useState } from "react";
import { Button, Form, Modal } from "react-bootstrap";
import { UNASSIGNED_BUDGET_ID, useBudgets } from "../contexts/BudgetsContext";
import { useBudgetCycle } from "../contexts/BudgetCycleContext";
import AccountDropdown from "./AccountDropdown";
import EnvelopeDropdown from "./EnvelopeDropdown";

export default function AddExpenseModal({
  show,
  handleClose,
  defaultBudgetId,
}) {
  const descriptionRef = useRef();
  const amountRef = useRef();

  const [budgetId, setBudgetId] = useState(
    defaultBudgetId || UNASSIGNED_BUDGET_ID
  );

  const [accountId, setAccountId] = useState("");

  const { addExpense } = useBudgets();
  const { activeCycle } = useBudgetCycle();

  const today = new Date().toLocaleDateString("en-CA");

  const minDate = activeCycle?.start_date ?? "";
  const maxDate = activeCycle?.end_date ?? today;

  const [date, setDate] = useState(today);

  useEffect(() => {
    if (show) {
      setBudgetId(
        defaultBudgetId || UNASSIGNED_BUDGET_ID
      );

      setAccountId("");

      setDate(
        activeCycle?.end_date ?? today
      );
    }
  }, [
    show,
    defaultBudgetId,
    activeCycle,
    today,
  ]);

  async function handleSubmit(event) {
    event.preventDefault();

    await addExpense({
      description:
        descriptionRef.current.value,
      amount: parseFloat(
        amountRef.current.value
      ),
      budgetId,
      date,
      accountId,
    });

    handleClose();
  }

  return (
    <Modal
      show={show}
      onHide={handleClose}
    >
      <Form onSubmit={handleSubmit}>
        <Modal.Header closeButton>
          <Modal.Title>
            New Expense
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form.Group
            className="mb-3"
            controlId="description"
          >
            <Form.Label>
              Description
            </Form.Label>

            <Form.Control
              ref={descriptionRef}
              type="text"
              required
            />
          </Form.Group>

          <Form.Group
            className="mb-3"
            controlId="amount"
          >
            <Form.Label>
              Amount
            </Form.Label>

            <Form.Control
              ref={amountRef}
              type="number"
              min={0.01}
              step={0.01}
              required
            />
          </Form.Group>

          <Form.Group
            className="mb-3"
            controlId="date"
          >
            <Form.Label>
              Date
            </Form.Label>

            <Form.Control
              type="date"
              value={date}
              min={minDate}
              max={maxDate}
              onChange={(event) =>
                setDate(
                  event.target.value
                )
              }
              required
            />
          </Form.Group>

          <Form.Group
            className="mb-3"
            controlId="account"
          >
            <Form.Label>
              Account
            </Form.Label>

            <AccountDropdown
              value={accountId}
              onChange={setAccountId}
            />
          </Form.Group>

          <Form.Group
            className="mb-3"
            controlId="budgetId"
          >
            <Form.Label>
              Envelope
            </Form.Label>

            <EnvelopeDropdown
              value={budgetId}
              onChange={setBudgetId}
            />
          </Form.Group>

          <div className="d-flex justify-content-end">
            <Button
              type="submit"
              variant="primary"
              disabled={!accountId}
            >
              Add
            </Button>
          </div>
        </Modal.Body>
      </Form>
    </Modal>
  );
}
