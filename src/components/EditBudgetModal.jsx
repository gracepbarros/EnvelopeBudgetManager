import { useRef } from "react";
import { Modal, Form, Button, Stack } from "react-bootstrap";
import { useBudgets, UNASSIGNED_BUDGET_ID } from "../contexts/BudgetsContext";

export default function EditBudgetModal({ budgetId, show, handleClose }) {
  const nameRef = useRef();
  const allocatedRef = useRef();
  const { editBudget, deleteBudget, budgets } = useBudgets();

  const actualBudget = budgets.filter((bgt) => bgt.id === budgetId);
  
  const budget = budgets.find((b) => b.id === budgetId);

  function handleSubmit(e) {
    e.preventDefault();
    editBudget({
      budgetId: budgetId,
      newName: nameRef.current.value,
      newAllocated: parseFloat(allocatedRef.current.value),
    });
    handleClose();
  }

  return (
    <Modal show={show} onHide={handleClose}>
      <Form onSubmit={handleSubmit}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Envelope</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3" controlId="name">
            <Form.Label>Name</Form.Label>
            <Form.Control
              required
              ref={nameRef}
              type="text"
              defaultValue={
                actualBudget.length !== 0 ? actualBudget[0].name : ""
              }
            ></Form.Control>
          </Form.Group>
          <Form.Group className="mb-3" controlId="allocated">
            <Form.Label>Allocated Amount</Form.Label>
            <Form.Control
              required
              ref={allocatedRef}
              type="number"
              min={0}
              step={0.01}
              defaultValue={
                actualBudget.length !== 0 ? actualBudget[0].allocated : ""
              }
            ></Form.Control>
          </Form.Group>

          <Stack 
            direction="horizontal"   
            className="justify-content-between"
          >
              {budgetId !== UNASSIGNED_BUDGET_ID && (
                <Button
                  onClick={() => {
                    deleteBudget(budget.id);
                    handleClose();
                  }}
                  variant="danger"
                  size="sm"
                >
                  Delete
                </Button>
              )}

            <Button 
              type="submit" 
              variant="primary"
              className="ms-auto"
            >
              Save
            </Button>
          
          </Stack>
          
        </Modal.Body>
      </Form>
    </Modal>
  );
}
