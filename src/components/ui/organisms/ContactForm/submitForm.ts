import { postForm } from '../../../../lib/postForm.ts';
import type { ContactFormData } from './types.ts';

export const submitForm = (data: ContactFormData) => postForm('contact', data);
