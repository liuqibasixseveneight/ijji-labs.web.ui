import { z } from '../../../../lib/zod.ts';

import { contactSchema } from './schema.ts';

export type ContactFormData = z.infer<typeof contactSchema>;

export type { SubmitResult } from '../../../../lib/postForm.ts';
