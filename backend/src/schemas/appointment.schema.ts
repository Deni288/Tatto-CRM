import { z } from 'zod';

export const appointmentSchema = z.object({
    clientId: z.string().uuid('Invalid client ID format'),
    title: z.string().min(1, 'Title is required'),
    description: z.string().optional(),
    startTime: z.string().datetime('Start time must be a valid ISO date'),
    endTime: z.string().datetime('End time must be a valid ISO date'),
    price: z.number().optional().nullable(),
    depositAmount: z.number().optional().nullable(),
});

export type AppointmentFormData = z.infer<typeof appointmentSchema>;
