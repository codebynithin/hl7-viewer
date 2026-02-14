export function formatDT(dt) {
  if (dt && dt.length >= 8) {
    let s = `${dt.substr(0, 4)}-${dt.substr(4, 2)}-${dt.substr(6, 2)}`;

    if (dt.length >= 12) s += ` ${dt.substr(8, 2)}:${dt.substr(10, 2)}`;

    return s;
  }

  return dt || "";
}

// Format HL7 date to mm/dd/yyyy hh:mm:ss
export function formatHL7Date(dt) {
  if (!dt || dt.length < 8) return "";

  // Remove non-digit characters
  const clean = dt.replace(/\D/g, "");

  if (clean.length < 8) return "";

  const year = clean.substr(0, 4);
  const month = clean.substr(4, 2);
  const day = clean.substr(6, 2);
  let formatted = `${month}/${day}/${year}`;

  // Add time if available
  if (clean.length >= 12) {
    const hour = clean.substr(8, 2);
    const minute = clean.substr(10, 2);
    const second = clean.length >= 14 ? clean.substr(12, 2) : "00";

    formatted += ` ${hour}:${minute}:${second}`;
  } else if (clean.length >= 10) {
    const hour = clean.substr(8, 2);
    const minute = "00";
    const second = "00";

    formatted += ` ${hour}:${minute}:${second}`;
  }

  return formatted;
}

// Check if field name indicates a date/time field
export function isDateField(fieldName) {
  const lowerName = fieldName.toLowerCase();

  return (
    lowerName.includes("date") ||
    lowerName.includes("time") ||
    lowerName.includes("dt")
  );
}

export function escHtml(str) {
  if (!str) return "";

  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
