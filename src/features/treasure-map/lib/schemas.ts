import { z } from 'zod';
import { IRAN_CITIES } from '@/features/poster/lib/cities';
import { POSTER_FRAMES } from '@/features/poster/lib/frames';
import { MAP_SCOPES, MAP_SHAPES, MAP_THEMES, MAX_MILESTONES, MIN_MILESTONES } from './map-svg';

const CITY_NAMES = IRAN_CITIES.map((c) => c.name);

export const milestoneSchema = z.object({
  title: z.string().trim().min(1).max(24),
  /** The place's name, as the user wants it on the poster. */
  city: z.string().trim().min(1).max(22),
  date: z.string().trim().max(18),
  /** Where it happened, picked on the map (city maps). */
  lat: z.number().min(-90).max(90).optional(),
  lon: z.number().min(-180).max(180).optional(),
});

export const treasureMapSchema = z
  .object({
    title: z.string().trim().min(1).max(40),
    names: z.string().trim().max(40),
    scope: z.enum(MAP_SCOPES),
    area: z.string().refine((v) => CITY_NAMES.includes(v)),
    theme: z.enum(MAP_THEMES),
    shape: z.enum(MAP_SHAPES),
    frame: z.enum(POSTER_FRAMES),
    milestones: z.array(milestoneSchema).min(MIN_MILESTONES).max(MAX_MILESTONES),
  })
  // every map is drawn around places picked on the map
  .refine((v) => v.milestones.every((m) => m.lat !== undefined && m.lon !== undefined), {
    path: ['milestones'],
  });

export type TreasureMapValues = z.infer<typeof treasureMapSchema>;
