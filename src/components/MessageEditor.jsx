import { useEffect, useLayoutEffect, useRef, useState } from "react";

const SAMPLE_MESSAGE = `MSH|^~\\&|HIS|HOSPITAL|LAB|LABSYS|20230915143022||ORU^R01|MSG20230915001|P|2.5
PID|1||MRN123456^^^HOSPITAL^MR||Doe^John^A^Jr^Mr||19800115|M|||456 Oak Ave^^Springfield^IL^62701^USA||+1(555)234-5678|+1(555)987-6543||S|CAT|ACC987654
PV1|1|I|MED-WARD^201^A^HOSPITAL|||ATTENDING^Smith^Jane^M^MD^^NPI|REFER^Johnson^Bob^K^MD||MED||||||||VIP^456^HOSPITAL|P|20230914080000
OBR|1|ORD-001^HIS|FILL-001^LAB|CBC^Complete Blood Count^L|||20230915143000|20230915144500|||TECH^Brown^Carl|||ROU|Routine|20230915163022|||F
OBX|1|NM|6690-2^Leukocytes^LN||7.5|10*3/uL|4.5-11.0||||F|||20230915160000
OBX|2|NM|789-8^Erythrocytes^LN||4.8|10*6/uL|4.5-5.5||||F|||20230915160000
OBX|3|NM|718-7^Hemoglobin^LN||14.2|g/dL|13.5-17.5||||F|||20230915160000
OBX|4|NM|4544-3^Hematocrit^LN||42.1|%|41.0-53.0||||F|||20230915160000
NTE|1||Patient fasting prior to collection. Sample quality: Good.
AL1|1|DA|PENICILLIN^Penicillin^L|SEV|Rash^Hives||19950601`;

