import { useRef } from "react";
import { Modal, Form, Button } from "react-bootstrap";
import {
  useBudgets,
  UNCATEGORIZED_BUDGET_ID,
} from "../contexts/BudgetsContext";

export default function EditExpenseModal({ expenseId, show, handleClose }) {
  const nameRef = useRef();
  const amountRef = useRef();
  const budgetIdRef = useRef();
  const { editExpense, expenses, budgets } = useBudgets();

  const actualExpense = expenses.filter((exp) => exp.id === expenseId);

  function handleSubmit(e) {
    e.preventDefault();
    console.log(budgetIdRef.current.value);
    editExpense({
      expenseId: expenseId,
      newName: nameRef.current.value,
      newAmount: parseFloat(amountRef.current.value),
      newBudgetId: budgetIdRef.current.value,
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
          <Form.Group className="mb-3" controlId="max">
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

          <Form.Group className="mb-3" controlId="budgetId">
            <Form.Label>Budget</Form.Label>
            <Form.Select
              defaultValue={
                actualExpense.length !== 0
                  ? actualExpense[0].budgetId
                  : UNCATEGORIZED_BUDGET_ID
              }
              ref={budgetIdRef}
            >
              <option id={UNCATEGORIZED_BUDGET_ID}>Uncategorized</option>
              {budgets.map((budget) => (
                <option key={budget.id} value={budget.id}>
                  {budget.name}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          <div className="d-flex justify-content-end">
            <Button type="submit" variant="primary">
              Finish Edition
            </Button>
          </div>
        </Modal.Body>
      </Form>
    </Modal>
  );
}
