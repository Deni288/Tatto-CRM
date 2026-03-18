import { z } from 'zod';

export const clientSchema = z.object({
    firstName: z.string().min(2, 'First name must be at least 2 characters'),
    lastName: z.string().min(1, 'Last name is required'),
    email: z.string().email('Invalid email').optional().or(z.literal('')),
    phone: z.string().optional(),
    tattooHistory: z.string().optional(),
});

export type ClientFormData = z.infer<typeof clientSchema>;
