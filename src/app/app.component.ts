import { Component, ViewChild, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { SwUpdate } from '@angular/service-worker';

import { HeaderComponent } from './components/header/header.component';
import { MessageEditorComponent } from './components/message-editor/message-editor.component';
import { SegmentDetailComponent } from './components/segment-detail/segment-detail.component';
import { FooterComponent } from './components/footer/footer.component';
import { TutorialComponent } from './components/tutorial/tutorial.component';
import { VoiceAgentComponent } from './components/voice-agent/voice-agent.component';
import { TutorialService } from './services/tutorial.service';

@Component({
  selector: 'app-root',
  imports: [
    HeaderComponent,
    MessageEditorComponent,
    SegmentDetailComponent,
    FooterComponent,
    TutorialComponent,
    VoiceAgentComponent,
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, OnDestroy {
  constructor(
    private tutorialService: TutorialService,
    private swUpdate: SwUpdate
  ) {}
  @ViewChild(MessageEditorComponent) messageEditor!: MessageEditorComponent;
  @ViewChild(VoiceAgentComponent) voiceAgent?: VoiceAgentComponent;

  public selectedLineContent = '';
  public selectedLineIndex = -1;
  public hl7Message = '';
  private updateSub: Subscription | null = null;
  private tutorialTimeoutId: ReturnType<typeof setTimeout> | null = null;

  public get hasHl7Content(): boolean {
    return this.hl7Message.trim().length > 0;
  }

  ngOnInit(): void {
    this.checkForAppUpdate();

    if (this.tutorialService.shouldShowTutorial()) {
      this.tutorialTimeoutId = setTimeout(() => {
        this.tutorialService.startTutorial();

        this.tutorialTimeoutId = null;
      }, 500);
    }
  }

  ngOnDestroy(): void {
    this.updateSub?.unsubscribe();

    if (this.tutorialTimeoutId !== null) {
      clearTimeout(this.tutorialTimeoutId);

      this.tutorialTimeoutId = null;
    }
  }

  private checkForAppUpdate(): void {
    if (!this.swUpdate.isEnabled) {
      return;
    }

    // When the service worker finds a new version, reload immediately
    this.updateSub = this.swUpdate.versionUpdates.subscribe(event => {
      if (event.type === 'VERSION_READY') {
        window.location.reload();
      }
    });

    // Proactively ask the SW to check for a new version now
    this.swUpdate.checkForUpdate().catch(() => {
      // ignore – no network or SW not active
    });
  }

  public onLineSelected(event: {
    lineContent: string;
    lineIndex: number;
  }): void {
    this.selectedLineContent = event.lineContent;
    this.selectedLineIndex = event.lineIndex;
  }

  public onLineClicked(event: {
    lineContent: string;
    lineIndex: number;
  }): void {
    this.voiceAgent?.explainLine(event.lineContent, event.lineIndex);
  }

  public onMessageChanged(message: string): void {
    this.hl7Message = message;
  }

  public handleCopy(): void {
    this.messageEditor.copyToClipboard();
  }

  public handleUpload(): void {
    this.messageEditor.triggerFileUpload();
  }

  public handleClear(): void {
    this.messageEditor.clearAll();
  }

  public onFieldValueChange(event: {
    lineIndex: number;
    fieldIndex: number;
    componentIndex: number | null;
    newValue: string;
  }): void {
    const lines = this.hl7Message.split(/\r\n|\r|\n/);
    const line = lines[event.lineIndex];

    if (!line) return;

    const segName = line.substring(0, 3);
    let fields: string[];

    if (segName === 'MSH') {
      const sep = line[3] || '|';
      const rest = line.substring(4).split(sep);

      fields = [sep, ...rest];
    } else {
      fields = line.split('|').slice(1);
    }

    // Update the field value
    if (event.componentIndex !== null) {
      // Update component in composite field
      const comps = fields[event.fieldIndex].split('^');

      comps[event.componentIndex] = event.newValue;
      fields[event.fieldIndex] = comps.join('^');
    } else {
      // Update simple field
      fields[event.fieldIndex] = event.newValue;
    }

    // Rebuild the line
    let newLine: string;

    if (segName === 'MSH') {
      const sep = fields[0];

      newLine = 'MSH' + sep + fields.slice(1).join(sep);
    } else {
      newLine = segName + '|' + fields.join('|');
    }

    // Update the message
    lines[event.lineIndex] = newLine;
    this.hl7Message = lines.join('\n');
    // Update the selected line content
    this.selectedLineContent = newLine;

    // Store active element before update
    const activeElement = document.activeElement as HTMLElement;
    const activeId = activeElement?.id;

    // Update the message editor to refresh the display
    this.messageEditor.updateMessage(this.hl7Message);

    // Restore focus after a brief delay to allow DOM update
    if (activeId) {
      setTimeout(() => {
        const element = document.getElementById(activeId) as HTMLInputElement;
        if (element) {
          element.focus({ preventScroll: true });
          // Restore cursor position to end
          if (element.setSelectionRange && element.value) {
            const length = element.value.length;
            element.setSelectionRange(length, length);
          }
        }
      }, 0);
    }
  }
}
