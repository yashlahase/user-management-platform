import { z } from 'zod';

const mobileRegex = /^[6-9]\d{9}$/;
const aadhaarRegex = /^\d{12}$/;
const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;

export const userFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must not exceed 100 characters'),
  email: z
    .string()
    .trim()
    .email('Invalid email address format')
    .max(150, 'Email must not exceed 150 characters'),
  primaryMobile: z
    .string()
    .trim()
    .regex(mobileRegex, 'Primary mobile number must be a valid 10-digit number starting with 6-9'),
  secondaryMobile: z
    .string()
    .trim()
    .regex(mobileRegex, 'Secondary mobile number must be a valid 10-digit number starting with 6-9')
    .optional()
    .nullable()
    .or(z.literal('')),
  aadhaar: z
    .string()
    .trim()
    .regex(aadhaarRegex, 'Aadhaar must be exactly 12 numeric digits'),
  pan: z
    .string()
    .trim()
    .toUpperCase()
    .regex(panRegex, 'Invalid PAN format (must be 5 letters, 4 digits, 1 letter, e.g., ABCDE1234F)'),
  dateOfBirth: z
    .string()
    .min(1, 'Date of birth is required')
    .refine((val) => {
      const dob = new Date(val);
      return dob <= new Date();
    }, 'Date of birth cannot be in the future'),
  placeOfBirth: z
    .string()
    .trim()
    .min(2, 'Place of birth is required')
    .max(100, 'Place of birth must not exceed 100 characters'),
  currentAddress: z
    .string()
    .trim()
    .min(5, 'Current address must be at least 5 characters'),
  permanentAddress: z
    .string()
    .trim()
    .min(5, 'Permanent address must be at least 5 characters'),
  status: z.enum(['ACTIVE', 'INACTIVE']).default('ACTIVE'),
  remarks: z
    .string()
    .trim()
    .max(500, 'Remarks must not exceed 500 characters')
    .optional()
    .nullable()
    .or(z.literal('')),
});

export type UserFormData = z.infer<typeof userFormSchema>;
export type UserUpdateFormData = UserFormData & { version: number };
