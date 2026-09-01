import { useRef } from "react";
import { Button, Form, Modal } from "react-bootstrap";
import { ACCOUNT_TYPES, useAccounts } from "../contexts/AccountsContext";

export default function AddAccountModal({ show, handleClose }) {
  const nameRef = useRef();
  const typeRef = useRef();

  const { addAccount } = useAccounts();

  function handleSubmit(e) {
    e.preventDefault();

    addAccount({
      name: nameRef.current.value,
      type: typeRef.current.value,
    });

    handleClose();
  }

  return (
    <Modal show={show} onHide={handleClose}>
      <Form onSubmit={handleSubmit}>
        <Modal.Header closeButton>
          <Modal.Title>New Account</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form.Group className="mb-3" controlId="accountName">
            <Form.Label>Name</Form.Label>
            <Form.Control
              ref={nameRef}
              type="text"
              placeholder="e.g. Tangerine, RBC, CIBC..."
              required
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="accountType">
            <Form.Label>Type</Form.Label>

            <Form.Select ref={typeRef} defaultValue={ACCOUNT_TYPES[0]}>
              {ACCOUNT_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          <div className="d-flex justify-content-end">
            <Button type="submit" variant="primary">
              Add Account
            </Button>
          </div>
        </Modal.Body>
      </Form>
    </Modal>
  );
}