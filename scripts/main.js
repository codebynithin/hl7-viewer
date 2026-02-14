const SEGMENT_DEFS = {
  MSH: {
    name: "Message Header",
    fields: [
      "Field Separator",
      "Encoding Characters",
      "Sending Application",
      "Sending Facility",
      "Receiving Application",
      "Receiving Facility",
      "Date/Time of Message",
      "Security",
      "Message Type",
      "Message Control ID",
      "Processing ID",
      "Version ID",
      "Sequence Number",
      "Continuation Pointer",
      "Accept Acknowledgment Type",
      "Application Acknowledgment Type",
      "Country Code",
      "Character Set",
      "Principal Language",
      "Alt Char Set Handling",
      "Message Profile Identifier",
    ],
  },
  PID: {
    name: "Patient Identification",
    fields: [
      "Set ID",
      "Patient ID",
      "Patient Identifier List",
      "Alternate Patient ID",
      "Patient Name",
      "Mother's Maiden Name",
      "Date/Time of Birth",
      "Administrative Sex",
      "Patient Alias",
      "Race",
      "Patient Address",
      "County Code",
      "Phone Number - Home",
      "Phone Number - Business",
      "Primary Language",
      "Marital Status",
      "Religion",
      "Patient Account Number",
      "SSN Number",
      "Driver's License Number",
      "Mother's Identifier",
      "Ethnic Group",
      "Birth Place",
      "Multiple Birth Indicator",
      "Birth Order",
      "Citizenship",
      "Veterans Military Status",
      "Nationality",
      "Patient Death Date/Time",
      "Patient Death Indicator",
      "Identity Unknown Indicator",
      "Identity Reliability Code",
      "Last Update Date/Time",
      "Last Update Facility",
      "Species Code",
      "Breed Code",
      "Strain",
      "Production Class Code",
      "Tribal Citizenship",
      "Patient Telecom Info",
    ],
  },
  PV1: {
    name: "Patient Visit",
    fields: [
      "Set ID",
      "Patient Class",
      "Assigned Patient Location",
      "Admission Type",
      "Preadmit Number",
      "Prior Patient Location",
      "Attending Doctor",
      "Referring Doctor",
      "Consulting Doctor",
      "Hospital Service",
      "Temporary Location",
      "Preadmit Test Indicator",
      "Re-admission Indicator",
      "Admit Source",
      "Ambulatory Status",
      "VIP Indicator",
      "Admitting Doctor",
      "Patient Type",
      "Visit Number",
      "Financial Class",
      "Charge Price Indicator",
      "Courtesy Code",
      "Credit Rating",
      "Contract Code",
      "Contract Effective Date",
      "Contract Amount",
      "Contract Period",
      "Interest Code",
      "Transfer to Bad Debt Code",
      "Transfer to Bad Debt Date",
      "Bad Debt Agency Code",
      "Bad Debt Transfer Amount",
      "Bad Debt Recovery Amount",
      "Delete Account Indicator",
      "Delete Account Date",
      "Discharge Disposition",
      "Discharged to Location",
      "Diet Type",
      "Servicing Facility",
      "Bed Status",
      "Account Status",
      "Pending Location",
      "Prior Temporary Location",
      "Admit Date/Time",
      "Discharge Date/Time",
      "Current Patient Balance",
      "Total Charges",
      "Total Adjustments",
      "Total Payments",
      "Alternate Visit ID",
      "Visit Indicator",
    ],
  },
  OBR: {
    name: "Observation Request",
    fields: [
      "Set ID",
      "Placer Order Number",
      "Filler Order Number",
      "Universal Service Identifier",
      "Priority",
      "Requested Date/Time",
      "Observation Date/Time",
      "Observation End Date/Time",
      "Collection Volume",
      "Collector Identifier",
      "Specimen Action Code",
      "Danger Code",
      "Relevant Clinical Info",
      "Specimen Received Date/Time",
      "Specimen Source",
      "Ordering Provider",
      "Order Callback Phone Number",
      "Placer Field 1",
      "Placer Field 2",
      "Filler Field 1",
      "Filler Field 2",
      "Results Rpt/Status Chng Date/Time",
      "Charge to Practice",
      "Diagnostic Service Section ID",
      "Result Status",
      "Parent Result",
      "Quantity/Timing",
      "Result Copies To",
      "Parent",
      "Transportation Mode",
      "Reason for Study",
      "Principal Result Interpreter",
      "Assistant Result Interpreter",
      "Technician",
      "Transcriptionist",
      "Scheduled Date/Time",
      "Number of Sample Containers",
      "Transport Logistics",
      "Collector's Comment",
      "Transport Arrangement Responsibility",
      "Transport Arranged",
      "Escort Required",
      "Planned Patient Transport Comment",
      "Procedure Code",
      "Procedure Code Modifier",
    ],
  },
  OBX: {
    name: "Observation Result",
    fields: [
      "Set ID",
      "Value Type",
      "Observation Identifier",
      "Observation Sub-ID",
      "Observation Value",
      "Units",
      "References Range",
      "Interpretation Codes",
      "Probability",
      "Nature of Abnormal Test",
      "Observation Result Status",
      "Effective Date of Reference Range",
      "User Defined Access Checks",
      "Date/Time of Observation",
      "Producer's ID",
      "Responsible Observer",
      "Observation Method",
      "Equipment Instance Identifier",
      "Date/Time of Analysis",
    ],
  },
  EVN: {
    name: "Event Type",
    fields: [
      "Event Type Code",
      "Recorded Date/Time",
      "Date/Time Planned Event",
      "Event Reason Code",
      "Operator ID",
      "Event Occurred",
      "Event Facility",
    ],
  },
  NK1: {
    name: "Next of Kin",
    fields: [
      "Set ID",
      "Name",
      "Relationship",
      "Address",
      "Phone Number",
      "Business Phone Number",
      "Contact Role",
      "Start Date",
      "End Date",
      "Job Title",
      "Job Code/Class",
      "Employee Number",
      "Organization Name",
      "Marital Status",
      "Administrative Sex",
      "Date/Time of Birth",
      "Living Dependency",
      "Ambulatory Status",
      "Citizenship",
      "Primary Language",
      "Living Arrangement",
      "Publicity Code",
      "Protection Indicator",
      "Student Indicator",
      "Religion",
      "Mother's Maiden Name",
      "Nationality",
      "Ethnic Group",
      "Contact Reason",
      "Contact Person's Name",
      "Contact Person's Phone",
      "Contact Person's Address",
    ],
  },
  AL1: {
    name: "Patient Allergy Information",
    fields: [
      "Set ID",
      "Allergen Type Code",
      "Allergen Code/Description",
      "Allergy Severity Code",
      "Allergy Reaction Code",
      "Identification Date",
    ],
  },
  DG1: {
    name: "Diagnosis",
    fields: [
      "Set ID",
      "Diagnosis Coding Method",
      "Diagnosis Code",
      "Diagnosis Description",
      "Diagnosis Date/Time",
      "Diagnosis Type",
      "Major Diagnostic Category",
      "Diagnostic Related Group",
      "DRG Approval Indicator",
      "DRG Grouper Review Code",
      "Outlier Type",
      "Outlier Days",
      "Outlier Cost",
      "Grouper Version",
      "Diagnosis Priority",
      "Diagnosing Clinician",
      "Diagnosis Classification",
      "Confidential Indicator",
      "Attestation Date/Time",
      "Diagnosis Identifier",
      "Diagnosis Action Code",
    ],
  },
  NTE: {
    name: "Notes and Comments",
    fields: [
      "Set ID",
      "Source of Comment",
      "Comment",
      "Comment Type",
      "Entered By",
      "Entered Date/Time",
      "Effective Start Date",
      "Expiration Date",
    ],
  },
  MSA: {
    name: "Message Acknowledgment",
    fields: [
      "Acknowledgment Code",
      "Message Control ID",
      "Text Message",
      "Expected Sequence Number",
      "Delayed Acknowledgment Type",
      "Error Condition",
    ],
  },
  ERR: {
    name: "Error",
    fields: [
      "Error Code and Location",
      "Error Location",
      "HL7 Error Code",
      "Severity",
      "Application Error Code",
      "Application Error Parameter",
      "Diagnostic Information",
      "User Message",
      "Inform Person Indicator",
      "Override Type",
      "Override Reason Code",
      "Help Desk Contact Point",
    ],
  },
  IN1: {
    name: "Insurance",
    fields: [
      "Set ID",
      "Insurance Plan ID",
      "Insurance Company ID",
      "Insurance Company Name",
      "Insurance Company Address",
      "Insurance Co Contact Person",
      "Insurance Co Phone Number",
      "Group Number",
      "Group Name",
      "Insured's Group Emp ID",
      "Insured's Group Emp Name",
      "Plan Effective Date",
      "Plan Expiration Date",
      "Authorization Information",
      "Plan Type",
      "Name of Insured",
      "Insured's Relationship to Patient",
      "Insured's Date of Birth",
      "Insured's Address",
      "Assignment of Benefits",
      "Coordination of Benefits",
      "Coord of Ben. Priority",
      "Notice of Admission Flag",
      "Notice of Admission Date",
      "Report of Eligibility Flag",
      "Report of Eligibility Date",
      "Release Information Code",
      "Pre-Admit Cert (PAC)",
      "Verification Date/Time",
      "Verification By",
      "Type of Agreement Code",
      "Billing Status",
      "Lifetime Reserve Days",
      "Delay Before L.R. Day",
      "Company Plan Code",
      "Policy Number",
    ],
  },
  PR1: {
    name: "Procedures",
    fields: [
      "Set ID",
      "Procedure Coding Method",
      "Procedure Code",
      "Procedure Description",
      "Procedure Date/Time",
      "Procedure Functional Type",
      "Procedure Minutes",
      "Anesthesiologist",
      "Anesthesia Code",
      "Anesthesia Minutes",
      "Surgeon",
      "Procedure Practitioner",
      "Consent Code",
      "Procedure Priority",
      "Associated Diagnosis Code",
      "Procedure Code Modifier",
    ],
  },
  RXA: {
    name: "Pharmacy/Treatment Administration",
    fields: [
      "Give Sub-ID Counter",
      "Administration Sub-ID Counter",
      "Date/Time Start of Administration",
      "Date/Time End of Administration",
      "Administered Code",
      "Administered Amount",
      "Administered Units",
      "Administered Dosage Form",
      "Administration Notes",
      "Administering Provider",
      "Administered-at Location",
      "Administered Per (Time Unit)",
      "Administered Strength",
      "Administered Strength Units",
      "Substance Lot Number",
      "Substance Expiration Date",
      "Substance Manufacturer Name",
      "Substance/Treatment Refusal Reason",
      "Indication",
      "Completion Status",
      "Action Code",
      "System Entry Date/Time",
    ],
  },
};

