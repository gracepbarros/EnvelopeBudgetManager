import { Button, Container, Dropdown, Stack } from "react-bootstrap";
import BudgetCard from "./components/BudgetCard";
import AddBudgetModal from "./components/AddBudgetModal";
import AddExpenseModal from "./components/AddExpenseModal";
import ViewExpenseModal from "./components/ViewExpenseModal";
import ViewAllExpensesModal from "./components/ViewAllExpensesModal";
import EditBudgetModal from "./components/EditBudgetModal";
import UnassignedBudgetCard from "./components/UnassignedBudgetCard";
import { useState } from "react";
import { UNASSIGNED_BUDGET_ID, useBudgets } from "./contexts/BudgetsContext";
import AddAccountModal from "./components/AddAccountModal";
import TotalBudgetCard from "./components/TotalBudgetCard";

function App() {
  const [showAddBudgetModal, setShowAddBudgetModal] = useState(false);

  const [viewExpenseModalBudgetId, setViewExpenseModalBudgetId] = useState();

  const [viewAllExpensesModal, setViewAllExpensesModal] = useState(false);

  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
  const [addExpenseModalBudgetId, setAddExpenseModalBudgetId] = useState();

  const [showEditBudgetModal, setShowEditBudgetModal] = useState(false);
  const [editBudgetModalBudgetId, setEditBudgetModalBudgetId] = useState();

  const [showAddAccountModal, setShowAddAccountModal] = useState(false);

  const [showMenu, setShowMenu] = useState(false);

  const { budgets, getBudgetExpenses } = useBudgets();

  function openAddExpenseModal(bgtId) {
    setShowAddExpenseModal(true);
    setAddExpenseModalBudgetId(bgtId);
  }

  function openEditBudgetModal(bgtId) {
    setShowEditBudgetModal(true);
    setEditBudgetModalBudgetId(bgtId);
  }

  const primaryHover = {
  onMouseEnter: (e) => e.currentTarget.classList.add("bg-primary", "text-white"),
  onMouseLeave: (e) => e.currentTarget.classList.remove("bg-primary","text-white"),
  };

  return (
    <>
      <Container className="my-4">
        <Stack direction="horizontal" gap="2" className="flex-wrap w-100 mb-3">
          <h1 className="display-4 fw-bold mb-0">My Envelope Plan</h1>
          <Dropdown
              show={showMenu}
              onToggle={(isOpen) => setShowMenu(isOpen)}
              onMouseEnter={() => setShowMenu(true)}
              onMouseLeave={() => setShowMenu(false)}
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
                  onClick={() => setShowAddBudgetModal(true)}
                >
                  Add Envelope
                </Dropdown.Item>

                <Dropdown.Item 
                  {...primaryHover}
                  onClick={() => openAddExpenseModal()}
                >
                  Add Expense
                </Dropdown.Item>

                <Dropdown.Item 
                  {...primaryHover}
                  onClick={() => setShowViewAllExpensesModal(true)}
                >
                  View Expenses
                </Dropdown.Item>

                <Dropdown.Divider />

                <Dropdown.Item 
                  {...primaryHover}
                  onClick={() => setShowAddAccountModal(true)}
                >
                  Add Account
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
        </Stack>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: "1rem",
            alignItems: "self-start",
          }}
        >
          {budgets.map((bgt) => {
            const amount = getBudgetExpenses(bgt.id).reduce(
              (total, expense) => total + expense.amount,
              0
            );
            return (
              <BudgetCard
                key={bgt.id}
                name={bgt.name}
                amount={amount}
                allocated={bgt.allocated}
                onAddExpenseClick={() => openAddExpenseModal(bgt.id)}
                onViewExpenseClick={() => setViewExpenseModalBudgetId(bgt.id)}
                onEditBudgetClick={() => openEditBudgetModal(bgt.id)}
              />
            );
          })}
          <UnassignedBudgetCard
            onAddExpenseClick={openAddExpenseModal}
            onViewExpenseClick={() =>
              setViewExpenseModalBudgetId(UNASSIGNED_BUDGET_ID)
            }
          />

          <TotalBudgetCard />
        </div>
      </Container>

      <AddBudgetModal
        show={showAddBudgetModal}
        handleClose={() => setShowAddBudgetModal(false)}
      />

      <AddExpenseModal
        show={showAddExpenseModal}
        defaultBudgetId={addExpenseModalBudgetId}
        handleClose={() => setShowAddExpenseModal(false)}
      />

      <ViewExpenseModal
        budgetId={viewExpenseModalBudgetId}
        handleClose={() => setViewExpenseModalBudgetId()}
      />

      <ViewAllExpensesModal
        show={viewAllExpensesModal}
        handleClose={() => setViewAllExpensesModal(false)}
      />

      <EditBudgetModal
        budgetId={editBudgetModalBudgetId}
        show={showEditBudgetModal}
        handleClose={() => setShowEditBudgetModal(false)}
      />

      <AddAccountModal
        show={showAddAccountModal}
        handleClose={() => setShowAddAccountModal(false)}
      />
    </>
  );
}

export default App;
