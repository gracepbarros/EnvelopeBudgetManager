import { Dropdown } from "react-bootstrap";
import {
  UNASSIGNED_BUDGET_ID,
  useBudgets,
} from "../contexts/BudgetsContext";

export default function EnvelopeDropdown({
  value,
  onChange,
}) {
  const { budgets } = useBudgets();

  const selectedEnvelope =
    value === UNASSIGNED_BUDGET_ID
      ? { name: "Unassigned" }
      : budgets.find((budget) => budget.id === value);

  return (
    <Dropdown>
      <Dropdown.Toggle
        variant="outline-info"
        className="w-100 text-start text-black"
      >
        {selectedEnvelope
          ? selectedEnvelope.name
          : "Select an envelope"}
      </Dropdown.Toggle>

      <Dropdown.Menu className="w-100">
        <Dropdown.Item
          onClick={() => onChange(UNASSIGNED_BUDGET_ID)}
        >
          Unassigned
        </Dropdown.Item>

        {budgets.map((budget) => (
          <Dropdown.Item
            key={budget.id}
            onClick={() => onChange(budget.id)}
          >
            {budget.name}
          </Dropdown.Item>
        ))}
      </Dropdown.Menu>
    </Dropdown>
  );
}
