import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SegmentDefinition, ComponentDefinition } from '../models/hl7.model';

interface JsonSubField {
  id: string;
  name: string;
}

interface JsonField {
  id: string;
  name: string;
  fields: { [key: string]: JsonSubField };
}

interface JsonSegment {
  id: string;
  longName: string;
  fields: { [key: string]: JsonField };
}

type JsonSegmentData = { [key: string]: JsonSegment };

@Injectable({ providedIn: 'root' })
export class Hl7ParserService {
  private segmentDefs: { [key: string]: SegmentDefinition } = {};
  private compDefs: ComponentDefinition = {};
  private loaded = false;

  constructor(private http: HttpClient) {
    this.loadDefinitions();
  }

  private loadDefinitions(): void {
    this.http.get<JsonSegmentData>('assets/data/hl7-segments.json').subscribe({
      next: data => {
        this.buildDefinitions(data);
        this.loaded = true;
      },
      error: err => {
        console.error('Failed to load HL7 segment definitions:', err);
      },
    });
  }

  private buildDefinitions(data: JsonSegmentData): void {
    for (const segKey of Object.keys(data)) {
      const seg = data[segKey];
      const fieldKeys = Object.keys(seg.fields).sort((a, b) => {
        const numA = parseInt(a.split('.')[1], 10);
        const numB = parseInt(b.split('.')[1], 10);
        return numA - numB;
      });

      const fieldNames: string[] = fieldKeys.map(fk => seg.fields[fk].name);

      this.segmentDefs[segKey] = {
        name: seg.longName,
        fields: fieldNames,
      };

      // Build component definitions for fields that have sub-fields
      for (const fk of fieldKeys) {
        const field = seg.fields[fk];
        const subFieldKeys = Object.keys(field.fields || {});
        if (subFieldKeys.length > 0) {
          const sortedSubKeys = subFieldKeys.sort((a, b) => {
            const parts = a.split('.');
            const numA = parseInt(parts[2], 10);
            const partsB = b.split('.');
            const numB = parseInt(partsB[2], 10);
            return numA - numB;
          });

          const fieldIndex = fk.split('.')[1];
          const compKey = `${segKey}-${fieldIndex}`;
          this.compDefs[compKey] = sortedSubKeys.map(
            sk => field.fields[sk].name
          );
        }
      }
    }
  }

  getSegmentDefinition(segmentName: string): SegmentDefinition {
    return (
      this.segmentDefs[segmentName] || {
        name: 'Custom / Unknown Segment',
        fields: [],
      }
    );
  }

  getComponentDefinition(fieldNum: string): string[] {
    return this.compDefs[fieldNum] || [];
  }

  parseSegment(line: string): { segmentName: string; fields: string[] } | null {
    if (!line || !line.trim()) {
      return null;
    }

    const segName = line.substring(0, 3);
    if (!/^[A-Z]{2}[A-Z0-9]$/.test(segName) || line[3] !== '|') {
      return null;
    }

    let fields: string[];
    if (segName === 'MSH') {
      const sep = line[3] || '|';
      const rest = line.substring(4).split(sep);
      fields = [sep, ...rest];
    } else {
      fields = line.split('|').slice(1);
    }

    return { segmentName: segName, fields };
  }

  isDateField(fieldName: string): boolean {
    const lowerName = fieldName.toLowerCase();
    return (
      lowerName.includes('date') ||
      lowerName.includes('time') ||
      lowerName.includes('dt')
    );
  }

  formatHL7Date(dt: string): string {
    if (!dt || dt.length < 8) return '';

    const clean = dt.replace(/\D/g, '');
    if (clean.length < 8) return '';

    const year = clean.substr(0, 4);
    const month = clean.substr(4, 2);
    const day = clean.substr(6, 2);
    let formatted = `${month}/${day}/${year}`;

    if (clean.length >= 12) {
      const hour = clean.substr(8, 2);
      const minute = clean.substr(10, 2);
      const second = clean.length >= 14 ? clean.substr(12, 2) : '00';
      formatted += ` ${hour}:${minute}:${second}`;
    } else if (clean.length >= 10) {
      const hour = clean.substr(8, 2);
      formatted += ` ${hour}:00:00`;
    }

    return formatted;
  }

  isValidHL7Date(dt: string): boolean {
    if (!dt || dt.trim() === '') return true;

    const clean = dt.replace(/\D/g, '');

    if (clean.length < 8) return false;

    const year = parseInt(clean.substr(0, 4), 10);
    const month = parseInt(clean.substr(4, 2), 10);
    const day = parseInt(clean.substr(6, 2), 10);

    if (year < 1900 || year > 2100) return false;

    if (month < 1 || month > 12) return false;

    if (day < 1 || day > 31) return false;

    const daysInMonth = this.daysInMonth(month, year);

    if (day > daysInMonth) return false;

    if (clean.length >= 10) {
      const hour = parseInt(clean.substr(8, 2), 10);

      if (hour < 0 || hour > 23) return false;
    }

    if (clean.length >= 12) {
      const minute = parseInt(clean.substr(10, 2), 10);

      if (minute < 0 || minute > 59) return false;
    }

    if (clean.length >= 14) {
      const second = parseInt(clean.substr(12, 2), 10);

      if (second < 0 || second > 59) return false;
    }

    return true;
  }

  private daysInMonth(month: number, year: number): number {
    const daysMap: { [key: number]: number } = {
      1: 31,
      2: 28,
      3: 31,
      4: 30,
      5: 31,
      6: 30,
      7: 31,
      8: 31,
      9: 30,
      10: 31,
      11: 30,
      12: 31,
    };

    if (month === 2 && this.isLeapYear(year)) {
      return 29;
    }

    return daysMap[month] || 31;
  }

  private isLeapYear(year: number): boolean {
    return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  }
}
