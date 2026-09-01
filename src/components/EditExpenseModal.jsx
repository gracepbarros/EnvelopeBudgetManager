import { useRef } from "react";
import { Modal, Form, Button } from "react-bootstrap";
import { useBudgets, UNASSIGNED_BUDGET_ID } from "../contexts/BudgetsContext";

export default function EditExpenseModal({ expenseId, show, handleClose }) {
  const nameRef = useRef();
  const amountRef = useRef();
  const budgetIdRef = useRef();
  const dateRef = useRef();
  const paymentMethodRef = useRef();
  const { editExpense, expenses, budgets } = useBudgets();

  const actualExpense = expenses.filter((exp) => exp.id === expenseId);

  function handleSubmit(e) {
    e.preventDefault();
    editExpense({
      expenseId: expenseId,
      newName: nameRef.current.value,
      newAmount: parseFloat(amountRef.current.value),
      newBudgetId: budgetIdRef.current.value,
      newDate: dateRef.current.value,
      newPaymentMethod: paymentMethodRef.current.value,
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

          <Form.Group className="mb-3" controlId="paymentMethod">
            <Form.Label>Payment Method</Form.Label>
            <Form.Control
              ref={paymentMethodRef}
              type="text"
              defaultValue={
                actualExpense.length !== 0
                  ? actualExpense[0].paymentMethod || ""
                  : ""
              }
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="budgetId">
            <Form.Label>Envelope</Form.Label>
            <Form.Select
              defaultValue={
                actualExpense.length !== 0
                  ? actualExpense[0].budgetId
                  : UNASSIGNED_BUDGET_ID
              }
              ref={budgetIdRef}
            >
              <option value={UNASSIGNED_BUDGET_ID}>Unassigned</option>
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