const COMP_DEFS = {
  "PID-5": [
    "Family Name",
    "Given Name",
    "Middle Initial/Name",
    "Suffix",
    "Prefix",
    "Degree",
  ],
  "PID-6": [
    "Family Name",
    "Given Name",
    "Middle Initial/Name",
    "Suffix",
    "Prefix",
    "Degree",
  ],
  "PID-11": [
    "Street Address",
    "Other Designation",
    "City",
    "State/Province",
    "ZIP/Postal Code",
    "Country",
    "Address Type",
    "Other Geographic Designation",
  ],
  "PID-3": [
    "ID Number",
    "Check Digit",
    "Check Digit Scheme",
    "Assigning Authority",
    "Identifier Type Code",
    "Assigning Facility",
  ],
  "MSH-9": ["Message Code", "Trigger Event", "Message Structure"],
  "MSH-3": ["Namespace ID", "Universal ID", "Universal ID Type"],
  "MSH-4": ["Namespace ID", "Universal ID", "Universal ID Type"],
  "OBX-3": [
    "Identifier",
    "Text",
    "Coding System",
    "Alt. Identifier",
    "Alt. Text",
    "Alt. Coding System",
  ],
  "OBX-6": ["Identifier", "Text", "Coding System"],
  "OBR-4": [
    "Identifier",
    "Text",
    "Coding System",
    "Alt. Identifier",
    "Alt. Text",
    "Alt. Coding System",
  ],
  "OBR-16": [
    "ID Number",
    "Family Name",
    "Given Name",
    "Middle Name",
    "Suffix",
    "Prefix",
    "Degree",
    "Source Table",
    "Assigning Authority",
  ],
  "PV1-3": [
    "Point of Care",
    "Room",
    "Bed",
    "Facility",
    "Location Status",
    "Person Location Type",
    "Building",
    "Floor",
    "Location Description",
  ],
  "PV1-7": [
    "ID Number",
    "Family Name",
    "Given Name",
    "Middle Name",
    "Suffix",
    "Prefix",
    "Degree",
    "Source Table",
    "Assigning Authority",
  ],
  "PV1-8": [
    "ID Number",
    "Family Name",
    "Given Name",
    "Middle Name",
    "Suffix",
    "Prefix",
    "Degree",
    "Source Table",
    "Assigning Authority",
  ],
  "NK1-2": [
    "Family Name",
    "Given Name",
    "Middle Name",
    "Suffix",
    "Prefix",
    "Degree",
  ],
  "NK1-4": [
    "Street Address",
    "Other Designation",
    "City",
    "State",
    "ZIP",
    "Country",
    "Address Type",
  ],
};
const ta = document.getElementById("hl7input");
const lineHighlight = document.getElementById("lineHighlight");
const lineNumbersEl = document.getElementById("lineNumbers");
let currentLineIdx = -1;
let debounceTimer = null;

