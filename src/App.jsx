import Container from "react-bootstrap/Container";
import { Button, Stack } from "react-bootstrap";
import BudgetCard from "./components/BudgetCard";
import AddBudgetModal from "./components/AddBudgetModal";
import AddExpenseModal from "./components/AddExpenseModal";
import ViewExpenseModal from "./components/ViewExpenseModal";
import ViewAllExpensesModal from "./components/ViewAllExpensesModal";
import EditBudgetModal from "./components/EditBudgetModal";
import UncategorizedBudgetCard from "./components/UncategorizedBudgetCard";
import { useState } from "react";
import { UNCATEGORIZED_BUDGET_ID, useBudgets } from "./contexts/BudgetsContext";
import TotalBudgetCard from "./components/TotalBudgetCard";

function App() {
  const [showAddBudgetModal, setShowAddBudgetModal] = useState(false);

  const [viewExpenseModalBudgetId, setViewExpenseModalBudgetId] = useState();

  const [viewAllExpensesModal, setViewAllExpensesModal] = useState(false);

  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
  const [addExpenseModalBudgetId, setAddExpenseModalBudgetId] = useState();

  const [showEditBudgetModal, setShowEditBudgetModal] = useState(false);
  const [editBudgetModalBudgetId, setEditBudgetModalBudgetId] = useState();

  const { budgets, getBudgetExpenses } = useBudgets();

  function openAddExpenseModal(bgtId) {
    setShowAddExpenseModal(true);
    setAddExpenseModalBudgetId(bgtId);
  }

  function openEditBudgetModal(bgtId) {
    setShowEditBudgetModal(true);
    setEditBudgetModalBudgetId(bgtId);
  }

  return (
    <>
      <Container className="my-4">
        <Stack direction="horizontal" gap="2" className="mb-4">
          <h1 className="me-auto">Budgets</h1>
          <Button variant="primary" onClick={() => setShowAddBudgetModal(true)}>
            Add Budget
          </Button>
          <Button variant="outline-primary" onClick={openAddExpenseModal}>
            Add expense
          </Button>
          <Button
            variant="outline-secondary"
            onClick={() => setViewAllExpensesModal(true)}
          >
            View All Expenses
          </Button>
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
                max={bgt.max}
                onAddExpenseClick={() => openAddExpenseModal(bgt.id)}
                onViewExpenseClick={() => setViewExpenseModalBudgetId(bgt.id)}
                onEditBudgetClick={() => openEditBudgetModal(bgt.id)}
              />
            );
          })}
          <UncategorizedBudgetCard
            onAddExpenseClick={openAddExpenseModal}
            onViewExpenseClick={() =>
              setViewExpenseModalBudgetId(UNCATEGORIZED_BUDGET_ID)
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
    </>
  );
}

export default App;
