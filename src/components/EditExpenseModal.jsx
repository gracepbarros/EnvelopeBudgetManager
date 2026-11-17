import { useEffect, useRef, useState } from "react";
import { Button, Form, Modal } from "react-bootstrap";
import { UNASSIGNED_BUDGET_ID, useBudgets } from "../contexts/BudgetsContext";
import { useBudgetCycle } from "../contexts/BudgetCycleContext";
import AccountDropdown from "./AccountDropdown";
import EnvelopeDropdown from "./EnvelopeDropdown";

export default function EditExpenseModal({
  expenseId,
  show,
  handleClose,
}) {
  const nameRef = useRef();
  const amountRef = useRef();

  const { editExpense, expenses } = useBudgets();
  const { activeCycle } = useBudgetCycle();

  const actualExpense = expenses.find(
    (expense) => expense.id === expenseId
  );

  const [budgetId, setBudgetId] = useState("");
  const [accountId, setAccountId] = useState("");
  const [date, setDate] = useState("");

  const today = new Date().toLocaleDateString("en-CA");

  const minDate = activeCycle?.start_date ?? "";
  const maxDate = activeCycle?.end_date ?? today;

  useEffect(() => {
    if (actualExpense) {
      setAccountId(actualExpense.accountId || "");

      setBudgetId(
        actualExpense.budgetId ||
          UNASSIGNED_BUDGET_ID
      );

      setDate(actualExpense.date || "");
    }
  }, [
    expenseId,
    show,
    expenses,
    actualExpense,
  ]);

  async function handleSubmit(event) {
    event.preventDefault();

    await editExpense({
      expenseId,
      newName: nameRef.current.value,
      newAmount: parseFloat(
        amountRef.current.value
      ),
      newBudgetId: budgetId,
      newDate: date,
      newAccountId: accountId,
    });

    handleClose();
  }

  return (
    <Modal show={show} onHide={handleClose}>
      <Form onSubmit={handleSubmit}>
        <Modal.Header closeButton>
          <Modal.Title>
            Edit Expense
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form.Group
            className="mb-3"
            controlId="name"
          >
            <Form.Label>
              Description
            </Form.Label>

            <Form.Control
              required
              ref={nameRef}
              type="text"
              defaultValue={
                actualExpense?.description ?? ""
              }
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
              required
              ref={amountRef}
              type="number"
              min={0.01}
              step={0.01}
              defaultValue={
                actualExpense?.amount ?? ""
              }
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
              required
              type="date"
              value={date}
              min={minDate}
              max={maxDate}
              onChange={(event) =>
                setDate(event.target.value)
              }
            />
          </Form.Group>

          <Form.Group
            className="mb-3"
            controlId="editExpenseAccount"
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
              Save
            </Button>
          </div>
        </Modal.Body>
      </Form>
    </Modal>
  );
}
