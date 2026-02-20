import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export enum TutorialPosition {
  Top = 'top',
  Bottom = 'bottom',
  Left = 'left',
  Right = 'right',
  Center = 'center',
  RightBottom = 'right-bottom',
  RightTop = 'right-top',
  LeftBottom = 'left-bottom',
  LeftTop = 'left-top',
}

export interface TutorialStep {
  id: string;
  title: string;
  description: string;
  targetSelector?: string;
  position?: TutorialPosition;
  highlightPadding?: number;
}

@Injectable({
  providedIn: 'root',
})
export class TutorialService {
  private readonly STORAGE_KEY = 'hl7-viewer-tutorial-completed';
  private currentStepSubject = new BehaviorSubject<number>(-1);
  private isActiveSubject = new BehaviorSubject<boolean>(false);

  public currentStep$: Observable<number> =
    this.currentStepSubject.asObservable();
  public isActive$: Observable<boolean> = this.isActiveSubject.asObservable();

  public readonly steps: TutorialStep[] = [
    {
      id: 'welcome',
      title: 'Welcome to HL7 Viewer! 👋',
      description:
        'Let\'s take a quick tour of the key features. You can skip this anytime by clicking "Skip Tour".',
      position: TutorialPosition.Center,
    },
    {
      id: 'upload',
      title: 'Upload HL7 Files',
      description:
        'Click here to upload .hl7, .txt, or .dat files. You can also drag and drop files directly into the editor.',
      targetSelector: 'app-header button[title="Upload HL7 file"]',
      position: TutorialPosition.Bottom,
      highlightPadding: 8,
    },
    {
      id: 'editor',
      title: 'Message Editor',
      description:
        'Paste or type your HL7 message here. Click any line to inspect its fields in the details panel. Invalid dates are highlighted in red.',
      targetSelector: '#hl7input',
      position: TutorialPosition.Right,
      highlightPadding: 12,
    },
    {
      id: 'details',
      title: 'Segment Details',
      description:
        'View and edit individual fields of the selected segment. Changes are reflected instantly in the editor. Date fields are validated automatically.',
      targetSelector: 'app-segment-detail',
      position: TutorialPosition.Left,
      highlightPadding: 12,
    },
    {
      id: 'copy',
      title: 'Copy to Clipboard',
      description:
        'Quickly copy your entire HL7 message to the clipboard with one click.',
      targetSelector: 'app-header button[title="Copy to clipboard"]',
      position: TutorialPosition.Bottom,
      highlightPadding: 8,
    },
    {
      id: 'clear',
      title: 'Clear All',
      description:
        'Clear the editor and start fresh. This removes all content from the message editor.',
      targetSelector: 'app-header button[title="Clear all"]',
      position: TutorialPosition.Left,
      highlightPadding: 8,
    },
    {
      id: 'theme',
      title: 'Toggle Theme',
      description:
        'Switch between light and dark mode to suit your preference.',
      targetSelector: 'app-header button[title="Toggle theme"]',
      position: TutorialPosition.Left,
      highlightPadding: 8,
    },
    {
      id: 'github',
      title: 'Report Issues & Suggestions',
      description:
        'Found a bug or have a feature request? Click here to create a GitHub issue.',
      targetSelector: 'app-footer a[rel="noopener noreferrer"]',
      position: TutorialPosition.Left,
      highlightPadding: 8,
    },
    {
      id: 'complete',
      title: "You're All Set! 🎉",
      description:
        'You now know all the key features. Start by uploading an HL7 file or pasting a message into the editor. Happy parsing!',
      position: TutorialPosition.Center,
    },
  ];

  constructor() {}

  public shouldShowTutorial(): boolean {
    return !this.isTutorialCompleted();
  }

  public startTutorial(): void {
    this.currentStepSubject.next(0);
    this.isActiveSubject.next(true);
  }

  public nextStep(): void {
    const current = this.currentStepSubject.value;
    if (current < this.steps.length - 1) {
      this.currentStepSubject.next(current + 1);
    } else {
      this.completeTutorial();
    }
  }

  public previousStep(): void {
    const current = this.currentStepSubject.value;
    if (current > 0) {
      this.currentStepSubject.next(current - 1);
    }
  }

  public skipTutorial(): void {
    this.completeTutorial();
  }

  public completeTutorial(): void {
    this.markTutorialCompleted();
    this.currentStepSubject.next(-1);
    this.isActiveSubject.next(false);
  }

  public getCurrentStep(): TutorialStep | null {
    const index = this.currentStepSubject.value;
    return index >= 0 && index < this.steps.length ? this.steps[index] : null;
  }

  public getCurrentStepIndex(): number {
    return this.currentStepSubject.value;
  }

  private isTutorialCompleted(): boolean {
    return localStorage.getItem(this.STORAGE_KEY) === 'true';
  }

  private markTutorialCompleted(): void {
    localStorage.setItem(this.STORAGE_KEY, 'true');
  }

  public resetTutorial(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }
}
