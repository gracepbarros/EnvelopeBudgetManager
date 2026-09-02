import { useEffect, useRef, useState } from "react";
import { Modal, Form, Button } from "react-bootstrap";
import { useBudgets, UNASSIGNED_BUDGET_ID } from "../contexts/BudgetsContext";
import AccountDropdown from "./AccountDropdown";
import EnvelopeDropdown from "./EnvelopeDropdown";

export default function EditExpenseModal({ expenseId, show, handleClose }) {
  const nameRef = useRef();
  const amountRef = useRef();
  const dateRef = useRef();
  const { editExpense, expenses } = useBudgets();
  
  const actualExpense = expenses.filter((exp) => exp.id === expenseId);
  const [budgetId, setBudgetId] = useState("");
  const [accountId, setAccountId] = useState("");

  useEffect(() => {
    if (actualExpense.length !== 0) {
      setAccountId(actualExpense[0].accountId || "");
      setBudgetId(
        actualExpense[0].budgetId || UNASSIGNED_BUDGET_ID
      );
    }
  }, [expenseId, show, expenses]);

  function handleSubmit(e) {
    e.preventDefault();
    editExpense({
      expenseId,
      newName: nameRef.current.value,
      newAmount: parseFloat(amountRef.current.value),
      newBudgetId: budgetId,
      newDate: dateRef.current.value,
      newAccountId: accountId,
    });
    handleClose();
  }

  return (
    <Modal show={show} onHide={handleClose}>
      <Form onSubmit={handleSubmit}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Expense</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3" controlId="name">
            <Form.Label>Description</Form.Label>
            <Form.Control
              required
              ref={nameRef}
              type="text"
              defaultValue={
                actualExpense.length !== 0 ? actualExpense[0].description : ""
              }
            ></Form.Control>
          </Form.Group>
          <Form.Group className="mb-3" controlId="amount">
            <Form.Label>Amount</Form.Label>
            <Form.Control
              required
              ref={amountRef}
              type="number"
              min={0}
              step={0.01}
              defaultValue={
                actualExpense.length !== 0 ? actualExpense[0].amount : ""
              }
            ></Form.Control>
          </Form.Group>

          <Form.Group className="mb-3" controlId="date">
            <Form.Label>Date</Form.Label>
            <Form.Control
              required
              ref={dateRef}
              type="date"
              defaultValue={
                actualExpense.length !== 0 ? actualExpense[0].date : ""
              }
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="editExpenseAccount">
            <Form.Label>Account</Form.Label>
            <AccountDropdown
              value={accountId}
              onChange={setAccountId}
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="budgetId">
            <Form.Label>Envelope</Form.Label>
              <EnvelopeDropdown
                value={budgetId}
                onChange={setBudgetId}
              />
          </Form.Group>

          <div className="d-flex justify-content-end">
            <Button type="submit" variant="primary" disabled={!accountId}>
              Save
            </Button>
          </div>
        </Modal.Body>
      </Form>
    </Modal>
  );
}
