/**
 * Real words from real buyers, shown on the home page. The section stays hidden while this
 * list is empty, so nothing is ever invented.
 *
 * Add one only with the person's written permission (`consent: true` is required by the
 * type on purpose), exactly as they wrote it, with the first name or initials they allow.
 */
export type Testimonial = {
  quote: string;
  /** How the person asked to be named, e.g. "م. از تهران". */
  who: string;
  /** What they made, e.g. "پوستر شب تولد". */
  made?: string;
  consent: true;
};

export const TESTIMONIALS: readonly Testimonial[] = [];
