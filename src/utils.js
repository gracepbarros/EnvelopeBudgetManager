export const currencyFormatter = new Intl.NumberFormat(undefined, {
  currency: "CAD",
  style: "currency",
  minimumFractionDigits: 0,
});

export const dateFormatter = (date) => {
  if (!date) return "";

  return new Date(`${date}T00:00:00`).toLocaleDateString();
}
