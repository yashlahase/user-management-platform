import { createUserSchema, updateUserSchema, idParamSchema } from '../validators/user.validator';

describe('Validation Schemas', () => {
  describe('createUserSchema', () => {
    const validUser = {
      name: 'Yash Sharma',
      email: 'yash.sharma@example.com',
      primaryMobile: '9876543210',
      secondaryMobile: '9123456780',
      aadhaar: '123456789012',
      pan: 'ABCDE1234F',
      dateOfBirth: '1995-08-15',
      placeOfBirth: 'Delhi',
      currentAddress: '123 Tech Park, Noida',
      permanentAddress: '456 Residency, Jaipur',
      status: 'ACTIVE',
      remarks: 'Admin user',
    };

    it('should validate successfully for a correct payload', () => {
      const result = createUserSchema.safeParse(validUser);
      expect(result.success).toBe(true);
    });

    it('should fail if required fields are missing', () => {
      const invalidUser = { ...validUser };
      delete (invalidUser as any).name;
      delete (invalidUser as any).email;

      const result = createUserSchema.safeParse(invalidUser);
      expect(result.success).toBe(false);
      if (!result.success) {
        const errors = result.error.errors.map((e) => e.path[0]);
        expect(errors).toContain('name');
        expect(errors).toContain('email');
      }
    });

    it('should fail for an invalid email format', () => {
      const invalidUser = { ...validUser, email: 'yash.sharma' };
      const result = createUserSchema.safeParse(invalidUser);
      expect(result.success).toBe(false);
    });

    it('should fail for an invalid primary mobile number format', () => {
      const invalidUser = { ...validUser, primaryMobile: '5876543210' }; // starts with 5
      const result = createUserSchema.safeParse(invalidUser);
      expect(result.success).toBe(false);
    });

    it('should fail for an invalid Aadhaar format', () => {
      const invalidUser = { ...validUser, aadhaar: '12345678' }; // 8 digits instead of 12
      const result = createUserSchema.safeParse(invalidUser);
      expect(result.success).toBe(false);
    });

    it('should fail for an invalid PAN format', () => {
      const invalidUser = { ...validUser, pan: 'ABCD1234F' }; // 4 letters at start instead of 5
      const result = createUserSchema.safeParse(invalidUser);
      expect(result.success).toBe(false);
    });

    it('should fail if date of birth is in the future', () => {
      const invalidUser = { ...validUser, dateOfBirth: '2050-01-01' };
      const result = createUserSchema.safeParse(invalidUser);
      expect(result.success).toBe(false);
    });
  });

  describe('updateUserSchema', () => {
    it('should require version key', () => {
      const payload = { name: 'New Name' };
      const result = updateUserSchema.safeParse(payload);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].path[0]).toBe('version');
      }
    });

    it('should validate successfully when version is provided', () => {
      const payload = { name: 'New Name', version: 2 };
      const result = updateUserSchema.safeParse(payload);
      expect(result.success).toBe(true);
    });
  });

  describe('idParamSchema', () => {
    it('should validate a correct UUID v4', () => {
      const result = idParamSchema.safeParse({ id: '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d' });
      expect(result.success).toBe(true);
    });

    it('should fail for an invalid UUID format', () => {
      const result = idParamSchema.safeParse({ id: '12345' });
      expect(result.success).toBe(false);
    });
  });
});
