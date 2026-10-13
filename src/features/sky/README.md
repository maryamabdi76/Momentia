# sky

Computes and draws the sky for a place and a moment. No dependencies, no network.

```
features/poster/lib/moment.ts   form (Jalali date, city, time) → one real instant + lat/lon
features/sky/lib/compute.ts     computeSky() → stars, constellation lines, Moon, planets (chart coordinates)
features/sky/components/SkyChart.tsx   draws that as SVG
```

## How it works

1. **Instant.** Jalali → Gregorian, then local wall-clock time in the city's IANA zone → UTC
   (uses the browser tz database, so Iran's pre-2022 daylight saving is handled).
   A daytime time is moved to that evening (Sun 12° below the horizon).
2. **Positions.** Catalog stars (J2000) are precessed to the date and rotated into the observer's
   horizon frame using local sidereal time. Sun, Moon and planets come from `lib/ephemeris.ts`.
3. **Projection.** Stereographic: zenith in the centre, horizon on the unit circle, north up,
   east on the **left**. Constellation lines are clipped where they cross the horizon.
4. **Moon.** Phase from the Sun–Moon geometry; the bright limb is oriented in chart space; altitude
   includes lunar parallax (up to ~1°).

## Accuracy

| Object | Source | Typical error |
| --- | --- | --- |
| Stars | XHIP via d3-celestial, precessed | < 0.01° (no proper motion, nutation or refraction) |
| Sun | Meeus ch. 25 | ≈ 0.01° |
| Moon | Meeus ch. 47, truncated | ≈ 0.01° |
| Planets | JPL approximate Keplerian elements (1800–2050) | up to ≈ 0.3° (Jupiter) |

That is invisible on a poster (1° ≈ 5 px on a 1000 px chart). Tests in `__tests__/` pin the
ephemeris to Meeus's worked examples and to real events (2024 lunar quarters, the 2020
Jupiter–Saturn conjunction, Mars/Saturn/Jupiter oppositions, planetary elongations).
`ephemeris.ts` is the only file to change if you ever want a heavier library such as
`astronomy-engine`; keep its function signatures and the tests will tell you if it agrees.

## Data

`data/stars.json` (2,851 stars to magnitude 5.5) and `data/constellation-lines.json` (89 figures)
are generated from [d3-celestial](https://github.com/ofrohn/d3-celestial) (BSD-3, built on XHIP).
Regenerate with:

```
git clone --depth 1 https://github.com/ofrohn/d3-celestial /tmp/d3-celestial
pnpm build:sky-data /tmp/d3-celestial/data
```

See `data/NOTICE.txt` for attribution — keep it with the data.

## Tests

`pnpm test` (Node ≥ 22 runs the TypeScript files directly; imports inside `lib/` therefore carry
explicit `.ts` extensions).
