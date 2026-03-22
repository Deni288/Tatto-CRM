import { z } from 'zod';

export const bookingRequestSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email({ message: 'Invalid email address' }),
    phone: z.string().min(1, 'Phone number is required'),
    tattooIdea: z.string().min(1, 'Please describe your tattoo idea'),
    referenceLink: z.string().url({ message: 'Invalid URL' }).optional().or(z.literal('')),
    referenceImageUrl: z.string().url().optional(),
    preferredMonth: z.string().min(1, 'Please select a preferred month'),
});

export const bookingRequestStatusSchema = z.object({
    status: z.enum(['APPROVED', 'REJECTED']),
});

export type BookingRequestFormData = z.infer<typeof bookingRequestSchema>;
