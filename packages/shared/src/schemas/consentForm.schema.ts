import { z } from 'zod';

export const consentFormSchema = z.object({
    medicalConditions: z.string().nullable().optional(),
    allergies: z.string().nullable().optional(),
    agreedToTerms: z.boolean().refine((val) => val === true, {
        message: 'You must agree to the terms and conditions.',
    }),
    signatureName: z.string().min(1, 'Signature name is required'),
});

export type ConsentFormData = z.infer<typeof consentFormSchema>;
