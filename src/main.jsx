import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "bootstrap/dist/css/bootstrap.min.css";
import { BudgetsProvider } from "./contexts/BudgetsContext";
import { AccountsProvider } from "./contexts/AccountsContext";
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <AccountsProvider>
      <BudgetsProvider>
        <App />
      </BudgetsProvider>
    </AccountsProvider>
  </React.StrictMode>
);
