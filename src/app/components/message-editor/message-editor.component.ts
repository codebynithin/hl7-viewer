import { Component, OnInit, Output, EventEmitter } from '@angular/core';

import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-message-editor',
  imports: [FormsModule],
  templateUrl: './message-editor.component.html',
  styleUrl: './message-editor.component.scss',
})
export class MessageEditorComponent implements OnInit {
  public hl7Message = '';
  public lineNumbers: number[] = [];
  public currentLineIndex = -1;
  public showError = false;
  public isMobile = false;
  public isDragOver = false;
  public currentYear = new Date().getFullYear();
  private readonly lineHeightMobile = 17;
  private readonly lineHeightDesktop = 20;
  private readonly paddingTopMobile = 8;
  private readonly paddingTopDesktop = 14;
  @Output() lineSelected = new EventEmitter<{
    lineContent: string;
    lineIndex: number;
  }>();
  @Output() messageChanged = new EventEmitter<string>();

  ngOnInit(): void {
    this.checkMobile();
    window.addEventListener('resize', () => this.checkMobile());
  }

  get lineHeight(): number {
    return this.isMobile ? this.lineHeightMobile : this.lineHeightDesktop;
  }

  get paddingTop(): number {
    return this.isMobile ? this.paddingTopMobile : this.paddingTopDesktop;
  }

  public onMessageInput(): void {
    this.updateLineNumbers();
    this.validateMessage();
    this.messageChanged.emit(this.hl7Message);
  }

  public onTextareaClick(event: MouseEvent): void {
    this.handleCursorMove();
  }

  public onKeyUp(): void {
    this.handleCursorMove();
  }

  public onScroll(): void {
    const textarea = document.getElementById('hl7input') as HTMLTextAreaElement;
    const lineNumbersEl = document.getElementById('lineNumbers');
    const highlight = document.getElementById('lineHighlight');

    if (textarea && lineNumbersEl) {
      lineNumbersEl.scrollTop = textarea.scrollTop;
    }

    if (this.currentLineIndex >= 0 && highlight && textarea) {
      const scrollTop = textarea.scrollTop;
      const top =
        this.paddingTop + this.currentLineIndex * this.lineHeight - scrollTop;

      highlight.style.top = `${top}px`;
    }
  }

  public clearAll(): void {
    this.hl7Message = '';
    this.currentLineIndex = -1;
    this.lineNumbers = [];
    this.showError = false;

    const highlight = document.getElementById('lineHighlight');

    if (highlight) {
      highlight.style.display = 'none';
    }

    this.messageChanged.emit(this.hl7Message);
    this.lineSelected.emit({ lineContent: '', lineIndex: -1 });
  }

  public copyToClipboard(): void {
    if (!this.hl7Message) return;

    navigator.clipboard.writeText(this.hl7Message);
  }

  public onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = true;
  }

  public onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
  }

  public onFileDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.readHL7File(files[0]);
    }
  }

  public onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = input.files;
    if (files && files.length > 0) {
      this.readHL7File(files[0]);
    }
    input.value = '';
  }

  private checkMobile(): void {
    this.isMobile = window.innerWidth < 640;
  }

  private handleCursorMove(): void {
    const textarea = document.getElementById('hl7input') as HTMLTextAreaElement;

    if (!textarea) return;

    const lineIndex = this.getCursorLineIndex(textarea);
    const lines = this.getLines();

    if (lineIndex !== this.currentLineIndex) {
      this.currentLineIndex = lineIndex;

      this.updateHighlight();
    }

    this.lineSelected.emit({
      lineContent: lines[lineIndex] || '',
      lineIndex,
    });
  }

  private getCursorLineIndex(textarea: HTMLTextAreaElement): number {
    const val = textarea.value;
    const pos = textarea.selectionStart;
    const before = val.substring(0, pos);

    return before.split(/\r\n|\r|\n/).length - 1;
  }

  private getLines(): string[] {
    return this.hl7Message.split(/\r\n|\r|\n/);
  }

  private updateLineNumbers(): void {
    const lines = this.getLines();

    this.lineNumbers = lines.map((_, i) => i + 1);
  }

  private updateHighlight(): void {
    const highlight = document.getElementById('lineHighlight');

    if (!highlight) return;

    const textarea = document.getElementById('hl7input') as HTMLTextAreaElement;

    if (!textarea) return;

    const scrollTop = textarea.scrollTop;
    const top =
      this.paddingTop + this.currentLineIndex * this.lineHeight - scrollTop;

    highlight.style.display = 'block';
    highlight.style.top = `${top}px`;
    highlight.style.height = `${this.lineHeight}px`;
  }

  private validateMessage(): void {
    const lines = this.getLines().filter(l => l.trim());
    const validSegs = lines.filter(l => /^[A-Z]{2}[A-Z0-9]\|/.test(l));
    const firstLine = lines[0] || '';

    this.showError = validSegs.length > 0 && !firstLine.startsWith('MSH');
  }

  private readHL7File(file: File): void {
    const reader = new FileReader();
    reader.onload = () => {
      const content = reader.result as string;
      this.hl7Message = content;
      this.updateLineNumbers();
      this.validateMessage();
      this.currentLineIndex = -1;
      this.messageChanged.emit(this.hl7Message);
      this.lineSelected.emit({ lineContent: '', lineIndex: -1 });

      const highlight = document.getElementById('lineHighlight');
      if (highlight) {
        highlight.style.display = 'none';
      }
    };
    reader.readAsText(file);
  }
}
