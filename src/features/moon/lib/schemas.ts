import { z } from 'zod';
import { POSTER_STYLES } from '@/features/poster/lib/themes';

export const moonPersonalizeSchema = z.object({
  title: z.string().min(1).max(60),
  names: z.string().min(1).max(40),
  quote: z.string().max(100),
  style: z.enum(POSTER_STYLES),
  showDate: z.boolean(),
  showCity: z.boolean(),
  showDetails: z.boolean(),
  showStars: z.boolean(),
});

export type MoonPersonalizeValues = z.infer<typeof moonPersonalizeSchema>;
