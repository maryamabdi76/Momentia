import { z } from 'zod';
import { JALALI_MONTHS, JALALI_DAYS, JALALI_YEARS } from './calendar';

export const momentSchema = z.object({
  city: z.string().min(1),
  timezone: z.string().min(1),
  day: z.enum(JALALI_DAYS as [string, ...string[]]),
  month: z.enum(JALALI_MONTHS),
  year: z.enum(JALALI_YEARS as [string, ...string[]]),
  time: z.string().regex(/^[۰-۹0-9]{1,2}:[۰-۹0-9]{2}$/).or(z.literal('')),
  noExactTime: z.boolean(),
});

export const personalizeSchema = z.object({
  title: z.string().min(1).max(60),
  names: z.string().min(1).max(40),
  quote: z.string().max(100),
  style: z.enum(['gold', 'mono']),
  showDate: z.boolean(),
  showCity: z.boolean(),
  layers: z.object({
    constellationLines: z.boolean(),
    moonAndPlanets: z.boolean(),
    planetNames: z.boolean(),
    ecliptic: z.boolean(),
    equator: z.boolean(),
    maxMagnitude: z.number().min(2).max(6),
  }),
});

export type MomentValues = z.infer<typeof momentSchema>;
export type PersonalizeValues = z.infer<typeof personalizeSchema>;
