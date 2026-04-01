import { z } from 'zod';

import { contactSchema } from './schema.ts';

export type ContactFormData = z.infer<typeof contactSchema>;

export type SubmitResult = { success: true } | { success: false; error: string };
