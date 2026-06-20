import { describe, it, expect } from 'vitest';
import { userFormSchema } from '../utils/validators';

describe('userFormSchema Zod Validation', () => {
  const validData = {
    name: 'John Doe',
    email: 'john@example.com',
    primaryMobile: '9876543210',
    secondaryMobile: '8765432109',
    aadhaar: '123456789012',
    pan: 'ABCDE1234F',
    dateOfBirth: '1995-05-15',
    placeOfBirth: 'Mumbai',
    currentAddress: '123, MG Road, Mumbai',
    permanentAddress: '123, MG Road, Mumbai',
    status: 'ACTIVE',
    remarks: 'Valid profile',
  };

  it('should pass on valid data', () => {
    const result = userFormSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('should fail if name is too short', () => {
    const invalidData = { ...validData, name: 'A' };
    const result = userFormSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toContain('Name must be at least 2 characters');
    }
  });

  it('should fail on invalid email format', () => {
    const invalidData = { ...validData, email: 'john@invalid' };
    const result = userFormSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toContain('Invalid email address format');
    }
  });

  it('should fail on invalid primary mobile number', () => {
    const invalidData = { ...validData, primaryMobile: '12345' };
    const result = userFormSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toContain('Primary mobile number must be a valid 10-digit number');
    }
  });

  it('should fail on invalid Aadhaar length', () => {
    const invalidData = { ...validData, aadhaar: '1234567890' };
    const result = userFormSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toContain('Aadhaar must be exactly 12 numeric digits');
    }
  });

  it('should fail on invalid PAN format', () => {
    const invalidData = { ...validData, pan: 'ABCD1234F' }; // 9 characters
    const result = userFormSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toContain('Invalid PAN format');
    }
  });

  it('should fail if date of birth is in the future', () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 5);
    const dobString = futureDate.toISOString().split('T')[0];

    const invalidData = { ...validData, dateOfBirth: dobString };
    const result = userFormSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toContain('Date of birth cannot be in the future');
    }
  });
});
