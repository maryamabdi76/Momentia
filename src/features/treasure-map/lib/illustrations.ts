/**
 * The picture set for the illustrated road map: one small drawing for each kind of moment,
 * on a 100 x 100 sheet. They are drawn in fine ink line with soft colour from the theme, and the
 * map gives them a slight pencil wobble, so they read as hand-drawn and look like one family.
 */
export const MAP_ICONS = [
  'home',
  'cafe',
  'love',
  'ring',
  'cake',
  'mountain',
  'forest',
  'sea',
  'plane',
  'car',
  'camera',
  'baby',
  'dog',
  'music',
  'gift',
  'city',
  'book',
  'star',
  'flag',
  'suitcase',
] as const;
export type MapIcon = (typeof MAP_ICONS)[number];

/** What an illustration needs from the theme. */
export type IconPalette = { ink: string; card: string; accent: string; land: string; water: string; park: string };

type Draw = (p: IconPalette, s: string) => string;

const f = (color: string, opacity = 1) => `fill="${color}"${opacity === 1 ? '' : ` fill-opacity="${opacity}"`}`;

const DRAWINGS: Record<MapIcon, Draw> = {
  home: (p, s) =>
    `<rect x="64" y="24" width="9" height="20" ${f(p.land)} ${s}/>` +
    `<path d="M13 52L50 18L87 52Z" ${f(p.accent, 0.9)} ${s}/>` +
    `<rect x="23" y="52" width="54" height="34" ${f(p.card)} ${s}/>` +
    `<rect x="44" y="62" width="13" height="24" ${f(p.accent, 0.5)} ${s}/>` +
    `<rect x="29" y="60" width="10" height="10" ${f(p.water)} ${s}/>` +
    `<rect x="62" y="60" width="10" height="10" ${f(p.water)} ${s}/>`,
  cafe: (p, s) =>
    `<path d="M37 34Q32 26 38 19M49 34Q44 26 50 17M61 34Q56 27 62 21" fill="none" ${s}/>` +
    `<path d="M26 42H68V60Q68 78 47 78Q26 78 26 60Z" ${f(p.card)} ${s}/>` +
    `<path d="M68 49Q84 49 82 60Q80 70 67 68" fill="none" ${s}/>` +
    `<ellipse cx="47" cy="83" rx="28" ry="5" ${f(p.land)} ${s}/>` +
    `<path d="M47 66C38 59 38 52 43 51C45 50.5 47 52 47 54C47 52 49 50.5 51 51C56 52 56 59 47 66Z" ${f(p.accent)}/>`,
  love: (p, s) => `<path d="M50 84C18 60 14 36 31 28C40 24 47 29 50 36C53 29 60 24 69 28C86 36 82 60 50 84Z" ${f(p.accent, 0.9)} ${s}/>` +
    `<path d="M31 38Q34 33 40 34" fill="none" stroke="${p.card}" stroke-width="3" stroke-linecap="round"/>`,
  ring: (p, s) =>
    `<circle cx="50" cy="62" r="23" fill="none" ${s}/><circle cx="50" cy="62" r="16" fill="none" ${s}/>` +
    `<path d="M50 20L61 31L50 43L39 31Z" ${f(p.water)} ${s}/><path d="M39 31H61M50 20V43" fill="none" ${s}/>` +
    `<path d="M24 28L28 33M76 28L72 33M50 10V14" fill="none" stroke="${p.accent}" stroke-width="3" stroke-linecap="round"/>`,
  cake: (p, s) =>
    `<rect x="48" y="26" width="5" height="16" ${f(p.water)} ${s}/>` +
    `<path d="M50 14Q55 21 50 26Q45 21 50 14Z" ${f(p.accent)} ${s}/>` +
    `<rect x="32" y="42" width="38" height="16" ${f(p.accent, 0.55)} ${s}/>` +
    `<rect x="20" y="58" width="62" height="26" ${f(p.land)} ${s}/>` +
    `<path d="M20 58Q28 68 36 58T52 58T68 58T82 58" fill="none" ${s}/>` +
    `<path d="M20 84H82" fill="none" ${s}/>`,
  mountain: (p, s) =>
    `<circle cx="76" cy="26" r="9" ${f(p.accent, 0.75)} ${s}/>` +
    `<path d="M7 82L38 28L60 64L72 46L94 82Z" ${f(p.land)} ${s}/>` +
    `<path d="M38 28L29 44L38 40L46 46Z" ${f(p.card)} ${s}/>` +
    `<path d="M20 76L30 76M60 76L70 76" fill="none" stroke="${p.ink}" stroke-opacity="0.4" stroke-width="2" stroke-linecap="round"/>`,
  forest: (p, s) =>
    `<rect x="27" y="74" width="6" height="12" ${f(p.land)} ${s}/><rect x="63" y="78" width="6" height="9" ${f(p.land)} ${s}/>` +
    `<path d="M30 14L15 44H45ZM30 32L11 66H49ZM30 52L7 80H53Z" ${f(p.park)} ${s}/>` +
    `<path d="M66 38L53 60H79ZM66 52L49 74H83Z" ${f(p.park)} ${s}/>`,
  sea: (p, s) =>
    `<circle cx="28" cy="34" r="11" ${f(p.accent, 0.75)} ${s}/>` +
    `<path d="M64 31V58M64 33L80 55H64Z" ${f(p.card)} ${s}/>` +
    `<path d="M46 58H82L75 68H53Z" ${f(p.land)} ${s}/>` +
    `<path d="M8 66Q20 58 32 66T56 66T80 66T92 66V88H8Z" ${f(p.water)} ${s}/>` +
    `<path d="M8 77Q20 70 32 77T56 77T80 77T92 77" fill="none" ${s}/>`,
  plane: (p, s) =>
    `<path d="M11 46L89 15L65 85L48 58Z" ${f(p.card)} ${s}/>` +
    `<path d="M89 15L48 58L46 79L60 66" fill="none" ${s}/>` +
    `<path d="M11 46L48 58" fill="none" ${s}/>` +
    `<path d="M14 80Q22 72 30 78T46 84" fill="none" stroke="${p.accent}" stroke-width="3" stroke-dasharray="1 7" stroke-linecap="round"/>`,
  car: (p, s) =>
    `<path d="M24 50L35 31H65L77 50Z" ${f(p.water)} ${s}/>` +
    `<rect x="9" y="49" width="82" height="25" rx="9" ${f(p.accent, 0.9)} ${s}/>` +
    `<path d="M50 31V50" fill="none" ${s}/>` +
    `<circle cx="30" cy="75" r="9" ${f(p.ink)}/><circle cx="70" cy="75" r="9" ${f(p.ink)}/>` +
    `<circle cx="30" cy="75" r="3.5" ${f(p.card)}/><circle cx="70" cy="75" r="3.5" ${f(p.card)}/>` +
    `<rect x="82" y="55" width="6" height="6" rx="2" ${f(p.card)}/>`,
  camera: (p, s) =>
    `<path d="M33 34L39 24H61L67 34" ${f(p.land)} ${s}/>` +
    `<rect x="13" y="34" width="74" height="48" rx="9" ${f(p.land)} ${s}/>` +
    `<circle cx="50" cy="58" r="17" ${f(p.water)} ${s}/><circle cx="50" cy="58" r="8" ${f(p.card)} ${s}/>` +
    `<rect x="71" y="40" width="9" height="5" rx="2" ${f(p.accent)}/>`,
  baby: (p, s) =>
    `<path d="M43 28Q50 18 57 28" fill="none" ${s}/>` +
    `<circle cx="50" cy="54" r="27" ${f(p.card)} ${s}/>` +
    `<circle cx="39" cy="52" r="3" ${f(p.ink)}/><circle cx="61" cy="52" r="3" ${f(p.ink)}/>` +
    `<circle cx="33" cy="62" r="5" ${f(p.accent, 0.35)}/><circle cx="67" cy="62" r="5" ${f(p.accent, 0.35)}/>` +
    `<path d="M43 64Q50 71 57 64" fill="none" ${s}/>`,
  dog: (p, s) =>
    `<path d="M29 38Q13 40 16 66Q30 66 34 50Z" ${f(p.accent, 0.55)} ${s}/>` +
    `<path d="M71 38Q87 40 84 66Q70 66 66 50Z" ${f(p.accent, 0.55)} ${s}/>` +
    `<circle cx="50" cy="55" r="25" ${f(p.land)} ${s}/>` +
    `<circle cx="40" cy="50" r="3" ${f(p.ink)}/><circle cx="60" cy="50" r="3" ${f(p.ink)}/>` +
    `<ellipse cx="50" cy="61" rx="6" ry="4" ${f(p.ink)}/>` +
    `<path d="M50 65V69M50 69Q44 76 39 71M50 69Q56 76 61 71" fill="none" ${s}/>`,
  music: (p, s) =>
    `<path d="M38 70V27L74 18V60" fill="none" ${s}/>` +
    `<path d="M38 27L74 18V31L38 40Z" ${f(p.ink)}/>` +
    `<ellipse cx="30" cy="71" rx="10" ry="8" ${f(p.accent)} ${s}/><ellipse cx="66" cy="62" rx="10" ry="8" ${f(p.accent)} ${s}/>`,
  gift: (p, s) =>
    `<path d="M50 33Q36 12 33 26Q33 35 50 33ZM50 33Q64 12 67 26Q67 35 50 33Z" ${f(p.card)} ${s}/>` +
    `<rect x="20" y="45" width="60" height="40" ${f(p.accent, 0.7)} ${s}/>` +
    `<rect x="15" y="33" width="70" height="14" ${f(p.accent)} ${s}/>` +
    `<rect x="45" y="33" width="10" height="52" ${f(p.card)} ${s}/>`,
  city: (p, s) =>
    `<path d="M62 40V22" fill="none" ${s}/>` +
    `<rect x="13" y="46" width="19" height="38" ${f(p.land)} ${s}/><rect x="34" y="28" width="21" height="56" ${f(p.card)} ${s}/>` +
    `<rect x="57" y="40" width="17" height="44" ${f(p.water)} ${s}/><rect x="76" y="54" width="13" height="30" ${f(p.land)} ${s}/>` +
    `<path d="M40 38H48M40 48H48M40 58H48M40 68H48M19 56H26M19 66H26M62 50H69M62 60H69" fill="none" stroke="${p.ink}" stroke-opacity="0.55" stroke-width="2.2" stroke-linecap="round"/>` +
    `<path d="M6 84H94" fill="none" ${s}/>`,
  book: (p, s) =>
    `<path d="M50 30Q32 21 12 28V77Q32 70 50 79Z" ${f(p.card)} ${s}/>` +
    `<path d="M50 30Q68 21 88 28V77Q68 70 50 79Z" ${f(p.card)} ${s}/>` +
    `<path d="M20 40Q33 36 43 41M20 50Q33 46 43 51M57 41Q67 36 80 40M57 51Q67 46 80 50" fill="none" stroke="${p.ink}" stroke-opacity="0.5" stroke-width="2.2" stroke-linecap="round"/>` +
    `<path d="M70 70V86L75 81L80 86V68" ${f(p.accent)} ${s}/>`,
  star: (p, s) =>
    `<path d="M50 12L61 38L89 40L67 58L74 86L50 71L26 86L33 58L11 40L39 38Z" ${f(p.accent, 0.85)} ${s}/>` +
    `<path d="M20 18L24 24M82 16L78 22" fill="none" stroke="${p.accent}" stroke-width="3" stroke-linecap="round"/>`,
  flag: (p, s) =>
    `<ellipse cx="29" cy="87" rx="17" ry="4" ${f(p.land)} ${s}/>` +
    `<path d="M29 86V16" fill="none" ${s}/>` +
    `<path d="M29 20Q46 12 58 21T88 22V52Q72 60 58 50T29 54Z" ${f(p.accent, 0.9)} ${s}/>`,
  suitcase: (p, s) =>
    `<path d="M38 36V28Q38 21 45 21H55Q62 21 62 28V36" fill="none" ${s}/>` +
    `<rect x="14" y="36" width="72" height="48" rx="9" ${f(p.water)} ${s}/>` +
    `<path d="M32 36V84M68 36V84" fill="none" ${s}/>` +
    `<rect x="44" y="55" width="12" height="9" rx="2" ${f(p.accent)} ${s}/>`,
};

/** One picture, drawn on a 100 x 100 sheet. */
export function iconMarkup(icon: MapIcon, p: IconPalette): string {
  const s = `stroke="${p.ink}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"`;
  return DRAWINGS[icon](p, s);
}
