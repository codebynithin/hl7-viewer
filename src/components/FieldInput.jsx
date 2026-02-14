import { isDateField, formatHL7Date } from "../utils/hl7Utils";

export default function FieldInput({
  fieldId,
  value,
  label,
  isEmpty,
  onUpdate,
  lineIdx,
  fieldIdx,
  compIdx,
}) {
  const isDate = isDateField(label);
  const datePreview = isDate && value ? formatHL7Date(value) : "";

  const handleChange = (e) => {
    onUpdate(lineIdx, fieldIdx, compIdx, e.target.value);
  };

  return (
    <div className="floating-label-container relative">
      <input
        type="text"
        className={`floating-label-input ${
          isEmpty ? "text-custom-border italic" : isDate ? "pr-2" : ""
        }`}
        id={fieldId}
        value={value || ""}
        placeholder={isEmpty ? "—" : ""}
        onChange={handleChange}
      />
      <label className="floating-label" htmlFor={fieldId}>
        {label}
      </label>
      {datePreview && <span className="date-preview">{datePreview}</span>}
    </div>
  );
}
