import { z } from 'zod';

export const artistIdParamSchema = z.object({
    id: z.string().uuid({ message: 'Invalid artist ID' }),
});
