import { Alert, Container, Dropdown, Stack } from "react-bootstrap";
import { useState } from "react";

import BudgetCard from "./components/BudgetCard";
import AddBudgetModal from "./components/AddBudgetModal";
import AddExpenseModal from "./components/AddExpenseModal";
import ViewExpenseModal from "./components/ViewExpenseModal";
import ViewAllExpensesModal from "./components/ViewAllExpensesModal";
import EditBudgetModal from "./components/EditBudgetModal";
import UnassignedBudgetCard from "./components/UnassignedBudgetCard";
import AddAccountModal from "./components/AddAccountModal";
import ViewAccountsModal from "./components/ViewAccountsModal";
import TotalBudgetCard from "./components/TotalBudgetCard";
import AddIncomeModal from "./components/AddIncomeModal";
import ViewIncomeModal from "./components/ViewIncomeModal";
import CycleCard from "./components/CycleCard";
import CloseCycleModal from "./components/CloseCycleModal";
import CycleHistoryModal from "./components/CycleHistoryModal";
import EditCycleDatesModal from "./components/EditCycleDatesModal";
import UserMenu from "./components/UserMenu";
import Footer from "./components/Footer";

import {
  UNASSIGNED_BUDGET_ID,
  useBudgets,
} from "./contexts/BudgetsContext";
import { useBudgetCycle } from "./contexts/BudgetCycleContext";
import { useAuth } from "./contexts/AuthContext";

