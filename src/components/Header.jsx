import ThemeToggle from "./ThemeToggle";

export default function Header({ theme, setTheme }) {
  return (
    <header
      className="
        py-2
        sm:py-[13px]
        px-3
        sm:px-6
        bg-custom-surface
        border-b border-custom-border
        flex
        items-center
        gap-2
        sm:gap-3.5
        flex-shrink-0
      "
    >
      <div
        className="
          font-syne font-extrabold
          text-sm
          sm:text-[17px]
          text-custom-text-bright
        "
      >
        HL7 <span className="text-custom-accent">Viewer</span>
      </div>
      <ThemeToggle theme={theme} setTheme={setTheme} />
    </header>
  );
}
