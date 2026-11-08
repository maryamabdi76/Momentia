import { z } from 'zod';
import { IRAN_CITIES } from '@/features/poster/lib/cities';
import { MAX_MILESTONES, MIN_MILESTONES } from './map-svg';

const CITY_NAMES = IRAN_CITIES.map((c) => c.name);

export const milestoneSchema = z.object({
  title: z.string().trim().min(1).max(24),
  city: z.string().refine((v) => CITY_NAMES.includes(v)),
  date: z.string().trim().max(18),
});

export const treasureMapSchema = z.object({
  title: z.string().trim().min(1).max(40),
  names: z.string().trim().max(40),
  milestones: z.array(milestoneSchema).min(MIN_MILESTONES).max(MAX_MILESTONES),
});

export type TreasureMapValues = z.infer<typeof treasureMapSchema>;
