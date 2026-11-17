import { useEffect, useRef, useState } from "react";
import { Button, Form, Modal } from "react-bootstrap";
import { useIncome } from "../contexts/IncomeContext";
import { useBudgetCycle } from "../contexts/BudgetCycleContext";
import AccountDropdown from "./AccountDropdown";

export default function EditIncomeModal({
  incomeId,
  show,
  handleClose,
}) {
  const descriptionRef = useRef();
  const amountRef = useRef();

  const [accountId, setAccountId] = useState("");
  const [date, setDate] = useState("");

  const { editIncome, incomes } = useIncome();
  const { activeCycle } = useBudgetCycle();

  const income = incomes.find(
    (item) => item.id === incomeId
  );

  const today = new Date().toLocaleDateString("en-CA");

  const minDate = activeCycle?.start_date ?? "";
  const maxDate = activeCycle?.end_date ?? today;

  useEffect(() => {
    if (show && income) {
      setAccountId(income.accountId || "");
      setDate(income.date || "");
    }
  }, [show, incomeId, incomes, income]);

  async function handleSubmit(event) {
    event.preventDefault();

    await editIncome({
      incomeId,
      newDescription: descriptionRef.current.value,
      newAmount: parseFloat(
        amountRef.current.value
      ),
      newDate: date,
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
              min={0.01}
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
            controlId="editIncomeAccount"
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
              Save
            </Button>
          </div>
        </Modal.Body>
      </Form>
    </Modal>
  );
}
