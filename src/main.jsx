import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "bootstrap/dist/css/bootstrap.min.css";
import AuthGate from "./components/AuthGate";

import { AuthProvider } from "./contexts/AuthContext";
import { BudgetsProvider } from "./contexts/BudgetsContext";
import { AccountsProvider } from "./contexts/AccountsContext";
import { IncomeProvider } from "./contexts/IncomeContext";

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    <AuthProvider>
      <AuthGate>
        <AccountsProvider>
          <IncomeProvider>
            <BudgetsProvider>
              <App />
            </BudgetsProvider>
          </IncomeProvider>
        </AccountsProvider>
      </AuthGate>
    </AuthProvider>
  </React.StrictMode>
);
