import { Badge, Modal, Stack } from "react-bootstrap";
import { useIncome } from "../contexts/IncomeContext";
import {
  ACCOUNT_TYPES,
  useAccounts,
} from "../contexts/AccountsContext";

function getAccountType(type) {
  return ACCOUNT_TYPES.find(
    (accountType) => accountType.value === type
  );
}

function formatDate(date) {
  if (!date) return "";

  return new Date(`${date}T00:00:00`).toLocaleDateString();
}

function formatAmount(amount) {
  return Number(amount).toLocaleString("en-CA", {
    style: "currency",
    currency: "CAD",
  });
}

export default function ViewIncomeModal({
  show,
  handleClose,
}) {
  const { incomes } = useIncome();
  const { accounts } = useAccounts();

  const sortedIncomes = [...incomes].sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );

  function getAccount(accountId) {
    return accounts.find(
      (account) => account.id === accountId
    );
  }

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Income</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {sortedIncomes.length === 0 ? (
          <div className="text-muted text-center py-3">
            No income to display
          </div>
        ) : (
          <Stack gap="3">
            {sortedIncomes.map((income) => {
              const account = getAccount(income.accountId);
              const accountType = account
                ? getAccountType(account.type)
                : null;

              return (
                <Stack
                  key={income.id}
                  direction="horizontal"
                  gap="3"
                  className="border-bottom pb-3"
                >
                  <div className="me-auto">
                    <div className="fs-5 fw-semibold">
                      {income.description}
                    </div>

                    <div className="text-muted small mb-1">
                      {formatDate(income.date)}
                    </div>

                    {account ? (
                      <>
                        <span>{account.name}</span>

                        <Badge
                          bg={
                            account.archived
                              ? "secondary"
                              : accountType?.bg || "secondary"
                          }
                          className="ms-2"
                        >
                          {account.type}
                        </Badge>
                      </>
                    ) : (
                      <span className="text-muted">
                        Account unavailable
                      </span>
                    )}
                  </div>

                  <div className="fs-5 fw-semibold">
                    {formatAmount(income.amount)}
                  </div>
                </Stack>
              );
            })}
          </Stack>
        )}
      </Modal.Body>
    </Modal>
  );
}