import { z } from 'zod';

export const appointmentSchema = z.object({
    clientId: z.string().uuid({ message: 'Please select a client' }),
    title: z.string().min(1, 'Title is required'),
    description: z.string().optional(),
    startTime: z.string().min(1, 'Start time is required'),
    endTime: z.string().min(1, 'End time is required'),
    price: z.number().min(0).nullable().optional().default(0),
    depositAmount: z.number().min(0).nullable().optional().default(0),
    deposit: z.number().min(0).optional().default(0),
});

export type AppointmentFormData = z.infer<typeof appointmentSchema>;
export type AppointmentFormInput = z.input<typeof appointmentSchema>;
