import { z } from 'zod';

export const appointmentSchema = z.object({
    clientId: z.string().uuid({ message: 'Invalid client ID format' }),
    title: z.string().min(1, 'Title is required'),
    description: z.string().optional(),
    startTime: z.string().datetime('Start time must be a valid ISO date'),
    endTime: z.string().datetime('End time must be a valid ISO date'),
    price: z.coerce.number().min(0).nullable().optional().default(0),
    depositAmount: z.coerce.number().min(0).nullable().optional().default(0),
    deposit: z.coerce.number().min(0).optional().default(0),
});

export type AppointmentFormData = z.infer<typeof appointmentSchema>;
