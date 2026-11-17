import { useEffect, useState } from "react";
import { Alert, Button, Form, Modal } from "react-bootstrap";
import { useBudgetCycle } from "../contexts/BudgetCycleContext";

function formatDate(date) {
  if (!date) return "";

  return new Date(
    `${date}T00:00:00`
  ).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function addDays(dateString, amount) {
  const date = new Date(
    `${dateString}T00:00:00`
  );

  date.setDate(date.getDate() + amount);

  const year = date.getFullYear();
  const month = String(
    date.getMonth() + 1
  ).padStart(2, "0");
  const day = String(
    date.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getToday() {
  const date = new Date();

  const year = date.getFullYear();
  const month = String(
    date.getMonth() + 1
  ).padStart(2, "0");
  const day = String(
    date.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export default function EditCycleDatesModal({
  show,
  handleClose,
}) {
  const {
    activeCycle,
    pausedCycle,
    isReopenedCycle,
    updatingCycleDates,
    updateReopenedCycleEndDate,
  } = useBudgetCycle();

  const [endDate, setEndDate] = useState("");
  const [errorMessage, setErrorMessage] =
    useState("");

  const today = getToday();
  const latestEndDate = addDays(today, -1);

  useEffect(() => {
    if (show && activeCycle) {
      setEndDate(
        activeCycle.end_date ?? ""
      );

      setErrorMessage("");
    }
  }, [show, activeCycle]);

  const newCurrentStartDate = endDate
    ? addDays(endDate, 1)
    : "";

  async function handleSubmit(event) {
    event.preventDefault();

    setErrorMessage("");

    try {
      await updateReopenedCycleEndDate(
        endDate
      );

      handleClose();
    } catch (error) {
      setErrorMessage(
        error?.message ||
          "Could not update the cycle dates."
      );
    }
  }

  if (!isReopenedCycle) {
    return null;
  }

  return (
    <Modal
      show={show}
      onHide={handleClose}
      centered
    >
      <Form onSubmit={handleSubmit}>
        <Modal.Header closeButton>
          <Modal.Title>
            Edit Cycle Dates
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {errorMessage && (
            <Alert variant="danger">
              {errorMessage}
            </Alert>
          )}

          <div className="mb-3">
            <div className="text-muted">
              Previous cycle started
            </div>

            <div className="fw-semibold">
              {formatDate(
                activeCycle?.start_date
              )}
            </div>
          </div>

          <Form.Group
            className="mb-3"
            controlId="cycleEndDate"
          >
            <Form.Label>
              Previous Cycle End Date
            </Form.Label>

            <Form.Control
              type="date"
              value={endDate}
              min={
                activeCycle?.start_date ??
                ""
              }
              max={latestEndDate}
              onChange={(event) =>
                setEndDate(
                  event.target.value
                )
              }
              required
            />

            <Form.Text className="text-muted">
              The current cycle will
              automatically begin on the
              following day.
            </Form.Text>
          </Form.Group>

          {newCurrentStartDate && (
            <div className="border-top pt-3">
              <div className="text-muted">
                Current cycle will begin
              </div>

              <div className="fw-semibold">
                {formatDate(
                  newCurrentStartDate
                )}
              </div>

              {pausedCycle?.start_date && (
                <div className="small text-muted mt-1">
                  Currently starts{" "}
                  {formatDate(
                    pausedCycle.start_date
                  )}
                </div>
              )}
            </div>
          )}

          <Alert
            variant="light"
            className="border mt-3 mb-0"
          >
            Income and expenses must remain
            inside their cycle dates. The
            change will be blocked if it would
            leave an existing transaction
            outside its cycle.
          </Alert>
        </Modal.Body>

        <Modal.Footer>
          <Button
            variant="outline-secondary"
            onClick={handleClose}
            disabled={updatingCycleDates}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            variant="primary"
            disabled={
              updatingCycleDates ||
              !endDate
            }
          >
            {updatingCycleDates
              ? "Saving..."
              : "Save Dates"}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}