import { describe, it, expect } from 'vitest';
import { ValidationRules, sanitizeText } from '../utils/validation';

describe('ValidationRules', () => {
  describe('budget', () => {
    it('should validate valid budget', () => {
      expect(ValidationRules.budget.isValid('500')).toBe(true);
      expect(ValidationRules.budget.isValid('50000')).toBe(true);
    });

    it('should invalidate invalid budget', () => {
      expect(ValidationRules.budget.isValid('50')).toBe(false);
      expect(ValidationRules.budget.isValid('abc')).toBe(false);
      expect(ValidationRules.budget.isValid('60000')).toBe(false);
    });
  });

  describe('text', () => {
    it('should validate description length', () => {
      expect(ValidationRules.text.isValid('Short')).toBe(false);
      expect(ValidationRules.text.isValid('This is a valid description with enough length.')).toBe(true);
    });
  });

  describe('futureDate', () => {
    it('should invalidate past dates', () => {
      const past = new Date();
      past.setDate(past.getDate() - 1);
      expect(ValidationRules.futureDate.isValid(past.toISOString())).toBe(false);
    });

    it('should validate future dates', () => {
      const future = new Date();
      future.setDate(future.getDate() + 1);
      expect(ValidationRules.futureDate.isValid(future.toISOString())).toBe(true);
    });
  });
});

describe('sanitizeText', () => {
  it('should remove control characters', () => {
    const input = "Hello\u0000World";
    expect(sanitizeText(input)).toBe("HelloWorld");
  });

  it('should trim and collapse whitespace', () => {
    const input = "  Hello   World  ";
    expect(sanitizeText(input)).toBe("Hello World");
  });
});