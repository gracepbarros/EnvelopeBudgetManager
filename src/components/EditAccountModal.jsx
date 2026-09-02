import { useRef } from "react";
import { Button, Form, Modal } from "react-bootstrap";
import {
  ACCOUNT_TYPES,
  useAccounts,
} from "../contexts/AccountsContext";

export default function EditAccountModal({
  accountId,
  show,
  handleClose,
}) {
  const nameRef = useRef();
  const typeRef = useRef();

  const { accounts, editAccount } = useAccounts();

  const account = accounts.find(
    (account) => account.id === accountId
  );

  function handleSubmit(e) {
    e.preventDefault();

    editAccount({
      accountId,
      newName: nameRef.current.value,
      newType: typeRef.current.value,
    });

    handleClose();
  }

  return (
    <Modal show={show} onHide={handleClose}>
      <Form onSubmit={handleSubmit}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Account</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form.Group
            className="mb-3"
            controlId="editAccountName"
          >
            <Form.Label>Name</Form.Label>

            <Form.Control
              ref={nameRef}
              type="text"
              defaultValue={account?.name || ""}
              required
            />
          </Form.Group>

          <Form.Group
            className="mb-3"
            controlId="editAccountType"
          >
            <Form.Label>Type</Form.Label>

            <Form.Select
              ref={typeRef}
              defaultValue={account?.type}
            >
              {ACCOUNT_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          <div className="d-flex justify-content-end">
            <Button type="submit" variant="primary">
              Save
            </Button>
          </div>
        </Modal.Body>
      </Form>
    </Modal>
  );
}
