import { z } from 'zod';

export const gallerySchema = z.object({
    imageUrl: z.string().min(1, "Image URL is required"),
    description: z.string().nullable().optional(),
});
