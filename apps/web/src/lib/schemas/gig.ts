import * as z from 'zod';

export const gigSchema = z.object({
    title: z.string().min(5, 'Title must be at least 5 characters').max(100),
    description: z.string().min(20, 'Description must be at least 20 characters'),
    category: z.string().min(2, 'Category is required'),
    location: z.string().min(2, 'Location is required'),
    pay_amount: z.coerce.number().min(10, 'Minimum pay is $10'),
    scheduled_at: z.string().min(1, 'Date and time are required'),
});

export type GigFormValues = z.infer<typeof gigSchema>;