// Responsive values
function getResponsiveValues() {
  const isMobile = window.innerWidth < 640; // sm breakpoint

  return {
    LINE_H: isMobile ? 27 : 24, // Updated to match text-base (16px * 1.7) and text-sm (14px * 1.7)
    PADDING_TOP: isMobile ? 8 : 14,
    LINE_NUM_WIDTH: isMobile ? 28 : 38,
  };
}

// ── Event Listeners ──────────────────────────────────────

ta.addEventListener("click", onCursorMove);
ta.addEventListener("keyup", onCursorMove);
ta.addEventListener("input", () => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    refreshMeta();
    onCursorMove();
  }, 180);
});
ta.addEventListener("scroll", syncScroll);

// Update on resize
window.addEventListener("resize", () => {
  if (currentLineIdx >= 0) {
    const lines = getLines();
    updateHighlight(currentLineIdx, lines.length);
    updateLineNumbers(lines, currentLineIdx);
  }
});

// ── Core ─────────────────────────────────────────────────

function getLines() {
  return ta.value.split(/\r\n|\r|\n/);
}

function getCursorLineIndex() {
  const val = ta.value;
  const pos = ta.selectionStart;
  const before = val.substring(0, pos);

  return before.split(/\r\n|\r|\n/).length - 1;
}

