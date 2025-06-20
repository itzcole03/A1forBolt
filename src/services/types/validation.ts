export interface ValidationRule {
  validate(data: any): Promise<void>;
  name: string;
  description: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  code: string;
  message: string;
  field?: string;
  value?: any;
}

export interface ValidationWarning {
  code: string;
  message: string;
  field?: string;
  value?: any;
}

export class DataValidationRule implements ValidationRule {
  constructor(
    public name: string,
    public description: string,
    private validator: (data: any) => Promise<boolean>,
    private errorMessage: string
  ) {}

  async validate(data: any): Promise<void> {
    const isValid = await this.validator(data);
    if (!isValid) {
      throw new Error(this.errorMessage);
    }
  }
}

export class RangeValidationRule extends DataValidationRule {
  constructor(field: string, min: number, max: number, errorMessage?: string) {
    super(
      `range_${field}`,
      `Validates that ${field} is between ${min} and ${max}`,
      async (data: any) => {
        const value = data[field];
        return value >= min && value <= max;
      },
      errorMessage || `${field} must be between ${min} and ${max}`
    );
  }
}

export class RequiredFieldValidationRule extends DataValidationRule {
  constructor(field: string, errorMessage?: string) {
    super(
      `required_${field}`,
      `Validates that ${field} is present and not null/undefined`,
      async (data: any) => {
        return data[field] != null;
      },
      errorMessage || `${field} is required`
    );
  }
}

export class TypeValidationRule extends DataValidationRule {
  constructor(field: string, type: string, errorMessage?: string) {
    super(
      `type_${field}`,
      `Validates that ${field} is of type ${type}`,
      async (data: any) => {
        return typeof data[field] === type;
      },
      errorMessage || `${field} must be of type ${type}`
    );
  }
}

export class ArrayValidationRule extends DataValidationRule {
  constructor(field: string, minLength: number, maxLength: number, errorMessage?: string) {
    super(
      `array_${field}`,
      `Validates that ${field} is an array with length between ${minLength} and ${maxLength}`,
      async (data: any) => {
        const value = data[field];
        return Array.isArray(value) && value.length >= minLength && value.length <= maxLength;
      },
      errorMessage || `${field} must be an array with length between ${minLength} and ${maxLength}`
    );
  }
}

export class DateValidationRule extends DataValidationRule {
  constructor(field: string, minDate?: Date, maxDate?: Date, errorMessage?: string) {
    super(
      `date_${field}`,
      `Validates that ${field} is a valid date${minDate ? ` after ${minDate}` : ''}${maxDate ? ` before ${maxDate}` : ''}`,
      async (data: any) => {
        const value = new Date(data[field]);
        if (isNaN(value.getTime())) return false;
        if (minDate && value < minDate) return false;
        if (maxDate && value > maxDate) return false;
        return true;
      },
      errorMessage ||
        `${field} must be a valid date${minDate ? ` after ${minDate}` : ''}${maxDate ? ` before ${maxDate}` : ''}`
    );
  }
}

export class EnumValidationRule extends DataValidationRule {
  constructor(field: string, allowedValues: any[], errorMessage?: string) {
    super(
      `enum_${field}`,
      `Validates that ${field} is one of the allowed values: ${allowedValues.join(', ')}`,
      async (data: any) => {
        return allowedValues.includes(data[field]);
      },
      errorMessage || `${field} must be one of: ${allowedValues.join(', ')}`
    );
  }
}

export class PatternValidationRule extends DataValidationRule {
  constructor(field: string, pattern: RegExp, errorMessage?: string) {
    super(
      `pattern_${field}`,
      `Validates that ${field} matches the pattern ${pattern}`,
      async (data: any) => {
        return pattern.test(data[field]);
      },
      errorMessage || `${field} must match the pattern ${pattern}`
    );
  }
}

export class CustomValidationRule extends DataValidationRule {
  constructor(
    name: string,
    description: string,
    validator: (data: any) => Promise<boolean>,
    errorMessage: string
  ) {
    super(name, description, validator, errorMessage);
  }
}
