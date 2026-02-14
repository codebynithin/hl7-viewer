import { useState } from "react";
import Header from "./components/Header";
import MessageEditor from "./components/MessageEditor";
import DetailPanel from "./components/DetailPanel";
import "./index.css";

function App() {
  const [message, setMessage] = useState("");
  const [currentLineIdx, setCurrentLineIdx] = useState(-1);
  const [theme, setTheme] = useState("dark");

  const handleFieldUpdate = (lineIdx, fieldIdx, compIdx, newValue) => {
    const lines = message.split(/\r\n|\r|\n/);
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

    // Update the message
    lines[lineIdx] = newLine;
    setMessage(lines.join("\n"));
  };

  return (
    <div className="bg-custom-bg text-custom-text font-mono h-screen flex flex-col overflow-hidden">
      <Header theme={theme} setTheme={setTheme} />
      <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
        <MessageEditor
          message={message}
          setMessage={setMessage}
          currentLineIdx={currentLineIdx}
          setCurrentLineIdx={setCurrentLineIdx}
        />
        <DetailPanel
          message={message}
          currentLineIdx={currentLineIdx}
          onFieldUpdate={handleFieldUpdate}
        />
      </div>
    </div>
  );
}

export default App;
