export interface SegmentDefinition {
  name: string;
  fields: string[];
}

export interface ComponentDefinition {
  [key: string]: string[];
}

export interface FieldData {
  fieldNumber: string;
  fieldName: string;
  value: string;
  components?: ComponentData[];
  isEmpty: boolean;
  isDate: boolean;
  isValidDate?: boolean;
}

export interface ComponentData {
  label: string;
  value: string;
  isDate: boolean;
  isValidDate?: boolean;
}
