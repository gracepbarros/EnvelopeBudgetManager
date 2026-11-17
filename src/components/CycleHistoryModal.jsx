import {Alert, Badge, Button, Card, Col, Modal, Row, Spinner, Stack } from "react-bootstrap";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useBudgetCycle } from "../contexts/BudgetCycleContext";
import { currencyFormatter } from "../utils";

function formatDate(date) {
  if (!date) return "Present";

  return new Date(
    `${date}T00:00:00`
  ).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function CycleDates({ cycle }) {
  return (
    <>
      {formatDate(cycle.start_date)}
      {" – "}
      {cycle.end_date
        ? formatDate(cycle.end_date)
        : "Present"}
    </>
  );
}

export default function CycleHistoryModal({
  show,
  handleClose,
}) {
  const {
    activeCycle,
    pausedCycle,
    cycleHistory,
    isReopenedCycle,
    reopeningCycle,
    reopenPreviousCycle,
  } = useBudgetCycle();

  const [selectedCycle, setSelectedCycle] =
    useState(null);

  const [report, setReport] =
    useState(null);

  const [loadingReport, setLoadingReport] =
    useState(false);

  const [reportError, setReportError] =
    useState("");

  const [
    showReopenConfirmation,
    setShowReopenConfirmation,
  ] = useState(false);

  useEffect(() => {
    if (!show) {
      setSelectedCycle(null);
      setReport(null);
      setReportError("");
      setShowReopenConfirmation(false);
    }
  }, [show]);

  async function loadCycleReport(cycle) {
    setSelectedCycle(cycle);
    setLoadingReport(true);
    setReport(null);
    setReportError("");

    try {
      const [
        incomesResult,
        allocationsResult,
        expensesResult,
      ] = await Promise.all([
        supabase
          .from("incomes")
          .select("amount")
          .eq("cycle_id", cycle.id),

        supabase
          .from("envelope_allocations")
          .select("allocated")
          .eq("cycle_id", cycle.id),

        supabase
          .from("expenses")
          .select("amount")
          .eq("cycle_id", cycle.id),
      ]);

      if (incomesResult.error) {
        throw incomesResult.error;
      }

      if (allocationsResult.error) {
        throw allocationsResult.error;
      }

      if (expensesResult.error) {
        throw expensesResult.error;
      }

      const totalIncome = (
        incomesResult.data ?? []
      ).reduce(
        (total, income) =>
          total + Number(income.amount),
        0
      );

      const totalAllocated = (
        allocationsResult.data ?? []
      ).reduce(
        (total, allocation) =>
          total +
          Number(allocation.allocated),
        0
      );

      const totalExpenses = (
        expensesResult.data ?? []
      ).reduce(
        (total, expense) =>
          total + Number(expense.amount),
        0
      );

      const carryoverIn = Number(
        cycle.carryover_amount ?? 0
      );

      const availableAtClose =
        carryoverIn +
        totalIncome -
        totalAllocated;

      setReport({
        carryoverIn,
        totalIncome,
        totalAllocated,
        totalExpenses,
        availableAtClose,
      });
    } catch (error) {
      console.error(
        "Error loading cycle report:",
        error
      );

      setReportError(
        "Could not load this cycle report."
      );
    } finally {
      setLoadingReport(false);
    }
  }

  async function handleReopen() {
    try {
      await reopenPreviousCycle();

      setShowReopenConfirmation(false);
      handleClose();
    } catch (error) {
      console.error(
        "Could not reopen previous cycle:",
        error
      );
    }
  }

  return (
    <>
      <Modal
        show={show}
        onHide={handleClose}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <div>
            <Modal.Title>
              Budget Cycle History
            </Modal.Title>

            <div className="text-secondary small mt-1">
              Review previous budget periods
              without losing your current data.
            </div>
          </div>
        </Modal.Header>

        <Modal.Body className="bg-light">
          {isReopenedCycle && (
            <Alert variant="warning">
              <div className="fw-semibold">
                Editing a previous cycle
              </div>

              <div className="small mt-1">
                Your current cycle is safely
                paused. When you close this
                previous cycle again, your
                current cycle will resume with
                its carryover recalculated.
              </div>

              {pausedCycle && (
                <div className="small mt-2">
                  Paused current cycle:{" "}
                  <strong>
                    <CycleDates
                      cycle={pausedCycle}
                    />
                  </strong>
                </div>
              )}
            </Alert>
          )}

          {activeCycle && (
            <Card className="mb-4 shadow-sm border-0">
              <Card.Body>
                <Stack
                  direction="horizontal"
                  className="justify-content-between"
                >
                  <div>
                    <div className="text-secondary small">
                      {isReopenedCycle
                        ? "Cycle being edited"
                        : "Current cycle"}
                    </div>

                    <div className="fw-semibold fs-5">
                      <CycleDates
                        cycle={activeCycle}
                      />
                    </div>
                  </div>

                  <Badge
                    bg={
                      isReopenedCycle
                        ? "warning"
                        : "success"
                    }
                    text={
                      isReopenedCycle
                        ? "dark"
                        : undefined
                    }
                  >
                    {isReopenedCycle
                      ? "Reopened"
                      : "Active"}
                  </Badge>
                </Stack>

                <div className="mt-3 text-secondary small">
                  Carryover in:{" "}
                  <span className="fw-semibold text-dark">
                    {currencyFormatter.format(
                      Number(
                        activeCycle.carryover_amount ??
                          0
                      )
                    )}
                  </span>
                </div>
              </Card.Body>
            </Card>
          )}

          <div className="fw-semibold mb-2">
            Previous Cycles
          </div>

          {cycleHistory.length === 0 ? (
            <Card className="border-0">
              <Card.Body className="text-center text-secondary py-4">
                No closed cycles yet.
              </Card.Body>
            </Card>
          ) : (
            <Stack gap={2}>
              {cycleHistory.map(
                (cycle, index) => {
                  const canReopen =
                    index === 0 &&
                    !isReopenedCycle;

                  const isSelected =
                    selectedCycle?.id ===
                    cycle.id;

                  return (
                    <Card
                      key={cycle.id}
                      className="border-0 shadow-sm"
                    >
                      <Card.Body>
                        <Stack
                          direction="horizontal"
                          className="justify-content-between align-items-start"
                          gap={3}
                        >
                          <div>
                            <div className="fw-semibold">
                              <CycleDates
                                cycle={cycle}
                              />
                            </div>

                            <div className="small text-secondary mt-1">
                              Carryover in:{" "}
                              {currencyFormatter.format(
                                Number(
                                  cycle.carryover_amount ??
                                    0
                                )
                              )}
                            </div>
                          </div>

                          <Stack
                            direction="horizontal"
                            gap={2}
                          >
                            <Button
                              size="sm"
                              variant={
                                isSelected
                                  ? "secondary"
                                  : "outline-secondary"
                              }
                              onClick={() =>
                                loadCycleReport(
                                  cycle
                                )
                              }
                            >
                              {isSelected
                                ? "Report Open"
                                : "View Report"}
                            </Button>

                            {canReopen && (
                              <Button
                                size="sm"
                                variant="outline-primary"
                                onClick={() =>
                                  setShowReopenConfirmation(
                                    true
                                  )
                                }
                              >
                                Reopen
                              </Button>
                            )}
                          </Stack>
                        </Stack>

                        {isSelected && (
                          <div className="mt-3 pt-3 border-top">
                            {loadingReport && (
                              <div className="text-center py-3">
                                <Spinner
                                  size="sm"
                                  className="me-2"
                                />
                                Loading report...
                              </div>
                            )}

                            {reportError && (
                              <Alert
                                variant="danger"
                                className="mb-0"
                              >
                                {reportError}
                              </Alert>
                            )}

                            {report &&
                              !loadingReport && (
                                <>
                                  <Row className="g-3">
                                    <Col
                                      xs={6}
                                      md={3}
                                    >
                                      <div className="small text-secondary">
                                        Carryover In
                                      </div>
                                      <div className="fw-semibold">
                                        {currencyFormatter.format(
                                          report.carryoverIn
                                        )}
                                      </div>
                                    </Col>

                                    <Col
                                      xs={6}
                                      md={3}
                                    >
                                      <div className="small text-secondary">
                                        Income
                                      </div>
                                      <div className="fw-semibold">
                                        {currencyFormatter.format(
                                          report.totalIncome
                                        )}
                                      </div>
                                    </Col>

                                    <Col
                                      xs={6}
                                      md={3}
                                    >
                                      <div className="small text-secondary">
                                        Allocated
                                      </div>
                                      <div className="fw-semibold">
                                        {currencyFormatter.format(
                                          report.totalAllocated
                                        )}
                                      </div>
                                    </Col>

                                    <Col
                                      xs={6}
                                      md={3}
                                    >
                                      <div className="small text-secondary">
                                        Expenses
                                      </div>
                                      <div className="fw-semibold">
                                        {currencyFormatter.format(
                                          report.totalExpenses
                                        )}
                                      </div>
                                    </Col>
                                  </Row>

                                  <div className="mt-3 pt-3 border-top d-flex justify-content-between align-items-center">
                                    <span className="text-secondary">
                                      Available at close
                                    </span>

                                    <span
                                      className={`fw-bold ${
                                        report.availableAtClose <
                                        0
                                          ? "text-danger"
                                          : "text-success"
                                      }`}
                                    >
                                      {currencyFormatter.format(
                                        report.availableAtClose
                                      )}
                                    </span>
                                  </div>
                                </>
                              )}
                          </div>
                        )}
                      </Card.Body>
                    </Card>
                  );
                }
              )}
            </Stack>
          )}
        </Modal.Body>

        <Modal.Footer>
          <Button
            variant="outline-secondary"
            onClick={handleClose}
          >
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal
        show={showReopenConfirmation}
        onHide={() =>
          setShowReopenConfirmation(false)
        }
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>
            Reopen Previous Cycle?
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <p>
            Your current cycle will be
            temporarily paused while you edit
            the previous cycle.
          </p>

          <p className="text-secondary mb-0">
            Nothing from your current cycle
            will be deleted. When you close the
            reopened cycle again, the current
            cycle will resume and its carryover
            will be recalculated.
          </p>
        </Modal.Body>

        <Modal.Footer>
          <Button
            variant="outline-secondary"
            onClick={() =>
              setShowReopenConfirmation(false)
            }
            disabled={reopeningCycle}
          >
            Cancel
          </Button>

          <Button
            variant="primary"
            onClick={handleReopen}
            disabled={reopeningCycle}
          >
            {reopeningCycle
              ? "Reopening..."
              : "Reopen Cycle"}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}