import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  NgZone,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { Hl7ParserService } from '../../services/hl7-parser.service';
import {
  VoiceRecognitionConstructor,
  VoiceRecognitionEventLike,
  VoiceRecognitionLike,
} from './voice-recognition.types';

export interface VoiceFieldUpdate {
  segmentName: string;
  fieldIndex: number; // 1-based HL7 field number
  newValue: string;
  lineIndex: number; // 0-based line index in the HL7 message
  fieldLabel: string;
}

type CommandState = 'idle' | 'awaiting_confirmation';

@Component({
  selector: 'app-voice-agent',
  imports: [CommonModule],
  templateUrl: './voice-agent.component.html',
  styleUrl: './voice-agent.component.scss',
})
export class VoiceAgentComponent implements OnInit, OnChanges, OnDestroy {
  public isSpeechSupported = false;
  public isMicSupported = false;
  public isListening = false;
  public isSpeaking = false;
  public isPaused = false;
  public statusText =
    'Paste or upload an HL7 message to enable voice guidance.';
  public micStatusText = 'Mic is not available in this browser.';
  public activeLineNumber: number | null = null;
  public lastCommand = '';
  /** Live interim transcript shown while the user is still speaking. */
  public interimTranscript = '';
  /** Pending update waiting for user confirmation. */
  public pendingUpdate: VoiceFieldUpdate | null = null;
  private recognition: VoiceRecognitionLike | null = null;
  private lastNarration = '';
  private activeUtteranceId = 0;
  private playbackMonitorId: number | null = null;
  private commandState: CommandState = 'idle';
  private readonly maxFieldsToExplain = 8;
  @Input() hasMessage = false;
  @Input() hl7Message = '';
  @Output() applyFieldUpdate = new EventEmitter<VoiceFieldUpdate>();

  constructor(
    private hl7Parser: Hl7ParserService,
    private zone: NgZone
  ) {}

  ngOnInit(): void {
    if (typeof window === 'undefined') {
      return;
    }

    this.isSpeechSupported =
      'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;

    this.setupMicRecognition();

    if (this.isMicSupported) {
      this.micStatusText =
        'Mic ready. Say: "set PV1.2 to 123", play, pause, or stop.';
    }

    if (!this.isSpeechSupported) {
      this.statusText = 'Speech output is not supported in this browser.';
    } else if (this.hasMessage) {
      this.statusText = 'Click a line to hear a segment explanation.';
    }
  }

