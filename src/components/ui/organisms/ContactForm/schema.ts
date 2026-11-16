import { z } from '../../../../lib/zod.ts';

import { CONTACT_METHODS, PROJECT_TYPES, SUPPORT_TYPES } from './constants.ts';

const PHONE = /^\+?[0-9\s\-().]{7,20}$/;

/** Run a check whenever there's an object to look at, even if other fields failed. */
const isObject = ({ value }: { value: unknown }) => typeof value === 'object' && value !== null;

/** Shared by the form and the Netlify function, which checks every post against it too. */
export const contactSchema = z
    .object({
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
        phone: z.string().optional().or(z.literal('')),
        projectType: z.enum([...PROJECT_TYPES], {
            error: 'Please choose what it’s about',
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
        /** Hidden from people; only bots fill it in. */
        website: z.string().optional(),
    })
    // These run even when other fields are wrong, so every error shows at once.
    .refine(({ phone, projectType }) => Boolean(phone) || SUPPORT_TYPES.includes(projectType), {
        path: ['phone'],
        message: 'Contact number is required',
        when: isObject,
    })
    .refine(({ phone }) => !phone || PHONE.test(phone), {
        path: ['phone'],
        message: 'Please enter a valid phone number',
        when: isObject,
    });
