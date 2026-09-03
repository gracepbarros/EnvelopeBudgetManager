import { useEffect, useRef, useState } from "react";
import { Button, Form, Modal } from "react-bootstrap";
import { useIncome } from "../contexts/IncomeContext";
import AccountDropdown from "./AccountDropdown";

export default function AddIncomeModal({
  show,
  handleClose,
}) {
  const descriptionRef = useRef();
  const amountRef = useRef();
  const dateRef = useRef();

  const [accountId, setAccountId] = useState("");

  const { addIncome } = useIncome();

  const today = new Date();

  const defaultDate = `${today.getFullYear()}-${String(
    today.getMonth() + 1
  ).padStart(2, "0")}-${String(today.getDate()).padStart(
    2,
    "0"
  )}`;

  function handleSubmit(e) {
    e.preventDefault();

    addIncome({
      description: descriptionRef.current.value,
      amount: parseFloat(amountRef.current.value),
      date: dateRef.current.value,
      accountId,
    });

    handleClose();
  }

  useEffect(() => {
    if (show) {
      setAccountId("");
    }
  }, [show]);

  return (
    <Modal show={show} onHide={handleClose}>
      <Form onSubmit={handleSubmit}>
        <Modal.Header closeButton>
          <Modal.Title>Add Income</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form.Group
            className="mb-3"
            controlId="incomeDescription"
          >
            <Form.Label>Description</Form.Label>

            <Form.Control
              ref={descriptionRef}
              type="text"
              placeholder="e.g. Paycheque"
              required
            />
          </Form.Group>

          <Form.Group
            className="mb-3"
            controlId="incomeAmount"
          >
            <Form.Label>Amount</Form.Label>

            <Form.Control
              ref={amountRef}
              type="number"
              min={0}
              step={0.01}
              required
            />
          </Form.Group>

          <Form.Group
            className="mb-3"
            controlId="incomeDate"
          >
            <Form.Label>Date</Form.Label>

            <Form.Control
              ref={dateRef}
              type="date"
              defaultValue={defaultDate}
              required
            />
          </Form.Group>

          <Form.Group
            className="mb-3"
            controlId="incomeAccount"
          >
            <Form.Label>Account</Form.Label>

            <AccountDropdown
              value={accountId}
              onChange={setAccountId}
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