export default function MessageEditor({
  message,
  setMessage,
  currentLineIdx,
  setCurrentLineIdx,
}) {
  const textareaRef = useRef(null);
  const lineNumbersRef = useRef(null);
  const lineHighlightRef = useRef(null);
  const [showError, setShowError] = useState(false);
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < 640 : false
  );

  const getResponsiveValues = () => {
    return {
      LINE_H: isMobile ? 17 : 20,
      PADDING_TOP: isMobile ? 8 : 14,
      LINE_NUM_WIDTH: isMobile ? 28 : 38,
    };
  };

  const getLines = () => {
    return message.split(/\r\n|\r|\n/);
  };

  const getCursorLineIndex = () => {
    const ta = textareaRef.current;
    if (!ta) return -1;

    const val = ta.value;
    const pos = ta.selectionStart;
    const before = val.substring(0, pos);

    return before.split(/\r\n|\r|\n/).length - 1;
  };

  const updateHighlight = (idx) => {
    const { LINE_H, PADDING_TOP } = getResponsiveValues();
    const ta = textareaRef.current;
    const highlight = lineHighlightRef.current;
    if (!ta || !highlight) return;

    if (idx < 0) {
      highlight.style.display = "none";
      return;
    }

    const scrollTop = ta.scrollTop;
    const top = PADDING_TOP + idx * LINE_H - scrollTop;

    highlight.style.display = "block";
    highlight.style.top = `${top}px`;
    highlight.style.height = `${LINE_H}px`;
  };

  const updateLineNumbers = (lines, activeIdx) => {
    const { LINE_H } = getResponsiveValues();

    if (!lineNumbersRef.current) return;

    lineNumbersRef.current.innerHTML = lines
      .map(
        (_, i) =>
          `<span class="block text-right pr-2 text-[10px] ${
            i === activeIdx ? "text-custom-accent" : "text-custom-text-dim"
          }" style="height: ${LINE_H}px; line-height: ${LINE_H}px;">${i + 1}</span>`
      )
      .join("");

    if (textareaRef.current) {
      lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  const refreshEditor = () => {
    const lines = getLines();
    updateHighlight(currentLineIdx);
    updateLineNumbers(lines, currentLineIdx);
  };

  const onCursorMove = () => {
    // Small delay for mobile touch events to ensure cursor position is set
    setTimeout(() => {
      const idx = getCursorLineIndex();
      setCurrentLineIdx(idx);
    }, 0);
  };

  const syncScroll = () => {
    const { LINE_H, PADDING_TOP } = getResponsiveValues();
    const ta = textareaRef.current;
    const lineNums = lineNumbersRef.current;
    const highlight = lineHighlightRef.current;

    if (!ta || !lineNums || !highlight) return;

    lineNums.scrollTop = ta.scrollTop;

    if (currentLineIdx >= 0) {
      const scrollTop = ta.scrollTop;
      const top = PADDING_TOP + currentLineIdx * LINE_H - scrollTop;
      highlight.style.top = `${top}px`;
    }
  };

  const handleInput = () => {
    setTimeout(() => {
      const idx = getCursorLineIndex();
      setCurrentLineIdx(idx);
    }, 180);
  };

  const loadSample = () => {
    setMessage(SAMPLE_MESSAGE);
    setCurrentLineIdx(-1);
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(0, 0);
      }
      // Force cursor update
      setCurrentLineIdx(0);
    }, 0);
  };

  const clearAll = () => {
    setMessage("");
    setCurrentLineIdx(-1);
    if (lineHighlightRef.current) {
      lineHighlightRef.current.style.display = "none";
    }
    if (lineNumbersRef.current) {
      lineNumbersRef.current.innerHTML = "";
    }
    setShowError(false);
  };

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 640;
      if (mobile !== isMobile) {
        setIsMobile(mobile);
      } else {
        refreshEditor();
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMobile, currentLineIdx, message]);

  // Use layout effect to ensure lines are updated immediately when dependencies change
  // This fixes the "missing line numbers by default" issue
  useLayoutEffect(() => {
    // Validate
    const lines = getLines();
    const validLines = lines.filter((l) => l.trim());
    const validSegs = validLines.filter((l) => /^[A-Z]{2}[A-Z0-9]\|/.test(l));
    const count = validSegs.length;
    const firstLine = lines[0] || "";
    setShowError(count > 0 && !firstLine.startsWith("MSH"));

    refreshEditor();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [message, isMobile, currentLineIdx]);

  return (
    <div className="w-full flex flex-col overflow-hidden lg:flex-1 h-1/2 lg:h-auto">
      <div className="py-2 sm:py-[9px] px-3 sm:px-4 bg-custom-surface border-b border-custom-border text-[9px] sm:text-[10px] font-medium tracking-[1.2px] sm:tracking-[1.5px] text-custom-text-dim uppercase flex-shrink-0 flex items-center gap-1.5 sm:gap-2">
        <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-custom-accent shadow-[0_0_6px_#1eb8e0]"></span>
        <span className="hidden sm:inline">MESSAGE EDITOR</span>
        <span className="sm:hidden">EDITOR</span>
      </div>
      <div
        className="py-1.5 sm:py-[7px] px-3 sm:px-4 bg-[rgba(30,184,224,0.05)] border-b border-[rgba(30,184,224,0.1)] text-custom-text-dim text-[9px] sm:text-[10px] flex-shrink-0 hidden sm:flex items-center gap-1.5"
        id="clickHint"
      >
        ↖ <span className="text-custom-accent">Click any line</span> to inspect
        its fields
      </div>
      <div className="flex-1 relative overflow-hidden flex">
        <div
          className="w-[28px] sm:w-[38px] bg-custom-surface border-r border-custom-border py-2 sm:py-3.5 overflow-hidden flex-shrink-0 pointer-events-none"
          ref={lineNumbersRef}
        ></div>
        <div className="absolute left-[28px] sm:left-[38px] top-0 right-0 bottom-0 bg-custom-bg z-0"></div>
        <div
          className="absolute left-[28px] sm:left-[38px] right-0 pointer-events-none bg-[rgba(30,184,224,0.3)] border-l-2 sm:border-l-[3px] border-custom-accent transition-all duration-75 ease-out hidden"
          ref={lineHighlightRef}
        ></div>
        <textarea
          ref={textareaRef}
          wrap="off"
          placeholder={`Paste or type your HL7 message here...

MSH|^~\\&|SendApp|SendFac|RecApp|RecFac|20230915120000||ADT^A01|MSG001|P|2.5
PID|1||123456^^^Hospital^MR||Doe^John^A||19800101|M
PV1|1|I|ICU^101^A

Click a line to inspect its fields.
Edits are reflected instantly.`}
          className="flex-1 bg-transparent text-custom-text font-mono text-[10px] py-2 sm:py-3.5 pr-2 sm:pr-3.5 pl-1.5 sm:pl-2.5 border-none resize-none outline-none overflow-x-auto overflow-y-auto whitespace-pre caret-custom-accent relative z-[1] scrollbar-thin placeholder:text-custom-text-dim placeholder:text-[9px] sm:placeholder:text-[11px]"
          style={{ lineHeight: isMobile ? "17px" : "20px" }}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onClick={onCursorMove}
          onTouchEnd={onCursorMove}
          onFocus={onCursorMove}
          onKeyUp={onCursorMove}
          onInput={handleInput}
          onScroll={syncScroll}
        ></textarea>
      </div>
      {showError && (
        <div className="py-1 sm:py-1.5 px-3 sm:px-4 bg-[rgba(255,107,53,0.1)] border-t border-[rgba(255,107,53,0.2)] text-custom-accent3 text-[9px] sm:text-[10px] flex-shrink-0">
          ⚠ First segment should be MSH
        </div>
      )}
      <div className="py-2 sm:py-[9px] px-2 sm:px-3.5 bg-custom-surface border-t lg:border-t border-custom-border flex gap-1.5 sm:gap-2 flex-shrink-0 items-center flex-wrap sm:flex-nowrap">
        <button
          className="font-mono text-[10px] sm:text-[11px] font-medium py-1 sm:py-1.5 px-2.5 sm:px-3.5 border border-custom-border rounded-[3px] cursor-pointer transition-all duration-150 bg-transparent text-custom-text-dim hover:text-custom-text hover:border-custom-text-dim"
          onClick={loadSample}
        >
          Load Sample
        </button>
        <button
          className="font-mono text-[10px] sm:text-[11px] font-medium py-1 sm:py-1.5 px-2.5 sm:px-3.5 border border-custom-border rounded-[3px] cursor-pointer transition-all duration-150 bg-transparent text-custom-text-dim hover:text-custom-text hover:border-custom-text-dim"
          onClick={clearAll}
        >
          Clear
        </button>
        <span className="text-[9px] sm:text-[9.5px] text-custom-text-dim mx-auto lg:mx-0">
          © {new Date().getFullYear()} HL7 Viewer by{" "}
          <a
            href="https://codebynithin.com"
            target="_blank"
            rel="noreferrer"
            className="text-custom-accent hover:text-custom-accent3"
          >
            CodeByNithin
          </a>
        </span>
        <span className="hidden lg:inline ml-auto text-[9.5px] text-custom-text-dim">
          Click any line · Edits update instantly
        </span>
      </div>
    </div>
  );
}
