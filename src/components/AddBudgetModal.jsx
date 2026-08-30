import { useRef } from "react";
import { Modal, Form, Button } from "react-bootstrap";
import { useBudgets } from "../contexts/BudgetsContext";

export default function AddBudgetModal({ show, handleClose }) {
  const nameRef = useRef();
  const allocatedRef = useRef();
  const { addBudget } = useBudgets();
  function handleSubmit(e) {
    e.preventDefault();
    addBudget({
      name: nameRef.current.value,
      allocated: parseFloat(allocatedRef.current.value),
    });
    handleClose();
  }

  return (
    <Modal show={show} onHide={handleClose}>
      <Form onSubmit={handleSubmit}>
        <Modal.Header closeButton>
          <Modal.Title>New Budget</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3" controlId="name">
            <Form.Label>Name</Form.Label>
            <Form.Control ref={nameRef} type="text" required></Form.Control>
          </Form.Group>
          <Form.Group className="mb-3" controlId="allocated">
            <Form.Label>Allocated Amount</Form.Label>
            <Form.Control
              ref={allocatedRef}
              type="number"
              min={0}
              step={0.01}
              required
            ></Form.Control>
          </Form.Group>
          <div className="d-flex justify-content-end">
            <Button type="submit" variant="primary">
              Add
            </Button>
          </div>
        </Modal.Body>
      </Form>
    </Modal>
  );
}
