export function toCsv(rows: Array<Record<string, unknown>>) {
  if (rows.length === 0) {
    return "";
  }

  const headers = Object.keys(rows[0]);
  const lines = rows.map((row) =>
    headers
      .map((header) => {
        const value = row[header];
        const text =
          value instanceof Date
            ? value.toISOString()
            : typeof value === "object" && value !== null
              ? JSON.stringify(value)
              : String(value ?? "");

        return `"${text.replace(/"/g, '""')}"`;
      })
      .join(",")
  );

  return [headers.join(","), ...lines].join("\n");
}