function App() {
  const [
    showAddBudgetModal,
    setShowAddBudgetModal,
  ] = useState(false);

  const [
    viewExpenseModalBudgetId,
    setViewExpenseModalBudgetId,
  ] = useState();

  const [
    viewAllExpensesModal,
    setViewAllExpensesModal,
  ] = useState(false);

  const [
    showAddExpenseModal,
    setShowAddExpenseModal,
  ] = useState(false);

  const [
    addExpenseModalBudgetId,
    setAddExpenseModalBudgetId,
  ] = useState();

  const [
    showEditBudgetModal,
    setShowEditBudgetModal,
  ] = useState(false);

  const [
    editBudgetModalBudgetId,
    setEditBudgetModalBudgetId,
  ] = useState();

  const [
    showAddAccountModal,
    setShowAddAccountModal,
  ] = useState(false);

  const [
    viewAccountsModal,
    setViewAccountsModal,
  ] = useState(false);

  const [
    showAddIncomeModal,
    setShowAddIncomeModal,
  ] = useState(false);

  const [
    showViewIncomeModal,
    setShowViewIncomeModal,
  ] = useState(false);

  const [
    showCloseCycleModal,
    setShowCloseCycleModal,
  ] = useState(false);

  const [
    showCycleHistoryModal,
    setShowCycleHistoryModal,
  ] = useState(false);

  const [
  showEditCycleDatesModal,
  setShowEditCycleDatesModal,
  ] = useState(false);

  const [showMenu, setShowMenu] =
    useState(false);

  const {
    budgets,
    getBudgetExpenses,
  } = useBudgets();

  const {
    isReopenedCycle,
    activeCycle,
    pausedCycle,
  } = useBudgetCycle();

  const { user } = useAuth();

  const fullName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    "";

  const firstName =
    fullName.split(" ")[0] || "My";

  function openAddExpenseModal(budgetId) {
    setShowAddExpenseModal(true);
    setAddExpenseModalBudgetId(budgetId);
  }

  function openEditBudgetModal(budgetId) {
    setShowEditBudgetModal(true);
    setEditBudgetModalBudgetId(budgetId);
  }

  const primaryHover = {
    onMouseEnter: (event) =>
      event.currentTarget.classList.add(
        "bg-primary",
        "text-white"
      ),

    onMouseLeave: (event) =>
      event.currentTarget.classList.remove(
        "bg-primary",
        "text-white"
      ),
  };

  return (
    <div className="d-flex flex-column min-vh-100">
      <header className="bg-white border-bottom shadow-sm">
        <Container className="py-3 d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center gap-3">
            <div
              className="bg-success text-white d-flex align-items-center justify-content-center rounded-3 fw-bold"
              style={{
                width: "42px",
                height: "42px",
                fontSize: "1.3rem",
              }}
            >
              $
            </div>

            <span className="fs-4 fw-bold text-primary">
              Envelope Budget Manager
            </span>
          </div>

          <UserMenu />
        </Container>
      </header>

      <main className="flex-grow-1">
        <Container className="my-4">
          <Stack
            direction="horizontal"
            gap="2"
            className="flex-wrap w-100 mb-3"
          >
            <h1 className="fs-2 fw-bold mb-0 text-primary">
              {firstName}&apos;s Envelope Plan
            </h1>

            <Dropdown
              show={showMenu}
              onToggle={(isOpen) =>
                setShowMenu(isOpen)
              }
              onMouseEnter={() =>
                setShowMenu(true)
              }
              onMouseLeave={() =>
                setShowMenu(false)
              }
              align="end"
              className="ms-auto"
            >
              <Dropdown.Toggle
                variant="outline-secondary"
                id="actions-menu"
                aria-label="Open actions menu"
                className="d-flex align-items-center justify-content-center"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="26"
                  height="26"
                  fill="currentColor"
                  viewBox="0 0 16 16"
                >
                  <path
                    fillRule="evenodd"
                    d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5z"
                  />
                </svg>
              </Dropdown.Toggle>

              <Dropdown.Menu>
                <Dropdown.Item
                  {...primaryHover}
                  onClick={() =>
                    setShowAddBudgetModal(true)
                  }
                >
                  Add Envelope
                </Dropdown.Item>

                <Dropdown.Divider />

                <Dropdown.Item
                  {...primaryHover}
                  onClick={() =>
                    openAddExpenseModal()
                  }
                >
                  Add Expense
                </Dropdown.Item>

                <Dropdown.Item
                  {...primaryHover}
                  onClick={() =>
                    setViewAllExpensesModal(
                      true
                    )
                  }
                >
                  View All Expenses
                </Dropdown.Item>

                <Dropdown.Divider />

                <Dropdown.Item
                  {...primaryHover}
                  onClick={() =>
                    setShowAddIncomeModal(true)
                  }
                >
                  Add Income
                </Dropdown.Item>

                <Dropdown.Item
                  {...primaryHover}
                  onClick={() =>
                    setShowViewIncomeModal(true)
                  }
                >
                  View Incomes
                </Dropdown.Item>

                <Dropdown.Divider />

                <Dropdown.Item
                  {...primaryHover}
                  onClick={() =>
                    setShowAddAccountModal(true)
                  }
                >
                  Add Account
                </Dropdown.Item>

                <Dropdown.Item
                  {...primaryHover}
                  onClick={() =>
                    setViewAccountsModal(true)
                  }
                >
                  View Accounts
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </Stack>

          {isReopenedCycle && (
            <Alert
              variant="warning"
              className="mb-4"
            >
              <div className="fw-semibold">
                Editing a previous budget cycle
              </div>

              <div className="small mt-1">
                Your current cycle is safely
                paused. Finish this previous
                cycle when your corrections are
                complete.
              </div>

              {activeCycle?.start_date &&
                activeCycle?.end_date && (
                  <div className="small mt-2">
                    Editing:{" "}
                    <strong>
                      {new Date(
                        `${activeCycle.start_date}T00:00:00`
                      ).toLocaleDateString()}
                      {" – "}
                      {new Date(
                        `${activeCycle.end_date}T00:00:00`
                      ).toLocaleDateString()}
                    </strong>
                  </div>
                )}

              {pausedCycle?.start_date && (
                <div className="small mt-1">
                  Current cycle paused:{" "}
                  <strong>
                    {new Date(
                      `${pausedCycle.start_date}T00:00:00`
                    ).toLocaleDateString()}
                    {" – Present"}
                  </strong>
                </div>
              )}
            </Alert>
          )}

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fill, minmax(300px, 1fr))",
              gap: "1rem",
              alignItems: "self-start",
            }}
          >
            {budgets.map((budget) => {
              const amount =
                getBudgetExpenses(
                  budget.id
                ).reduce(
                  (total, expense) =>
                    total + expense.amount,
                  0
                );

              return (
                <BudgetCard
                  key={budget.id}
                  name={budget.name}
                  amount={amount}
                  allocated={
                    budget.allocated
                  }
                  onAddExpenseClick={() =>
                    openAddExpenseModal(
                      budget.id
                    )
                  }
                  onViewExpenseClick={() =>
                    setViewExpenseModalBudgetId(
                      budget.id
                    )
                  }
                  onEditBudgetClick={() =>
                    openEditBudgetModal(
                      budget.id
                    )
                  }
                />
              );
            })}

            <UnassignedBudgetCard
              onAddExpenseClick={
                openAddExpenseModal
              }
              onViewExpenseClick={() =>
                setViewExpenseModalBudgetId(
                  UNASSIGNED_BUDGET_ID
                )
              }
            />

            <CycleCard
              onOpenCycleHistory={() =>
                setShowCycleHistoryModal(true)
              }
              onOpenEditCycleDates={() =>
                setShowEditCycleDatesModal(true)
              }
              onOpenCloseCycle={() =>
                setShowCloseCycleModal(true)
              }
            />

            <TotalBudgetCard />
          </div>
        </Container>
      </main>

      <AddBudgetModal
        show={showAddBudgetModal}
        handleClose={() =>
          setShowAddBudgetModal(false)
        }
      />

      <AddExpenseModal
        show={showAddExpenseModal}
        defaultBudgetId={
          addExpenseModalBudgetId
        }
        handleClose={() =>
          setShowAddExpenseModal(false)
        }
      />

      <ViewExpenseModal
        budgetId={
          viewExpenseModalBudgetId
        }
        handleClose={() =>
          setViewExpenseModalBudgetId()
        }
      />

      <ViewAllExpensesModal
        show={viewAllExpensesModal}
        handleClose={() =>
          setViewAllExpensesModal(false)
        }
      />

      <EditBudgetModal
        budgetId={editBudgetModalBudgetId}
        show={showEditBudgetModal}
        handleClose={() =>
          setShowEditBudgetModal(false)
        }
      />

      <AddAccountModal
        show={showAddAccountModal}
        handleClose={() =>
          setShowAddAccountModal(false)
        }
      />

      <ViewAccountsModal
        show={viewAccountsModal}
        handleClose={() =>
          setViewAccountsModal(false)
        }
      />

      <AddIncomeModal
        show={showAddIncomeModal}
        handleClose={() =>
          setShowAddIncomeModal(false)
        }
      />

      <ViewIncomeModal
        show={showViewIncomeModal}
        handleClose={() =>
          setShowViewIncomeModal(false)
        }
      />

      <CycleHistoryModal
        show={showCycleHistoryModal}
        handleClose={() =>
          setShowCycleHistoryModal(false)
        }
      />

      <CloseCycleModal
        show={showCloseCycleModal}
        handleClose={() =>
          setShowCloseCycleModal(false)
        }
      />

      <EditCycleDatesModal
        show={showEditCycleDatesModal}
        handleClose={() =>
          setShowEditCycleDatesModal(false)
        }
      />

      <Footer />
    </div>
  );
}

export default App;
