import { z } from 'zod';
import { UserStatus } from '@prisma/client';

const mobileRegex = /^[6-9]\d{9}$/;
const aadhaarRegex = /^\d{12}$/;
const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;

export const createUserSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must not exceed 100 characters'),
  email: z
    .string()
    .trim()
    .email('Invalid email format')
    .max(150, 'Email must not exceed 150 characters'),
  primaryMobile: z
    .string()
    .trim()
    .regex(mobileRegex, 'Primary mobile number must be a valid 10-digit number'),
  secondaryMobile: z
    .string()
    .trim()
    .regex(mobileRegex, 'Secondary mobile number must be a valid 10-digit number')
    .optional()
    .nullable()
    .or(z.literal('')),
  aadhaar: z
    .string()
    .trim()
    .regex(aadhaarRegex, 'Aadhaar must be exactly 12 digits'),
  pan: z
    .string()
    .trim()
    .toUpperCase()
    .regex(panRegex, 'Invalid PAN format (must be 5 letters, 4 digits, 1 letter, e.g. ABCDE1234F)'),
  dateOfBirth: z.preprocess(
    (val) => (typeof val === 'string' ? new Date(val) : val),
    z
      .date({
        required_error: 'Date of birth is required',
        invalid_type_error: 'Invalid date of birth format',
      })
      .max(new Date(), 'Date of birth cannot be in the future')
  ),
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
  status: z.nativeEnum(UserStatus).default(UserStatus.ACTIVE),
  remarks: z
    .string()
    .trim()
    .max(500, 'Remarks must not exceed 500 characters')
    .optional()
    .nullable()
    .or(z.literal('')),
});

export const updateUserSchema = createUserSchema.partial().extend({
  version: z.number({ required_error: 'User current version is required for optimistic concurrency checks' }),
});

export const listUsersSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  search: z.string().trim().optional(),
  sortBy: z.enum(['name', 'email', 'createdAt', 'status']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  status: z.nativeEnum(UserStatus).optional(),
  isDeleted: z
    .string()
    .toLowerCase()
    .transform((val) => val === 'true')
    .optional()
    .default('false'),
});

export const idParamSchema = z.object({
  id: z.string().uuid('Invalid user ID (must be a valid UUID)'),
});
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type ListUsersQuery = z.infer<typeof listUsersSchema>;
