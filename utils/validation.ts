/**
 * Centralized validation and sanitization logic.
 * Improves maintainability by keeping rules in one place and ensures consistency.
 */

export const ValidationRules = {
  budget: {
    min: 100,
    max: 50000,
    errorMsg: "Budget must be between ₹100 and ₹50,000",
    isValid: (val: string): boolean => {
      const num = parseInt(val, 10);
      return !isNaN(num) && num >= 100 && num <= 50000;
    }
  },
  ingredients: {
    minLength: 3,
    maxLength: 1000, // Prevent prompt injection or token overflow
    errorMsg: "Please enter valid ingredients (3-1000 chars)",
    isValid: (val: string): boolean => {
      const trimmed = val.trim();
      return trimmed.length >= 3 && trimmed.length <= 1000;
    }
  },
  days: {
    min: 1,
    max: 7
  },
  text: {
    minLength: 10,
    maxLength: 500,
    errorMsg: "Description must be between 10 and 500 characters",
    isValid: (val: string): boolean => {
      const len = val.trim().length;
      return len >= 10 && len <= 500;
    }
  },
  futureDate: {
    errorMsg: "Please select a future date",
    isValid: (val: string): boolean => {
      if (!val) return false;
      const d = new Date(val);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return d >= today;
    }
  }
};

export const sanitizeText = (text: string): string => {
  // Remove control characters and excessive whitespace
  return text.trim().replace(/[\u0000-\u001F\u007F-\u009F]/g, "").replace(/\s+/g, " ");
};

export const validateFile = (file: File, maxSizeMB: number = 5): { valid: boolean; error?: string } => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/heic'];
  
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: "Only JPG, PNG, WEBP formats allowed." };
  }
  
  if (file.size > maxSizeMB * 1024 * 1024) {
    return { valid: false, error: `File too large. Max size is ${maxSizeMB}MB.` };
  }

  return { valid: true };
};