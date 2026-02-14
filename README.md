# HL7 Viewer - React Edition

A modern, interactive HL7 message viewer built with React, featuring real-time parsing, field inspection, and editing capabilities.

## Features

✨ **Interactive Message Editor**

- Click any line to inspect its fields
- Real-time syntax highlighting
- Error detection (validates MSH as first segment)

🔍 **Detailed Field Inspection**

- View all segment fields with proper HL7 definitions
- Support for composite fields (e.g., Patient Name components)
- Automatic date/time field detection and formatting

✍️ **Live Field Editing**

- Edit any field directly in the details panel
- Changes instantly reflect in the message editor
- Preserve HL7 message structure

🎨 **Modern UI**

- Dark/Light theme toggle with localStorage persistence
- Responsive design (mobile-friendly)
- Custom color scheme with smooth transitions
- TailwindCSS for styling

📚 **Comprehensive HL7 Support**
Includes definitions for common segments:

- MSH (Message Header)
- PID (Patient Identification)
- PV1 (Patient Visit)
- OBR (Observation Request)
- OBX (Observation Result)
- EVN, NK1, AL1, DG1, NTE, MSA, ERR, IN1, PR1, RXA

## Technology Stack

- **React 19** - Modern UI framework
- **Vite 5** - Fast build tool and dev server
- **TailwindCSS 3** - Utility-first CSS framework
- **PostCSS** - CSS processing

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Visit `http://localhost:5173` to view the application.

### Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
src/
├── components/
│   ├── Header.jsx           # App header with branding and theme toggle
│   ├── ThemeToggle.jsx      # Theme switcher component
│   ├── MessageEditor.jsx    # Left panel - editable HL7 message
│   ├── DetailPanel.jsx      # Right panel - segment details container
│   ├── SegmentDetails.jsx   # Segment field renderer
│   └── FieldInput.jsx       # Individual field input with floating label
├── data/
│   └── segmentDefinitions.js # HL7 segment and component definitions
├── utils/
│   └── hl7Utils.js          # Date formatting and utility functions
├── App.jsx                  # Main application component
├── main.jsx                 # React entry point
└── index.css                # Global styles and Tailwind imports
```

## Migration from Vanilla JS

This project was converted from a vanilla JavaScript/HTML/CSS implementation to React. The original files are preserved in the `old-vanilla-version` directory.

### Key Changes

1. **Component Architecture**: Split monolithic HTML into reusable React components
2. **State Management**: Centralized state in the App component with proper lifting
3. **Event Handling**: Replaced inline event handlers with React event system
4. **Styling**: Integrated TailwindCSS v3 with PostCSS processing
5. **Build System**: Added Vite for modern development experience

## Browser Compatibility

- Modern browsers with ES6+ support
- Chrome, Firefox, Safari, Edge (latest versions)

## License

© 2026 HL7 Viewer by [CodeByNithin](https://codebynithin.com)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
