export default function Footer() {
  return (
    <footer className="text-center py-4 px-3 bg-light border-top">
      <small className="text-secondary">
        Designed and developed by{" "}
        <span className="fw-semibold text-primary">
          Grace Barros
        </span>
        {" · "}
        {new Date().getFullYear()}
      </small>
    </footer>
  );
}