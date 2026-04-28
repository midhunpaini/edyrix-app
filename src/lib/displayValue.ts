export function showMetric(
  value: number,
  emptyText: string,
  formatter?: (v: number) => string
) {
  if (!value || value === 0) return { display: emptyText, isEmpty: true };
  return { display: formatter ? formatter(value) : String(value), isEmpty: false };
}
