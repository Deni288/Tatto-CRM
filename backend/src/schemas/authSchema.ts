import { z } from 'zod';

export const RegisterSchema = z.object({
  name: z.string().min(2, 'Name must have at least 2 characters'),
  email: z.string().email({ message: 'Invalid email format' }),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
});

export const LoginSchema = z.object({
  email: z.string().email({ message: 'Invalid email format' }),
  password: z.string().min(1, 'Password is required'),
});

export type RegisterInput = z.infer<typeof RegisterSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
