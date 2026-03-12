import { z } from 'zod';

export const gallerySchema = z.object({
    imageUrl: z.string().url("Must be a valid URL"),
    description: z.string().nullable().optional(),
});
