import {
  Component,
  OnInit,
  OnDestroy,
  Output,
  EventEmitter,
  AfterViewInit,
  ViewChild,
  TemplateRef,
  inject,
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { Hl7ParserService } from '../../services/hl7-parser.service';
import { TooltipService } from '../../services/tooltip.service';

interface ParsedSegment {
  segmentName: string;
  fields: string[];
  hasInvalidDate: boolean;
}

@Component({
  selector: 'app-message-editor',
  imports: [CommonModule],
  templateUrl: './message-editor.component.html',
  styleUrl: './message-editor.component.scss',
})
export class MessageEditorComponent
  implements OnInit, AfterViewInit, OnDestroy
{
  @ViewChild('fieldTooltipTpl', { static: true })
  fieldTooltipTpl!: TemplateRef<unknown>;

  private readonly tooltipService = inject(TooltipService);

  public hl7Message = '';
  public lineNumbers: number[] = [];
  public currentLineIndex = -1;
  public showError = false;
  public isMobile = false;
  public isDragOver = false;
  public currentYear = new Date().getFullYear();
  public parsedSegments: ParsedSegment[] = [];
  private readonly lineHeightMobile = 17;
  private readonly lineHeightDesktop = 20;
  private readonly paddingTopMobile = 8;
  private readonly paddingTopDesktop = 14;
  private readonly resizeHandler = (): void => this.checkMobile();
  @Output() lineSelected = new EventEmitter<{
    lineContent: string;
    lineIndex: number;
  }>();
  @Output() lineClicked = new EventEmitter<{
    lineContent: string;
    lineIndex: number;
  }>();
  @Output() messageChanged = new EventEmitter<string>();

  constructor(private hl7Parser: Hl7ParserService) {}

  ngOnInit(): void {
    this.checkMobile();
    window.addEventListener('resize', this.resizeHandler);
  }

  ngOnDestroy(): void {
    window.removeEventListener('resize', this.resizeHandler);
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.updatePlaceholder();
    }, 0);
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
    this.parseSegments();
    this.messageChanged.emit(this.hl7Message);
  }

  public onContentInput(event: Event): void {
    const el = event.target as HTMLDivElement;

    this.hl7Message = el.innerText;

    this.onMessageInput();
    this.updatePlaceholder();
  }

  public onPaste(event: ClipboardEvent): void {
    event.preventDefault();

    const text = event.clipboardData?.getData('text/plain') || '';

    document.execCommand('insertText', false, text);

    const el = document.getElementById('hl7input') as HTMLDivElement;

    if (el) {
      this.hl7Message = el.innerText;
    }

    this.onMessageInput();
    this.updatePlaceholder();
  }

  public onBlur(): void {
    if (this.hl7Message) {
      this.applyHighlighting();
    }
  }

  public onTextareaClick(): void {
    const selectedLine = this.handleCursorMove();

    this.lineClicked.emit(selectedLine);
  }

  public onKeyUp(): void {
    this.handleCursorMove();
  }

  public onLineClick(lineIndex: number): void {
    this.currentLineIndex = lineIndex;

    const lines = this.getLines();
    const payload = {
      lineContent: lines[lineIndex] || '',
      lineIndex,
    };

    this.lineSelected.emit(payload);
    this.lineClicked.emit(payload);
    this.updateHighlight();
  }

  public onScroll(): void {
    const editable = document.getElementById('hl7input') as HTMLDivElement;
    const lineNumbersEl = document.getElementById('lineNumbers');
    const highlight = document.getElementById('lineHighlight');

    if (editable && lineNumbersEl) {
      lineNumbersEl.scrollTop = editable.scrollTop;
    }

    if (this.currentLineIndex >= 0 && highlight && editable) {
      const scrollTop = editable.scrollTop;
      const top =
        this.paddingTop + this.currentLineIndex * this.lineHeight - scrollTop;

      highlight.style.top = `${top}px`;
    }
  }

  public clearAll(): void {
    this.hl7Message = '';
    this.currentLineIndex = -1;
    this.lineNumbers = [];
    this.parsedSegments = [];
    this.showError = false;

    const el = document.getElementById('hl7input') as HTMLDivElement;

    if (el) {
      el.innerHTML = '';
    }

    const highlight = document.getElementById('lineHighlight');

    if (highlight) {
      highlight.style.display = 'none';
    }

    this.updatePlaceholder();
    this.messageChanged.emit(this.hl7Message);
    this.lineSelected.emit({ lineContent: '', lineIndex: -1 });
  }

  public copyToClipboard(): void {
    if (!this.hl7Message) return;

    navigator.clipboard.writeText(this.hl7Message);
  }

  public triggerFileUpload(): void {
    const input = document.getElementById('hl7FileInput') as HTMLInputElement;
    input?.click();
  }

  public updateMessage(message: string): void {
    this.hl7Message = message;

    this.updateLineNumbers();
    this.validateMessage();
    this.parseSegments();
    this.setEditableContent();
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

  private handleCursorMove(): { lineContent: string; lineIndex: number } {
    const editable = document.getElementById('hl7input') as HTMLDivElement;
    const fallback = { lineContent: '', lineIndex: 0 };

    if (!editable) return fallback;

    const lineIndex = this.getCursorLineIndex(editable);
    const lines = this.getLines();

    if (lineIndex !== this.currentLineIndex) {
      this.currentLineIndex = lineIndex;

      this.updateHighlight();
    }

    const selected = {
      lineContent: lines[lineIndex] || '',
      lineIndex,
    };

    this.lineSelected.emit(selected);

    return selected;
  }

  private getCursorLineIndex(editable: HTMLDivElement): number {
    const selection = window.getSelection();

    if (!selection || selection.rangeCount === 0) return 0;

    let node = selection.anchorNode;

    // Validation to ensure node is inside editable
    if (!editable.contains(node)) return 0;

    // Helper to count lines in a set of nodes
    const countLines = (limitNode: Node | null) => {
      let count = 0;

      for (let i = 0; i < editable.childNodes.length; i++) {
        const child = editable.childNodes[i];

        if (child === limitNode) break;

        if (child.nodeType === Node.ELEMENT_NODE) {
          count++;
        } else if (child.nodeType === Node.TEXT_NODE) {
          const text = child.textContent || '';

          if (text.trim().length > 0) {
            count++;
          }
        }
      }

      return count;
    };

    // Case 1: Cursor is directly on the editable container
    if (node === editable) {
      // Return last line index
      const total = countLines(null);

      return Math.max(0, total - 1);
    }

    // Traverse to direct child
    let directChild = node;

    while (directChild && directChild.parentNode !== editable) {
      directChild = directChild.parentNode;
    }

    if (!directChild) return 0;

    // Count lines from previous siblings
    let lineIndex = countLines(directChild);

    // If directChild is Text Node, add lines within it up to cursor
    if (directChild.nodeType === Node.TEXT_NODE) {
      const range = selection.getRangeAt(0);
      const preCaretRange = range.cloneRange();

      preCaretRange.selectNodeContents(directChild);
      preCaretRange.setEnd(range.startContainer, range.startOffset);

      const textBefore = preCaretRange.toString();

      lineIndex += Math.max(0, textBefore.split(/\r\n|\r|\n/).length - 1);
    }

    return lineIndex;
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

    const editable = document.getElementById('hl7input') as HTMLDivElement;

    if (!editable) return;

    const scrollTop = editable.scrollTop;
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
    let reader: FileReader | null = new FileReader();

    reader.onload = () => {
      const content = (reader as FileReader).result as string;

      this.hl7Message = content;

      this.updateLineNumbers();
      this.validateMessage();
      this.parseSegments();
      this.setEditableContent();

      this.currentLineIndex = -1;

      this.messageChanged.emit(this.hl7Message);
      this.lineSelected.emit({ lineContent: '', lineIndex: -1 });

      const highlight = document.getElementById('lineHighlight');

      if (highlight) {
        highlight.style.display = 'none';
      }

      // Release FileReader reference so the closure doesn't keep it alive
      reader = null;
    };

    reader.readAsText(file);
  }

  private parseSegments(): void {
    const lines = this.getLines();

    this.parsedSegments = lines.map(line => {
      const parsed = this.hl7Parser.parseSegment(line);

      if (!parsed) {
        return {
          segmentName: '',
          fields: [],
          hasInvalidDate: false,
        };
      }

      const definition = this.hl7Parser.getSegmentDefinition(
        parsed.segmentName
      );
      let hasInvalidDate = false;

      parsed.fields.forEach((field, index) => {
        const fieldName = definition.fields[index] || '';
        const isDate = this.hl7Parser.isDateField(fieldName);

        if (isDate && field && !this.hl7Parser.isValidHL7Date(field)) {
          hasInvalidDate = true;
        }

        if (field && field.includes('^')) {
          const components = field.split('^');
          const fieldNumber = `${parsed.segmentName}-${index + 1}`;
          const componentNames =
            this.hl7Parser.getComponentDefinition(fieldNumber);

          components.forEach((comp, compIndex) => {
            const compName = componentNames[compIndex] || '';
            const compIsDate = this.hl7Parser.isDateField(compName);

            if (compIsDate && comp && !this.hl7Parser.isValidHL7Date(comp)) {
              hasInvalidDate = true;
            }
          });
        }
      });

      return {
        segmentName: parsed.segmentName,
        fields: parsed.fields,
        hasInvalidDate,
      };
    });
  }

  public getSegmentDisplay(index: number): string {
    const lines = this.getLines();

    return lines[index] || '';
  }

  private getSegmentHtml(line: string, index: number): string {
    const escaped = line
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    if (!line || !line.trim()) return escaped;

    const segment = this.parsedSegments[index];
    const hasInvalidDate = segment ? segment.hasInvalidDate : false;
    // Get segment name (first 3 chars usually)
    const segName = line.split('|')[0];
    const def = this.hl7Parser.getSegmentDefinition(segName);
    // Split by separator (assumed |)
    const parts = escaped.split('|');
    const isMSH = segName === 'MSH';
    const spanStart = '<span class="field-value"';
    const spanEnd = '</span>';

    const highlightedParts = parts.map((part, partIndex) => {
      // Segment ID (index 0)
      if (partIndex === 0) {
        return `<span class="segment-id">${part}</span>`;
      }

      // Determine field name and position strings
      let fieldName = '';
      let positionStr = '';

      if (isMSH) {
        // MSH-1 is the separator.
        // partIndex 1 is MSH-2 (Encoding Chars).
        // partIndex 2 is MSH-3.
        // Hl7ParserService def.fields usually starts with "Field Separator" at index 0?
        // Let's assume def.fields aligns with HL7 field index - 1 for non-MSH.
        // For MSH: MSH-1 is Separator. MSH-2 is Encoding.
        // If def.fields[0] is MSH-1 (Separator), then def.fields[1] is MSH-2.
        // Part index 1 is MSH-2. So parts[k] matches def.fields[k].

        fieldName = def.fields[partIndex] || `MSH-${partIndex + 1}`;
        // But wait, if MSH-1 is separator, it's not in parts array (which splits by separator).
        // The split consumes separator.
        // Part 0 is "MSH".
        // Part 1 is MSH-2 (Encoding).
        // Part 2 is MSH-3.
        // So partIndex matches Field Index for MSH (except 0 which is name).
        // e.g. Part 1 -> Field 1? No. Part 1 is Field 2.
        // So Part Index k -> Field Index k+1.
        positionStr = `MSH-${partIndex + 1}`;
      } else {
        // Non-MSH:
        // Part 0 is Name.
        // Part 1 is Field 1.
        // Part 2 is Field 2.
        // So Part Index k -> Field Index k.
        fieldName = def.fields[partIndex - 1] || `Field ${partIndex}`;
        positionStr = `${segName}-${partIndex}`;
      }

      // If text is empty, just return empty
      if (!part) return part;

      let classAttr = 'class="field-value"';

      if (this.hl7Parser.isDateField(fieldName)) {
        const reps = part.split('~');
        // Check if any repetition is invalid
        if (reps.some(r => !this.hl7Parser.isValidHL7Date(r))) {
          classAttr = 'class="field-value field-error"';
        }
      }

      // Escape the part for attribute usage (though part is already escaped HTML text,
      // putting it in attribute requires quote escaping if any)
      // Since 'part' comes from 'escaped.split', it has &amp; etc. Safe for double quotes?
      // Yes, unless it has ".
      const safePart = part.replace(/"/g, '&quot;');

      return `${spanStart.replace('class="field-value"', classAttr)}
        data-segment="${segName}"
        data-position="${positionStr}"
        data-label="${fieldName}"
        >${part}${spanEnd}`;
    });

    const joined = highlightedParts.join('|');

    if (hasInvalidDate) {
      return `<span class="text-red-500 font-bold mr-1" title="This segment contains invalid date(s)">⚠</span>${joined}`;
    }

    return joined;
  }

  // ── Tooltip (delegated to TooltipService) ───────────────────────────────

  /** Dynamic data for the current field tooltip template. */
  public tooltipCtx: {
    segment: string;
    position: string;
    label: string;
    values: { text: string; isError: boolean }[];
  } = { segment: '', position: '', label: '', values: [] };

  public handleMouseOver(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.classList.contains('field-value')) return;

    const fieldId = target.getAttribute('data-position') || '';
    const rawValue = target.innerText;

    this.tooltipCtx.segment = target.getAttribute('data-segment') || '';
    this.tooltipCtx.position = fieldId;
    this.tooltipCtx.label = target.getAttribute('data-label') || '';

    // Build value rows
    const lines: { text: string; isError: boolean }[] = [];
    const compDefs = this.hl7Parser.getComponentDefinition(fieldId);
    const repetitions = rawValue.split('~');

    repetitions.forEach((rep, i) => {
      if (repetitions.length > 1) {
        lines.push({ text: `-- Repetition ${i + 1} --`, isError: false });
      }

      const comps = rep.split('^');

      if (comps.length > 1 || (compDefs && compDefs.length > 0)) {
        comps.forEach((val, j) => {
          if (!val) return;

          const label = compDefs[j];
          let text = '';
          let isError = false;

          if (label) {
            text = `${label}: ${val}`;
            if (
              this.hl7Parser.isDateField(label) &&
              !this.hl7Parser.isValidHL7Date(val)
            ) {
              isError = true;
            }
          } else if (comps.length > 1) {
            text = `Comp ${j + 1}: ${val}`;
          } else {
            text = val;
          }

          if (text) lines.push({ text, isError });
        });
      } else if (rep) {
        let isError = false;
        if (
          this.hl7Parser.isDateField(this.tooltipCtx.label) &&
          !this.hl7Parser.isValidHL7Date(rep)
        ) {
          isError = true;
        }
        lines.push({ text: rep, isError });
      }
    });

    if (lines.length === 0 && rawValue) {
      lines.push({ text: rawValue, isError: false });
    }

    this.tooltipCtx.values = lines;

    this.tooltipService.show(
      target,
      {
        content: '',
        template: this.fieldTooltipTpl,
        templateContext: this.tooltipCtx,
        position: 'cursor',
        maxWidth: 320,
        showArrow: false,
      },
      event
    );
  }

  public handleMouseOut(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (target.classList.contains('field-value')) {
      this.tooltipService.hide(0);
    }
  }

  private buildHighlightedHtml(): string {
    if (!this.hl7Message) {
      return '';
    }

    const lines = this.getLines();
    const htmlLines = lines.map((line, i) => {
      // Pass the line and index to new getSegmentHtml signature
      return `<div class="leading-[1.7] sm:leading-[2]">${this.getSegmentHtml(line, i)}</div>`;
    });

    return htmlLines.join('');
  }

  /** Apply syntax highlighting (called on blur or programmatic content set) */
  private applyHighlighting(): void {
    const el = document.getElementById('hl7input') as HTMLDivElement;
    if (!el || !this.hl7Message) return;

    el.innerHTML = this.buildHighlightedHtml();
  }

  /** Set the editable div content with highlighting (for programmatic updates like file load) */
  private setEditableContent(): void {
    const el = document.getElementById('hl7input') as HTMLDivElement;
    if (!el) return;

    if (this.hl7Message) {
      el.innerHTML = this.buildHighlightedHtml();
    } else {
      el.innerHTML = '';
    }
    this.updatePlaceholder();
  }

  /** Toggle placeholder visibility based on content */
  private updatePlaceholder(): void {
    const el = document.getElementById('hl7input') as HTMLDivElement;

    if (!el) return;

    if (!this.hl7Message || this.hl7Message.trim() === '') {
      // Ensure the editable is truly empty; browsers often keep <br> which breaks :empty
      if (el.innerHTML.trim() !== '') {
        el.innerHTML = '';
      }

      el.setAttribute(
        'data-placeholder',
        'Paste or type your HL7 message here...\n\nMSH|^~\\&|SendApp|SendFac|RecApp|RecFac|20230915120000||ADT^A01|MSG001|P|2.5\nPID|1||123456^^^Hospital^MR||Doe^John^A||19800101|M\nPV1|1|I|ICU^101^A\n\nClick a line to inspect its fields.\nEdits are reflected instantly.'
      );
      el.setAttribute('data-empty', 'true');
    } else {
      el.removeAttribute('data-placeholder');
      el.removeAttribute('data-empty');
    }
  }
}
