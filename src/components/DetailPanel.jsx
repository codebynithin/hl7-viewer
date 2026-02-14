import SegmentDetails from "./SegmentDetails";

export default function DetailPanel({
  message,
  currentLineIdx,
  onFieldUpdate,
}) {
  const lines = message.split(/\r\n|\r|\n/);
  const currentLine = currentLineIdx >= 0 ? lines[currentLineIdx] : "";

  return (
    <div className="w-full flex flex-col overflow-hidden lg:flex-1 lg:max-w-[480px] h-1/2 lg:h-auto bg-custom-surface2 border-t lg:border-t-0 lg:border-l border-custom-border">
      <div className="py-2 sm:py-[9px] px-3 sm:px-4 bg-custom-surface border-b border-custom-border text-[9px] sm:text-[10px] font-medium tracking-[1.2px] sm:tracking-[1.5px] text-custom-text-dim uppercase flex-shrink-0 flex items-center gap-1.5 sm:gap-2">
        <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-custom-accent3 shadow-[0_0_6px_#ff6b35]"></span>
        <span className="hidden sm:inline">SEGMENT DETAIL</span>
        <span className="sm:hidden">DETAIL</span>
      </div>
      <div className="flex-1 overflow-y-auto scrollbar-thin" id="fieldsContent">
        {currentLineIdx < 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 sm:gap-2.5 text-custom-text-dim text-[10px] sm:text-[11px] leading-6 sm:leading-8 text-center py-6 sm:py-10 px-6 sm:px-10 h-full">
            <div className="text-[32px] sm:text-[40px] opacity-20">◈</div>
            Paste a message on the left,
            <br />
            then click any segment line
          </div>
        ) : (
          <SegmentDetails
            line={currentLine}
            lineIdx={currentLineIdx}
            onFieldUpdate={onFieldUpdate}
          />
        )}
      </div>
    </div>
  );
}
