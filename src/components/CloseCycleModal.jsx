import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { useBudgetCycle } from "../contexts/BudgetCycleContext";

export default function CloseCycleModal({
  show,
  handleClose,
}) {
  const {
    activeCycle,
    isReopenedCycle,
    closingCycle,
    closeCurrentCycle,
  } = useBudgetCycle();

  async function handleConfirm() {
    try {
      await closeCurrentCycle();
      handleClose();
    } catch (error) {
      console.error(
        "Could not close budget cycle:",
        error
      );
    }
  }

  return (
    <Modal
      show={show}
      onHide={handleClose}
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title>
          {isReopenedCycle
            ? "Finish Previous Cycle?"
            : "Close Current Cycle?"}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {isReopenedCycle ? (
          <>
            <p>
              This will finish your corrections
              to the previous budget cycle.
            </p>

            <p className="text-secondary mb-0">
              Your paused current cycle will
              resume automatically. Its
              carryover will be recalculated
              using the corrected values from
              this cycle.
            </p>
          </>
        ) : (
          <>
            <p>
              This will close your current
              budget cycle and start a new one.
            </p>

            <p className="text-secondary mb-0">
              Your accounts and envelopes will
              remain. Income, expenses and
              envelope allocations will start
              fresh, while any unallocated
              money will carry over.
            </p>
          </>
        )}

        {activeCycle?.start_date && (
          <div className="mt-3 small text-secondary">
            {isReopenedCycle
              ? "Previous cycle started "
              : "Current cycle started "}

            <strong>
              {new Date(
                `${activeCycle.start_date}T00:00:00`
              ).toLocaleDateString()}
            </strong>

            {activeCycle?.end_date && (
              <>
                {" and originally ended "}
                <strong>
                  {new Date(
                    `${activeCycle.end_date}T00:00:00`
                  ).toLocaleDateString()}
                </strong>
              </>
            )}
            .
          </div>
        )}
      </Modal.Body>

      <Modal.Footer>
        <Button
          variant="outline-secondary"
          onClick={handleClose}
          disabled={closingCycle}
        >
          Cancel
        </Button>

        <Button
          variant={
            isReopenedCycle
              ? "primary"
              : "danger"
          }
          onClick={handleConfirm}
          disabled={closingCycle}
        >
          {closingCycle
            ? isReopenedCycle
              ? "Finishing..."
              : "Closing..."
            : isReopenedCycle
              ? "Finish Previous Cycle"
              : "Close Cycle"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}