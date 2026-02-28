export interface VoiceRecognitionAlternative {
  transcript: string;
}

export interface VoiceRecognitionResult {
  length: number;
  isFinal: boolean;
  [index: number]: VoiceRecognitionAlternative;
}

export interface VoiceRecognitionResultList {
  length: number;
  [index: number]: VoiceRecognitionResult;
}

export interface VoiceRecognitionEventLike extends Event {
  results: VoiceRecognitionResultList;
}

export interface VoiceRecognitionLike {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: VoiceRecognitionEventLike) => void) | null;
  onerror: ((event: Event) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
}

export type VoiceRecognitionConstructor = new () => VoiceRecognitionLike;