function onCursorMove() {
  const lines = getLines();
  const idx = getCursorLineIndex();

  if (idx === currentLineIdx) {
    // Still same line but content may have changed — re-render details
    renderDetails(lines[idx], idx);

    return;
  }

  currentLineIdx = idx;

  updateHighlight(idx, lines.length);
  updateLineNumbers(lines, idx);
  renderDetails(lines[idx], idx);
}

function updateHighlight(idx, totalLines) {
  const { LINE_H, PADDING_TOP } = getResponsiveValues();
  const scrollTop = ta.scrollTop;
  const top = PADDING_TOP + idx * LINE_H - scrollTop;

  lineHighlight.style.display = "block";
  lineHighlight.style.top = top + "px";
  lineHighlight.style.height = LINE_H + "px";
}

function syncScroll() {
  const { LINE_H, PADDING_TOP } = getResponsiveValues();

  lineNumbersEl.scrollTop = ta.scrollTop;

  if (currentLineIdx >= 0) {
    const scrollTop = ta.scrollTop;
    const top = PADDING_TOP + currentLineIdx * LINE_H - scrollTop;

    lineHighlight.style.top = top + "px";
  }
}

function updateLineNumbers(lines, activeIdx) {
  const { LINE_H } = getResponsiveValues();
  const isMobile = window.innerWidth < 640;
  const fontSize = isMobile ? "10px" : "10px";

  lineNumbersEl.innerHTML = lines
    .map(
      (_, i) =>
        `<span class="block text-right pr-2 text-[${fontSize}] ${
          i === activeIdx ? "text-custom-accent" : "text-custom-text-dim"
        } leading-[1.7]" style="height: ${LINE_H}px">${i + 1}</span>`
    )
    .join("");
  lineNumbersEl.scrollTop = ta.scrollTop;
}

