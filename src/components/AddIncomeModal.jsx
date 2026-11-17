import { useEffect, useRef, useState } from "react";
import { Button, Form, Modal } from "react-bootstrap";
import { useIncome } from "../contexts/IncomeContext";
import { useBudgetCycle } from "../contexts/BudgetCycleContext";
import AccountDropdown from "./AccountDropdown";

export default function AddIncomeModal({
  show,
  handleClose,
}) {
  const descriptionRef = useRef();
  const amountRef = useRef();

  const [accountId, setAccountId] = useState("");

  const { addIncome } = useIncome();
  const { activeCycle } = useBudgetCycle();

  const today = new Date().toLocaleDateString("en-CA");

  const minDate = activeCycle?.start_date ?? "";
  const maxDate = activeCycle?.end_date ?? today;

  const [date, setDate] = useState(today);

  useEffect(() => {
    if (show) {
      setAccountId("");

      setDate(
        activeCycle?.end_date ?? today
      );
    }
  }, [
    show,
    activeCycle,
    today,
  ]);

  async function handleSubmit(event) {
    event.preventDefault();

    await addIncome({
      description:
        descriptionRef.current.value,
      amount: parseFloat(
        amountRef.current.value
      ),
      date,
      accountId,
    });

    handleClose();
  }

  return (
    <Modal show={show} onHide={handleClose}>
      <Form onSubmit={handleSubmit}>
        <Modal.Header closeButton>
          <Modal.Title>
            Add Income
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form.Group
            className="mb-3"
            controlId="addIncomeDescription"
          >
            <Form.Label>
              Description
            </Form.Label>

            <Form.Control
              ref={descriptionRef}
              type="text"
              placeholder="e.g. Paycheque"
              required
            />
          </Form.Group>

          <Form.Group
            className="mb-3"
            controlId="addIncomeAmount"
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
            controlId="addIncomeDate"
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
                setDate(event.target.value)
              }
              required
            />
          </Form.Group>

          <Form.Group
            className="mb-3"
            controlId="addIncomeAccount"
          >
            <Form.Label>
              Account
            </Form.Label>

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
