import { useRef, useEffect, useState } from "react";
import { Button, Form, Modal } from "react-bootstrap";
import { useIncome } from "../contexts/IncomeContext";
import AccountDropdown from "./AccountDropdown";

export default function EditIncomeModal({
  incomeId,
  show,
  handleClose,
}) {
  const descriptionRef = useRef();
  const amountRef = useRef();
  const dateRef = useRef();
  const [accountId, setAccountId] = useState("");

  const { editIncome, incomes } = useIncome();
  
  const income = incomes.find(
      (item) => item.id === incomeId
    );

  useEffect(() => {
    if (show && income) {
      setAccountId(income.accountId || "");
    }
  }, [show, incomeId, incomes]);

  function handleSubmit(e) {
    e.preventDefault();

    editIncome({
      incomeId,
      newDescription: descriptionRef.current.value,
      newAmount: parseFloat(amountRef.current.value),
      newDate: dateRef.current.value,
      newAccountId: accountId,
    });

    handleClose();
  }

  return (
    <Modal show={show} onHide={handleClose}>
      <Form onSubmit={handleSubmit}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Income</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form.Group
            className="mb-3"
            controlId="editIncomeDescription"
          >
            <Form.Label>Description</Form.Label>

            <Form.Control
              ref={descriptionRef}
              type="text"
              defaultValue={income?.description || ""}
              required
            />
          </Form.Group>

          <Form.Group
            className="mb-3"
            controlId="editIncomeAmount"
          >
            <Form.Label>Amount</Form.Label>

            <Form.Control
              ref={amountRef}
              type="number"
              min={0}
              step={0.01}
              defaultValue={income?.amount || ""}
              required
            />
          </Form.Group>

          <Form.Group
            className="mb-3"
            controlId="editIncomeDate"
          >
            <Form.Label>Date</Form.Label>

            <Form.Control
              ref={dateRef}
              type="date"
              defaultValue={income?.date || ""}
              required
            />
          </Form.Group>

          <Form.Group
            className="mb-3"
            controlId="editIncomeAccount"
          >
            <Form.Label>Account</Form.Label>

            <AccountDropdown
              value={accountId}
              onChange={setAccountId}
            />
          </Form.Group>

          <Button 
            type="submit" 
            variant="primary"
            className="ms-auto"
            disabled={!accountId}
          >
            Save
          </Button>             
        </Modal.Body>
      </Form>
    </Modal>
  );
}