function refreshMeta() {
  const lines = getLines().filter((l) => l.trim());
  const validSegs = lines.filter((l) => /^[A-Z]{2}[A-Z0-9]\|/.test(l));
  const count = validSegs.length;
  // Error check: first non-empty line should be MSH
  const firstLine = lines[0] || "";

  document.getElementById("errorBar").style.display =
    count > 0 && !firstLine.startsWith("MSH") ? "block" : "none";

  // Update header info from MSH
  const mshLine = lines.find((l) => l.startsWith("MSH|"));

  if (mshLine) {
    const fields = mshLine.split("|");
    const parts = [];

    if (fields[8]) parts.push(`Type: <span>${escHtml(fields[8])}</span>`);
    if (fields[11]) parts.push(`v<span>${escHtml(fields[11])}</span>`);
    if (fields[6]) parts.push(`<span>${formatDT(fields[6])}</span>`);
  }

  // Update line numbers without changing active
  const allLines = getLines();

  updateLineNumbers(allLines, currentLineIdx);
}

function renderDetails(line, lineIdx) {
  const content = document.getElementById("fieldsContent");

  if (!line || !line.trim()) {
    content.innerHTML =
      '<div class="flex flex-col items-center justify-center gap-2.5 text-custom-text-dim text-[11px] leading-8 text-center py-10 px-10 h-full"><div class="text-[40px] opacity-20">◈</div>This line is empty.<br>Click a segment line to inspect it.</div>';

    return;
  }

  const segName = line.substring(0, 3);

  if (!/^[A-Z]{2}[A-Z0-9]$/.test(segName) || line[3] !== "|") {
    content.innerHTML = `<div class="flex flex-col items-center justify-center gap-2.5 text-custom-text-dim text-[11px] leading-8 text-center py-10 px-10 h-full"><div class="text-[40px] opacity-20">◈</div>Line ${
      lineIdx + 1
    } is not a valid HL7 segment.<br>Segments start with a 3-char code followed by <code class="text-custom-accent">|</code></div>`;

    return;
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
  let html = `
    <div class="py-[13px] px-5 border-b border-custom-border bg-custom-surface flex items-start justify-between">
      <div>
        <div class="font-syne text-[21px] font-extrabold text-custom-text-bright"><span class="text-custom-accent">${escHtml(
          segName
        )}</span></div>
        <div class="text-[11px] text-custom-text-dim mt-0.5">${def.name}</div>
      </div>
      <div class="text-[10px] text-custom-text-dim py-[3px] px-2 bg-custom-surface2 border border-custom-border rounded-[2px] whitespace-nowrap">Line ${
        lineIdx + 1
      }</div>
    </div>
    <div class="p-4">
  `;

  fields.forEach((field, fi) => {
    const fieldName = def.fields[fi] || `Field ${fi + 1}`;
    const fieldNum = `${segName}-${fi + 1}`;
    const isEmpty = field === undefined || field === "";

    if (field.includes("^")) {
      // Handle composite fields
      const comps = field.split("^");
      const compNames = COMP_DEFS[fieldNum] || [];

      html += `
        <div class="mb-4 pb-4 border-b border-custom-border">
          <div class="flex items-center gap-2 mb-2">
            <span class="text-[9px] text-custom-text-dim">${fieldNum}</span>
            <span class="text-[10px] text-custom-accent2 font-medium">${fieldName}</span>
          </div>
          <div class="flex flex-col gap-2 ml-4">
      `;

      comps.forEach((c, ci) => {
        const compLabel = compNames[ci] || `Component ${ci + 1}`;
        const compId = `field-${lineIdx}-${fi}-${ci}`;
        const isDate = isDateField(compLabel);
        const datePreview = isDate && c ? formatHL7Date(c) : "";

        html += `
          <div class="floating-label-container relative">
            <input
              type="text"
              class="floating-label-input ${isDate ? "pr-2" : ""}"
              id="${compId}"
              value="${escHtml(c)}"
              data-line-idx="${lineIdx}"
              data-field-idx="${fi}"
              data-comp-idx="${ci}"
              oninput="updateFieldValue(this)"
            />
            <label class="floating-label" for="${compId}">${compLabel}</label>
            ${
              datePreview
                ? `<span class="date-preview">${datePreview}</span>`
                : ""
            }
          </div>
        `;
      });

      html += `
          </div>
        </div>
      `;
    } else {
      // Handle simple fields
      const fieldId = `field-${lineIdx}-${fi}`;
      const isDate = isDateField(fieldName);
      const datePreview =
        isDate && !isEmpty && field ? formatHL7Date(field) : "";

      html += `
        <div class="mb-3">
          <div class="flex items-center gap-2 mb-1">
            <span class="text-[9px] text-custom-text-dim">${fieldNum}</span>
          </div>
          <div class="floating-label-container relative">
            <input
              type="text"
              class="floating-label-input ${
                isEmpty ? "text-custom-border italic" : isDate ? "pr-2" : ""
              }"
              id="${fieldId}"
              value="${isEmpty ? "" : escHtml(field)}"
              placeholder="${isEmpty ? "—" : ""}"
              data-line-idx="${lineIdx}"
              data-field-idx="${fi}"
              oninput="updateFieldValue(this)"
            />
            <label class="floating-label" for="${fieldId}">${fieldName}</label>
            ${
              datePreview
                ? `<span class="date-preview">${datePreview}</span>`
                : ""
            }
          </div>
        </div>
      `;
    }
  });

  html += `</div>`;
  content.innerHTML = html;
}

// New function to update field values in the textarea
function updateFieldValue(input) {
  const lineIdx = parseInt(input.dataset.lineIdx);
  const fieldIdx = parseInt(input.dataset.fieldIdx);
  const compIdx =
    input.dataset.compIdx !== undefined
      ? parseInt(input.dataset.compIdx)
      : null;
  const newValue = input.value;
  const lines = getLines();
  const line = lines[lineIdx];
  const segName = line.substring(0, 3);
  let fields;

  if (segName === "MSH") {
    const sep = line[3] || "|";
    const rest = line.substring(4).split(sep);
    fields = [sep, ...rest];
  } else {
    fields = line.split("|").slice(1);
  }

  // Update the field value
  if (compIdx !== null) {
    // Update component in composite field
    const comps = fields[fieldIdx].split("^");

    comps[compIdx] = newValue;
    fields[fieldIdx] = comps.join("^");
  } else {
    // Update simple field
    fields[fieldIdx] = newValue;
  }

  // Rebuild the line
  let newLine;
  if (segName === "MSH") {
    const sep = fields[0];

    newLine = "MSH" + sep + fields.slice(1).join(sep);
  } else {
    newLine = segName + "|" + fields.join("|");
  }

  // Update the textarea
  lines[lineIdx] = newLine;

  const cursorPos = ta.selectionStart;

  ta.value = lines.join("\n");

  // Restore cursor position (approximately)
  ta.setSelectionRange(cursorPos, cursorPos);

  // Update line numbers
  updateLineNumbers(lines, currentLineIdx);
}

function formatDT(dt) {
  if (dt && dt.length >= 8) {
    let s = `${dt.substr(0, 4)}-${dt.substr(4, 2)}-${dt.substr(6, 2)}`;

    if (dt.length >= 12) s += ` ${dt.substr(8, 2)}:${dt.substr(10, 2)}`;

    return s;
  }

  return dt || "";
}

// Format HL7 date to mm/dd/yyyy hh:mm:ss
function formatHL7Date(dt) {
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
function isDateField(fieldName) {
  const lowerName = fieldName.toLowerCase();

  return (
    lowerName.includes("date") ||
    lowerName.includes("time") ||
    lowerName.includes("dt")
  );
}

function escHtml(str) {
  if (!str) return "";

  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function loadSample() {
  ta.value = `MSH|^~\\&|HIS|HOSPITAL|LAB|LABSYS|20230915143022||ORU^R01|MSG20230915001|P|2.5
PID|1||MRN123456^^^HOSPITAL^MR||Doe^John^A^Jr^Mr||19800115|M|||456 Oak Ave^^Springfield^IL^62701^USA||+1(555)234-5678|+1(555)987-6543||S|CAT|ACC987654
PV1|1|I|MED-WARD^201^A^HOSPITAL|||ATTENDING^Smith^Jane^M^MD^^NPI|REFER^Johnson^Bob^K^MD||MED||||||||VIP^456^HOSPITAL|P|20230914080000
OBR|1|ORD-001^HIS|FILL-001^LAB|CBC^Complete Blood Count^L|||20230915143000|20230915144500|||TECH^Brown^Carl|||ROU|Routine|20230915163022|||F
OBX|1|NM|6690-2^Leukocytes^LN||7.5|10*3/uL|4.5-11.0||||F|||20230915160000
OBX|2|NM|789-8^Erythrocytes^LN||4.8|10*6/uL|4.5-5.5||||F|||20230915160000
OBX|3|NM|718-7^Hemoglobin^LN||14.2|g/dL|13.5-17.5||||F|||20230915160000
OBX|4|NM|4544-3^Hematocrit^LN||42.1|%|41.0-53.0||||F|||20230915160000
NTE|1||Patient fasting prior to collection. Sample quality: Good.
AL1|1|DA|PENICILLIN^Penicillin^L|SEV|Rash^Hives||19950601`;

  ta.focus();
  ta.setSelectionRange(0, 0);

  currentLineIdx = -1;

  refreshMeta();
  onCursorMove();
}

function clearAll() {
  ta.value = "";
  currentLineIdx = -1;
  lineHighlight.style.display = "none";
  lineNumbersEl.innerHTML = "";
  document.getElementById("fieldsContent").innerHTML =
    '<div class="flex flex-col items-center justify-center gap-2.5 text-custom-text-dim text-[11px] leading-8 text-center py-10 px-10 h-full"><div class="text-[40px] opacity-20">◈</div>Paste a message on the left,<br>then click any segment line</div>';
  document.getElementById("clickHint").style.display = "none";
  document.getElementById("errorBar").style.display = "none";
}

// Init line numbers on load
updateLineNumbers([""], -1);

// Set copyright year
document.getElementById("currentYear").textContent = new Date().getFullYear();

// ── Theme Toggle ─────────────────────────────────────────

function toggleTheme() {
  const body = document.body;
  const moonIcon = document.getElementById("moonIcon");
  const sunIcon = document.getElementById("sunIcon");

  body.classList.toggle("light-mode");

  const isLightMode = body.classList.contains("light-mode");

  // Toggle icon visibility
  if (isLightMode) {
    moonIcon.classList.add("hidden");
    sunIcon.classList.remove("hidden");
  } else {
    moonIcon.classList.remove("hidden");
    sunIcon.classList.add("hidden");
  }

  // Save preference to localStorage
  localStorage.setItem("theme", isLightMode ? "light" : "dark");
}

// Initialize theme on page load
function initTheme() {
  const savedTheme = localStorage.getItem("theme");
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const moonIcon = document.getElementById("moonIcon");
  const sunIcon = document.getElementById("sunIcon");
  // Use saved preference, or fall back to system preference
  const isDark = savedTheme ? savedTheme === "dark" : prefersDark;

  if (!isDark) {
    document.body.classList.add("light-mode");
    moonIcon.classList.add("hidden");
    sunIcon.classList.remove("hidden");
  }
}

// Initialize theme when DOM is ready
initTheme();
