import { useEffect, useRef, useState } from "react";
import { Modal, Form, Button } from "react-bootstrap";
import {useBudgets, UNASSIGNED_BUDGET_ID } from "../contexts/BudgetsContext";
import AccountDropdown from "./AccountDropdown";
import EnvelopeDropdown from "./EnvelopeDropdown";

export default function AddExpenseModal({
  show,
  handleClose,
  defaultBudgetId,
}) {
  const descriptionRef = useRef();
  const amountRef = useRef();
  const dateRef = useRef();
  const [budgetId, setBudgetId] = useState(defaultBudgetId || UNASSIGNED_BUDGET_ID);
  const [accountId, setAccountId] = useState("");
  const { addExpense } = useBudgets();

  const today = new Date();
  const defaultDate = `${today.getFullYear()}-${String(
    today.getMonth() + 1
  ).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  function handleSubmit(e) {
    e.preventDefault();
    addExpense({
      description: descriptionRef.current.value,
      amount: parseFloat(amountRef.current.value),
      budgetId,
      date: dateRef.current.value,
      accountId,
    });
    handleClose();
  }

  useEffect(() => {
    if (show) {
      setBudgetId(defaultBudgetId || UNASSIGNED_BUDGET_ID);
      setAccountId("");
    }
  }, [show, defaultBudgetId]);

  return (
    <Modal show={show} onHide={handleClose}>
      <Form onSubmit={handleSubmit}>
        <Modal.Header closeButton>
          <Modal.Title>New Expense</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3" controlId="description">
            <Form.Label>Description</Form.Label>
            <Form.Control
              ref={descriptionRef}
              type="text"
              required
            ></Form.Control>
          </Form.Group>

          <Form.Group className="mb-3" controlId="amount">
            <Form.Label>Amount</Form.Label>
            <Form.Control
              ref={amountRef}
              type="number"
              min={0}
              step={0.01}
              required
            ></Form.Control>
          </Form.Group>

          <Form.Group className="mb-3" controlId="date">
            <Form.Label>Date</Form.Label>
            <Form.Control
              ref={dateRef}
              type="date"
              defaultValue={defaultDate}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="account">
            <Form.Label>Account</Form.Label>

            <AccountDropdown
              value={accountId}
              onChange={setAccountId}
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="budgetId">
            <EnvelopeDropdown
              value={budgetId}
              onChange={setBudgetId}
            />
          </Form.Group>

          <div className="d-flex justify-content-end">
            <Button type="submit" variant="primary" disabled={!accountId}>
              Add
            </Button>
          </div>
        </Modal.Body>
      </Form>
    </Modal>
  );
}