  ngOnDestroy(): void {
    if (typeof window !== 'undefined' && this.isSpeechSupported) {
      window.speechSynthesis.cancel();
    }

    if (this.recognition) {
      this.recognition.stop();
    }

    this.stopPlaybackMonitor();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['hasMessage']) {
      this.onHasMessageChange();
    }
  }

  public explainLine(lineContent: string, lineIndex: number): void {
    if (!this.hasMessage) {
      return;
    }

    this.activeLineNumber = lineIndex >= 0 ? lineIndex + 1 : null;
    this.lastNarration = this.buildNarration(lineContent, lineIndex);
    this.statusText =
      lineIndex >= 0
        ? `Explaining line ${lineIndex + 1}.`
        : 'No line is selected.';

    this.speak(this.lastNarration);
  }

  public togglePlayback(): void {
    if (!this.hasMessage) {
      this.statusText = 'Paste or upload an HL7 message first.';

      return;
    }

    if (!this.isSpeechSupported || typeof window === 'undefined') {
      this.statusText = 'Speech output is not supported in this browser.';

      return;
    }

    if (this.isSpeaking && !this.isPaused) {
      window.speechSynthesis.pause();

      this.isPaused = true;
      this.statusText = 'Playback paused.';

      return;
    }

    if (this.isSpeaking && this.isPaused) {
      window.speechSynthesis.resume();

      this.isPaused = false;
      this.statusText = 'Playback resumed.';

      return;
    }

    if (this.lastNarration) {
      this.speak(this.lastNarration);

      return;
    }

    this.statusText = 'Click a line first to generate an explanation.';
  }

  public toggleMic(): void {
    if (!this.hasMessage) {
      this.micStatusText = 'Paste or upload an HL7 message first.';

      return;
    }

    if (!this.recognition) {
      this.micStatusText = 'Mic is not available in this browser.';

      return;
    }

    if (this.isListening) {
      this.isListening = false;
      this.commandState = 'idle';
      this.pendingUpdate = null;
      this.interimTranscript = '';

      this.recognition.stop();
      this.micStatusText = 'Mic stopped.';

      return;
    }

    try {
      this.recognition.start();

      this.isListening = true;
      this.micStatusText =
        'Listening... say "set PV1.2 to 123", play, pause, or stop.';
    } catch {
      this.isListening = false;
      this.micStatusText =
        'Unable to start mic. Please check browser permission.';
    }
  }

  /** Confirm the pending update (called from UI confirm button). */
  public confirmUpdate(): void {
    if (!this.pendingUpdate) return;

    const update = this.pendingUpdate;

    this.applyFieldUpdate.emit(update);

    this.pendingUpdate = null;
    this.commandState = 'idle';
    this.micStatusText = `Updated ${update.segmentName}-${update.fieldIndex} to "${update.newValue}".`;
    this.statusText = `✓ ${update.segmentName}-${update.fieldIndex} updated to "${update.newValue}".`;

    this.speak(
      `Done. ${update.segmentName} field ${update.fieldIndex}, ${update.fieldLabel}, has been updated to ${update.newValue}.`
    );
  }

  /** Cancel the pending update (called from UI cancel button). */
  public cancelUpdate(): void {
    this.pendingUpdate = null;
    this.commandState = 'idle';
    this.micStatusText =
      'Update cancelled. Say a new command or say "stop" to stop.';

    this.speak('Update cancelled.');
  }

  public get playbackLabel(): string {
    if (this.isSpeaking && !this.isPaused) {
      return 'Pause';
    }

    return 'Play';
  }

  private onHasMessageChange(): void {
    if (!this.hasMessage) {
      this.activeLineNumber = null;
      this.lastCommand = '';
      this.lastNarration = '';
      this.activeUtteranceId += 1;
      this.pendingUpdate = null;
      this.commandState = 'idle';

      this.stopPlaybackMonitor();

      if (typeof window !== 'undefined' && this.isSpeechSupported) {
        window.speechSynthesis.cancel();
      }

      if (this.recognition && this.isListening) {
        this.recognition.stop();
      }

      this.isListening = false;
      this.isSpeaking = false;
      this.isPaused = false;
      this.statusText =
        'Paste or upload an HL7 message to enable voice guidance.';

      if (this.isMicSupported) {
        this.micStatusText =
          'Mic ready. Say: "set PV1.2 to 123", play, pause, or stop.';
      }

      return;
    }

    if (!this.isSpeaking) {
      this.statusText = 'Click a line to hear a segment explanation.';
    }

    if (this.isMicSupported) {
      this.micStatusText =
        'Mic ready. Say: "set PV1.2 to 123", play, pause, or stop.';
    }
  }

  private setupMicRecognition(): void {
    const recognitionCtor = this.getRecognitionConstructor();

    if (!recognitionCtor) {
      this.isMicSupported = false;

      return;
    }

    this.recognition = new recognitionCtor();
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = 'en-US';

    this.recognition.onresult = event => {
      this.zone.run(() => this.handleVoiceResult(event));
    };

    this.recognition.onerror = () => {
      this.zone.run(() => {
        this.isListening = false;
        this.interimTranscript = '';
        this.micStatusText = 'Mic error. Please try again.';
      });
    };

    this.recognition.onend = () => {
      this.zone.run(() => {
        this.isListening = false;
        this.interimTranscript = '';
      });
    };

    this.isMicSupported = true;
  }

  private getRecognitionConstructor(): VoiceRecognitionConstructor | null {
    if (typeof window === 'undefined') {
      return null;
    }

    const voiceWindow = window as unknown as {
      SpeechRecognition?: VoiceRecognitionConstructor;
      webkitSpeechRecognition?: VoiceRecognitionConstructor;
    };

    return (
      voiceWindow.SpeechRecognition ||
      voiceWindow.webkitSpeechRecognition ||
      null
    );
  }

  private handleVoiceResult(event: VoiceRecognitionEventLike): void {
    const latestResult = event.results[event.results.length - 1];

    if (!latestResult || !latestResult[0]) {
      return;
    }

    const rawTranscript = latestResult[0].transcript.trim();
    const transcript = rawTranscript.toLowerCase();

    if (!transcript) {
      return;
    }

    // Stream interim (partial) transcript for live display; only process on final
    if (!latestResult.isFinal) {
      this.interimTranscript = rawTranscript;
      return;
    }

    // Final result — clear interim and commit
    this.interimTranscript = '';
    this.lastCommand = rawTranscript;

    // If we're awaiting confirmation, handle yes/no
    if (this.commandState === 'awaiting_confirmation') {
      this.handleConfirmationResponse(transcript);

      return;
    }

    // Playback controls
    if (transcript.includes('pause')) {
      this.pauseByCommand();

      return;
    }

    if (transcript.includes('play') || transcript.includes('resume')) {
      this.playByCommand();

      return;
    }

    if (transcript.includes('repeat') || transcript.includes('again')) {
      if (this.lastNarration) {
        this.speak(this.lastNarration);
      }

      return;
    }

    if (transcript.includes('stop')) {
      this.stopByCommand();

      return;
    }

    // HL7 field update commands
    const updateResult = this.parseUpdateCommand(transcript);

    if (updateResult) {
      this.handleParsedUpdate(updateResult);

      return;
    }

    this.micStatusText =
      'Unknown command. Say: "set PV1.2 to 123", play, pause, or stop.';
  }

  /**
   * Parse voice commands like:
   *  - "update PV1.2 to 123"
   *  - "set MSH 9 to ADT A01"
   *  - "change PV1 field 2 to outpatient"
   *  - "update PV1 2 to I"
   */
  private parseUpdateCommand(
    transcript: string
  ): { segmentName: string; fieldNumber: number; newValue: string } | null {
    // Normalise spoken numbers: "field 2" → "2", "field two" → "2"
    const wordsToNumbers: { [key: string]: string } = {
      zero: '0',
      one: '1',
      two: '2',
      three: '3',
      four: '4',
      five: '5',
      six: '6',
      seven: '7',
      eight: '8',
      nine: '9',
      ten: '10',
      eleven: '11',
      twelve: '12',
      thirteen: '13',
      fourteen: '14',
      fifteen: '15',
      sixteen: '16',
      seventeen: '17',
      eighteen: '18',
      nineteen: '19',
      twenty: '20',
    };
    let normalised = transcript;

    for (const [word, digit] of Object.entries(wordsToNumbers)) {
      normalised = normalised.replace(new RegExp(`\\b${word}\\b`, 'g'), digit);
    }

    // Patterns (case-insensitive already; transcript is lowercased)
    const patterns = [
      // "set|update|change PV1.2 to <value>"
      /(?:set|update|change)\s+([A-Za-z]{2}[A-Za-z0-9])[\.\-\s](\d+)\s+to\s+(.+)/i,
      // "set|update|change PV1 field 2 to <value>"
      /(?:set|update|change)\s+([A-Za-z]{2}[A-Za-z0-9])\s+field\s+(\d+)\s+to\s+(.+)/i,
      // "PV1.2 equals|is <value>" (more casual)
      /([A-Za-z]{2}[A-Za-z0-9])[\.\-](\d+)\s+(?:equals?|is|=)\s+(.+)/i,
    ];

    for (const pattern of patterns) {
      const match = normalised.match(pattern);

      if (match) {
        const segmentName = match[1].toUpperCase();
        const fieldNumber = parseInt(match[2], 10);
        const newValue = match[3].trim().replace(/\s+/g, ' ');

        if (
          !isNaN(fieldNumber) &&
          fieldNumber > 0 &&
          segmentName.length === 3
        ) {
          return { segmentName, fieldNumber, newValue };
        }
      }
    }

    return null;
  }

  private handleParsedUpdate(update: {
    segmentName: string;
    fieldNumber: number;
    newValue: string;
  }): void {
    // Find the line index in the current HL7 message
    const lines = this.hl7Message.split(/\r\n|\r|\n/);
    const lineIndex = lines.findIndex(l =>
      l.startsWith(update.segmentName + '|')
    );

    if (lineIndex === -1) {
      const msg = `I could not find a ${update.segmentName} segment in the message.`;

      this.micStatusText = msg;

      this.speak(msg);

      return;
    }

    // Get the field label from HL7 definitions
    const definition = this.hl7Parser.getSegmentDefinition(update.segmentName);
    // fieldNumber is 1-based. definition.fields is 0-based (fields[0] = field 1).
    const fieldLabel =
      definition.fields[update.fieldNumber - 1] ||
      `Field ${update.fieldNumber}`;
    const voiceUpdate: VoiceFieldUpdate = {
      segmentName: update.segmentName,
      fieldIndex: update.fieldNumber,
      newValue: update.newValue,
      lineIndex,
      fieldLabel,
    };

    this.pendingUpdate = voiceUpdate;
    this.commandState = 'awaiting_confirmation';

    const confirmationText = `I heard: set ${update.segmentName} field ${update.fieldNumber}, ${fieldLabel}, to "${update.newValue}". Say "yes" to confirm, or "no" to cancel.`;

    this.micStatusText = confirmationText;
    this.statusText = `Pending: ${update.segmentName}-${update.fieldNumber} → "${update.newValue}"`;

    this.speak(confirmationText);
  }

  private handleConfirmationResponse(transcript: string): void {
    if (
      transcript.includes('yes') ||
      transcript.includes('confirm') ||
      transcript.includes('okay') ||
      transcript.includes('ok') ||
      transcript.includes('do it') ||
      transcript.includes('apply')
    ) {
      this.confirmUpdate();

      return;
    }

    if (
      transcript.includes('no') ||
      transcript.includes('cancel') ||
      transcript.includes('abort') ||
      transcript.includes('stop')
    ) {
      this.cancelUpdate();

      return;
    }

    this.speak('Please say "yes" to confirm the update, or "no" to cancel.');
  }

  private playByCommand(): void {
    if (!this.isSpeechSupported || typeof window === 'undefined') {
      return;
    }

    if (this.isSpeaking && this.isPaused) {
      window.speechSynthesis.resume();

      this.isPaused = false;
      this.statusText = 'Playback resumed by voice command.';
      this.micStatusText = 'Voice command: resume.';

      return;
    }

    if (!this.isSpeaking && this.lastNarration) {
      this.speak(this.lastNarration);

      this.micStatusText = 'Voice command: play.';
    }
  }

  private pauseByCommand(): void {
    if (!this.isSpeechSupported || typeof window === 'undefined') {
      return;
    }

    if (this.isSpeaking && !this.isPaused) {
      window.speechSynthesis.pause();

      this.isPaused = true;
      this.statusText = 'Playback paused by voice command.';
      this.micStatusText = 'Voice command: pause.';
    }
  }

  private stopByCommand(): void {
    if (!this.isSpeechSupported || typeof window === 'undefined') {
      return;
    }

    this.activeUtteranceId += 1;

    this.stopPlaybackMonitor();
    window.speechSynthesis.cancel();

    this.isSpeaking = false;
    this.isPaused = false;
    this.statusText = 'Playback stopped by voice command.';
    this.micStatusText = 'Voice command: stop.';
  }

  private speak(text: string): void {
    if (!this.isSpeechSupported || typeof window === 'undefined' || !text) {
      return;
    }

    this.stopPlaybackMonitor();
    window.speechSynthesis.cancel();

    const utteranceId = ++this.activeUtteranceId;
    const utterance = new SpeechSynthesisUtterance(text);

    utterance.lang = 'en-US';
    utterance.rate = 0.98;
    utterance.pitch = 1;

    utterance.onstart = () => {
      if (utteranceId !== this.activeUtteranceId) {
        return;
      }

      this.isSpeaking = true;
      this.isPaused = false;

      this.startPlaybackMonitor(utteranceId);
    };

    utterance.onpause = () => {
      if (utteranceId !== this.activeUtteranceId) {
        return;
      }

      this.isPaused = true;
    };

    utterance.onresume = () => {
      if (utteranceId !== this.activeUtteranceId) {
        return;
      }

      this.isPaused = false;
    };

    utterance.onend = () => {
      this.finalizePlayback(
        utteranceId,
        this.commandState === 'awaiting_confirmation'
          ? 'Say "yes" to confirm or "no" to cancel.'
          : 'Explanation complete. Click another line to continue.'
      );
    };

    utterance.onerror = () => {
      this.finalizePlayback(
        utteranceId,
        'Audio playback failed in this browser.'
      );
    };

    window.speechSynthesis.speak(utterance);
  }

  private buildNarration(lineContent: string, lineIndex: number): string {
    const lineNumber = lineIndex + 1;

    if (!lineContent || !lineContent.trim()) {
      return `Line ${lineNumber} is empty. Add HL7 content and click the line again.`;
    }

    const parsed = this.hl7Parser.parseSegment(lineContent);

    if (!parsed) {
      return `Line ${lineNumber} is not a valid HL7 segment. A valid segment starts with a three-character code followed by a pipe.`;
    }

    const definition = this.hl7Parser.getSegmentDefinition(parsed.segmentName);
    const populatedFields = parsed.fields.filter(
      field => field.trim().length > 0
    );
    const purpose = this.hl7Parser.getSegmentPurpose(parsed.segmentName);
    const intro = [
      `Line ${lineNumber}.`,
      `Segment ${parsed.segmentName}, ${definition.name}.`,
      purpose || `This is the ${definition.name} segment.`,
      `It has ${populatedFields.length} populated fields.`,
    ].join(' ');
    const details: string[] = [];

    for (let fieldIndex = 0; fieldIndex < parsed.fields.length; fieldIndex++) {
      const fieldValue = parsed.fields[fieldIndex];

      if (!fieldValue || !fieldValue.trim()) {
        continue;
      }

      const fieldNumber = fieldIndex + 1;
      const fieldId = `${parsed.segmentName}-${fieldNumber}`;
      const fieldName = definition.fields[fieldIndex] || `Field ${fieldNumber}`;
      const isDateField = this.hl7Parser.isDateField(fieldName);

      details.push(
        this.describeField(fieldId, fieldName, fieldValue, isDateField)
      );

      if (details.length >= this.maxFieldsToExplain) {
        break;
      }
    }

    const omittedCount = populatedFields.length - details.length;

    if (omittedCount > 0) {
      details.push(
        `I skipped ${omittedCount} additional populated fields to keep this explanation concise.`
      );
    }

    if (details.length === 0) {
      details.push('This segment currently has no field values populated.');
    }

    return [intro, ...details].join(' ');
  }

  private describeField(
    fieldId: string,
    fieldName: string,
    fieldValue: string,
    isDateField: boolean
  ): string {
    const repetitions = fieldValue
      .split('~')
      .filter(rep => rep.trim().length > 0);

    if (repetitions.length > 1) {
      const repetitionDetails = repetitions
        .map((rep, index) => {
          const valueDescription = this.describeSingleValue(
            fieldId,
            rep,
            isDateField
          );

          return `Repetition ${index + 1}: ${valueDescription}`;
        })
        .join(' ');

      return `${fieldId}, ${fieldName}, has ${repetitions.length} values. ${repetitionDetails}${this.getAllowedValueHint(fieldId)}`;
    }

    return `${fieldId}, ${fieldName}. ${this.describeSingleValue(fieldId, fieldValue, isDateField)}${this.getAllowedValueHint(fieldId)}`;
  }

  private describeSingleValue(
    fieldId: string,
    value: string,
    isDateField: boolean
  ): string {
    const components = value.split('^');
    const componentNames = this.hl7Parser.getComponentDefinition(fieldId);

    if (components.length > 1 || componentNames.length > 0) {
      const componentDetails = components
        .map((componentValue, index) => {
          if (!componentValue || !componentValue.trim()) {
            return '';
          }

          const componentName =
            componentNames[index] || `Component ${index + 1}`;
          const isDateComponent = this.hl7Parser.isDateField(componentName);
          const spokenValue = isDateComponent
            ? this.getDateNarrationText(componentValue)
            : this.toSpeechText(componentValue);

          return `${componentName} is ${spokenValue}`;
        })
        .filter(text => text.length > 0);

      if (componentDetails.length > 0) {
        return componentDetails.join(', ') + '.';
      }
    }

    if (isDateField) {
      return `Value is ${this.getDateNarrationText(value)}.`;
    }

    return `Value is ${this.toSpeechText(value)}.`;
  }

  private getAllowedValueHint(fieldId: string): string {
    const hints = this.hl7Parser.getValueSetHint(fieldId);

    if (!hints || hints.length === 0) {
      return '';
    }

    return ` Common coded values include ${hints.join(', ')}.`;
  }

  private toSpeechText(value: string): string {
    return value
      .replace(/&/g, ' and ')
      .replace(/\\/g, ' backslash ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private getDateNarrationText(value: string): string {
    const raw = this.toSpeechText(value);

    if (!this.hl7Parser.isValidHL7Date(value)) {
      return `${raw}, and it is not a valid HL7 date/time.`;
    }

    const formatted = this.hl7Parser.formatHL7Date(value);

    if (!formatted) {
      return raw;
    }

    return `${raw}, human readable as ${formatted}`;
  }

  private startPlaybackMonitor(utteranceId: number): void {
    if (typeof window === 'undefined') {
      return;
    }

    this.stopPlaybackMonitor();

    this.playbackMonitorId = window.setInterval(() => {
      if (utteranceId !== this.activeUtteranceId) {
        this.stopPlaybackMonitor();

        return;
      }

      const synth = window.speechSynthesis;

      if (!synth.speaking && !synth.pending && !this.isPaused) {
        this.finalizePlayback(
          utteranceId,
          this.commandState === 'awaiting_confirmation'
            ? 'Say "yes" to confirm or "no" to cancel.'
            : 'Explanation complete. Click another line to continue.'
        );
      }
    }, 80);
  }

  private stopPlaybackMonitor(): void {
    if (typeof window === 'undefined' || this.playbackMonitorId === null) {
      return;
    }

    window.clearInterval(this.playbackMonitorId);

    this.playbackMonitorId = null;
  }

  private finalizePlayback(utteranceId: number, statusText: string): void {
    if (utteranceId !== this.activeUtteranceId) {
      return;
    }

    this.stopPlaybackMonitor();

    this.isSpeaking = false;
    this.isPaused = false;
    this.statusText = statusText;
  }
}
