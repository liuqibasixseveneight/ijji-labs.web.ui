import { z } from 'zod';

import { PROJECT_TYPES, CONTACT_METHODS } from './constants.ts';

export const contactSchema = z.object({
    name: z
        .string()
        .min(2, 'Name must be at least 2 characters')
        .max(100, 'Name must be under 100 characters'),
    company: z
        .string()
        .max(100, 'Company name must be under 100 characters')
        .optional()
        .or(z.literal('')),
    email: z.email('Please enter a valid email address').min(1, 'Email is required'),
    phone: z
        .string()
        .min(1, 'Contact number is required')
        .regex(/^\+?[0-9\s\-().]{7,20}$/, {
            message: 'Please enter a valid phone number',
        }),
    projectType: z.enum([...PROJECT_TYPES], {
        error: 'Please select a project type',
    }),
    message: z
        .string()
        .min(10, 'Message must be at least 10 characters')
        .max(2000, 'Message must be under 2000 characters'),
    preferredContact: z
        .enum([...CONTACT_METHODS])
        .optional()
        .or(z.literal('')),
    referral: z
        .string()
        .max(200, 'Please keep this under 200 characters')
        .optional()
        .or(z.literal('')),
});
