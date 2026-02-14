import { SEGMENT_DEFS, COMP_DEFS } from "../data/segmentDefinitions";
import FieldInput from "./FieldInput";

export default function SegmentDetails({ line, lineIdx, onFieldUpdate }) {
  if (!line || !line.trim()) {
    return (
      <div className="flex flex-col items-center justify-center gap-2.5 text-custom-text-dim text-[11px] leading-8 text-center py-10 px-10 h-full">
        <div className="text-[40px] opacity-20">◈</div>
        This line is empty.
        <br />
        Click a segment line to inspect it.
      </div>
    );
  }

  const segName = line.substring(0, 3);

  if (!/^[A-Z]{2}[A-Z0-9]$/.test(segName) || line[3] !== "|") {
    return (
      <div className="flex flex-col items-center justify-center gap-2.5 text-custom-text-dim text-[11px] leading-8 text-center py-10 px-10 h-full">
        <div className="text-[40px] opacity-20">◈</div>
        Line {lineIdx + 1} is not a valid HL7 segment.
        <br />
        Segments start with a 3-char code followed by{" "}
        <code className="text-custom-accent">|</code>
      </div>
    );
  }

  let fields;

  if (segName === "MSH") {
    const sep = line[3] || "|";
    const rest = line.substring(4).split(sep);
    fields = [sep, ...rest];
  } else {
    fields = line.split("|").slice(1);
  }

  const def = SEGMENT_DEFS[segName] || {
    name: "Custom / Unknown Segment",
    fields: [],
  };

  return (
    <>
      <div className="py-[13px] px-5 border-b border-custom-border bg-custom-surface flex items-start justify-between">
        <div>
          <div className="font-syne text-[21px] font-extrabold text-custom-text-bright">
            <span className="text-custom-accent">{segName}</span>
          </div>
          <div className="text-[11px] text-custom-text-dim mt-0.5">
            {def.name}
          </div>
        </div>
        <div className="text-[10px] text-custom-text-dim py-[3px] px-2 bg-custom-surface2 border border-custom-border rounded-[2px] whitespace-nowrap">
          Line {lineIdx + 1}
        </div>
      </div>
      <div className="p-4">
        {fields.map((field, fi) => {
          const fieldName = def.fields[fi] || `Field ${fi + 1}`;
          const fieldNum = `${segName}-${fi + 1}`;
          const isEmpty = field === undefined || field === "";

          if (field.includes("^")) {
            // Handle composite fields
            const comps = field.split("^");
            const compNames = COMP_DEFS[fieldNum] || [];

            return (
              <div
                key={`field-${lineIdx}-${fi}`}
                className="mb-4 pb-4 border-b border-custom-border"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[9px] text-custom-text-dim">
                    {fieldNum}
                  </span>
                  <span className="text-[10px] text-custom-accent2 font-medium">
                    {fieldName}
                  </span>
                </div>
                <div className="flex flex-col gap-2 ml-4">
                  {comps.map((c, ci) => {
                    const compLabel = compNames[ci] || `Component ${ci + 1}`;
                    const compId = `field-${lineIdx}-${fi}-${ci}`;

                    return (
                      <FieldInput
                        key={compId}
                        fieldId={compId}
                        value={c}
                        label={compLabel}
                        isEmpty={false}
                        onUpdate={onFieldUpdate}
                        lineIdx={lineIdx}
                        fieldIdx={fi}
                        compIdx={ci}
                      />
                    );
                  })}
                </div>
              </div>
            );
          } else {
            // Handle simple fields
            const fieldId = `field-${lineIdx}-${fi}`;

            return (
              <div key={fieldId} className="mb-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[9px] text-custom-text-dim">
                    {fieldNum}
                  </span>
                </div>
                <FieldInput
                  fieldId={fieldId}
                  value={field}
                  label={fieldName}
                  isEmpty={isEmpty}
                  onUpdate={onFieldUpdate}
                  lineIdx={lineIdx}
                  fieldIdx={fi}
                  compIdx={null}
                />
              </div>
            );
          }
        })}
      </div>
    </>
  );
}
