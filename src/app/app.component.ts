import { Component, ViewChild } from '@angular/core';

import { HeaderComponent } from './components/header/header.component';
import { MessageEditorComponent } from './components/message-editor/message-editor.component';
import { SegmentDetailComponent } from './components/segment-detail/segment-detail.component';
import { FooterComponent } from './components/footer/footer.component';

@Component({
  selector: 'app-root',
  imports: [
    HeaderComponent,
    MessageEditorComponent,
    SegmentDetailComponent,
    FooterComponent,
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  @ViewChild(MessageEditorComponent) messageEditor!: MessageEditorComponent;

  public selectedLineContent = '';
  public selectedLineIndex = -1;
  public hl7Message = '';

  public onLineSelected(event: {
    lineContent: string;
    lineIndex: number;
  }): void {
    this.selectedLineContent = event.lineContent;
    this.selectedLineIndex = event.lineIndex;
  }

  public onMessageChanged(message: string): void {
    this.hl7Message = message;
  }

  public handleCopy(): void {
    this.messageEditor.copyToClipboard();
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
  }
}
