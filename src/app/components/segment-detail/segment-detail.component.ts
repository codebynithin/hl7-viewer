import {
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  Output,
  EventEmitter,
} from '@angular/core';

import { FormsModule } from '@angular/forms';
import { Hl7ParserService } from '../../services/hl7-parser.service';
import { FieldData, ComponentData } from '../../models/hl7.model';

@Component({
  selector: 'app-segment-detail',
  imports: [FormsModule],
  templateUrl: './segment-detail.component.html',
  styleUrl: './segment-detail.component.scss',
})
export class SegmentDetailComponent implements OnChanges {
  public segmentName = '';
  public segmentDescription = '';
  public fields: FieldData[] = [];
  public showEmptyState = true;
  public showInvalidState = false;
  @Input() lineContent = '';
  @Input() lineIndex = -1;
  @Output() fieldValueChange = new EventEmitter<{
    lineIndex: number;
    fieldIndex: number;
    componentIndex: number | null;
    newValue: string;
  }>();

  constructor(private hl7Parser: Hl7ParserService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['lineContent'] || changes['lineIndex']) {
      this.parseSegment();
    }
  }

  public onFieldValueChange(
    fieldIndex: number,
    componentIndex: number | null,
    newValue: string
  ): void {
    this.fieldValueChange.emit({
      lineIndex: this.lineIndex,
      fieldIndex,
      componentIndex,
      newValue,
    });
  }

  public formatDate(value: string): string {
    return this.hl7Parser.formatHL7Date(value);
  }

  public getValue(event: Event): string {
    return (event.target as HTMLInputElement).value;
  }

  private parseSegment(): void {
    if (!this.lineContent || !this.lineContent.trim()) {
      this.showEmptyState = true;
      this.showInvalidState = false;

      return;
    }

    const parsed = this.hl7Parser.parseSegment(this.lineContent);

    if (!parsed) {
      this.showEmptyState = false;
      this.showInvalidState = true;

      return;
    }

    this.showEmptyState = false;
    this.showInvalidState = false;
    this.segmentName = parsed.segmentName;

    const definition = this.hl7Parser.getSegmentDefinition(parsed.segmentName);

    this.segmentDescription = definition.name;

    this.fields = parsed.fields.map((field, index) => {
      const fieldName = definition.fields[index] || `Field ${index + 1}`;
      const fieldNumber = `${parsed.segmentName}-${index + 1}`;
      const isEmpty = field === undefined || field === '';
      const isDate = this.hl7Parser.isDateField(fieldName);

      if (field && field.includes('^')) {
        const components = field.split('^');
        const componentNames =
          this.hl7Parser.getComponentDefinition(fieldNumber);
        const componentData: ComponentData[] = components.map(
          (comp, compIndex) => ({
            label: componentNames[compIndex] || `Component ${compIndex + 1}`,
            value: comp,
            isDate: this.hl7Parser.isDateField(componentNames[compIndex] || ''),
          })
        );

        return {
          fieldNumber,
          fieldName,
          value: field,
          components: componentData,
          isEmpty,
          isDate,
        };
      }

      return {
        fieldNumber,
        fieldName,
        value: field || '',
        isEmpty,
        isDate,
      };
    });
  }
}
