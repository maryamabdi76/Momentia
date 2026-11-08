import { z } from 'zod';
import { IRAN_CITIES } from '@/features/poster/lib/cities';
import { MAP_SCOPES, MAP_THEMES, MAX_MILESTONES, MIN_MILESTONES } from './map-svg';

const CITY_NAMES = IRAN_CITIES.map((c) => c.name);

export const milestoneSchema = z.object({
  title: z.string().trim().min(1).max(24),
  /** An Iranian city on an Iran map; a place name on a city map. */
  city: z.string().trim().min(1).max(22),
  date: z.string().trim().max(18),
});

export const treasureMapSchema = z
  .object({
    title: z.string().trim().min(1).max(40),
    names: z.string().trim().max(40),
    scope: z.enum(MAP_SCOPES).default('city'),
    area: z.string().refine((v) => CITY_NAMES.includes(v)).default('تهران'),
    theme: z.enum(MAP_THEMES).default('paper'),
    milestones: z.array(milestoneSchema).min(MIN_MILESTONES).max(MAX_MILESTONES),
  })
  .refine((v) => v.scope === 'city' || v.milestones.every((m) => CITY_NAMES.includes(m.city)), {
    path: ['milestones'],
  });

export type TreasureMapValues = z.infer<typeof treasureMapSchema>;
