/**
 * The simple picture set for the illustrated road map: flat, bright icons, one for each kind of
 * moment, on a 100 x 100 sheet. They use their own fixed colours (not the theme's), so they stay
 * cheerful on every theme, and they sit in the same groups as the watercolour pictures.
 */
export const MAP_ICONS = [
  // love
  'love', 'ring', 'rose', 'letter',
  // road trips and first cars
  'car', 'van',
  // travel and adventure
  'plane', 'suitcase', 'globe', 'map', 'mountain', 'sea', 'forest', 'tent', 'city', 'flag',
  // cycling
  'bicycle',
  // cozy days at home
  'home', 'mug', 'candle',
  // reading and learning
  'book', 'cap',
  // remote work
  'laptop',
  // music and gaming
  'music', 'headphones', 'gamepad', 'guitar',
  // film and creative projects
  'camera', 'clapper', 'popcorn',
  // shopping
  'bag', 'gift',
  // anniversaries and celebrations
  'cake', 'balloon', 'party', 'champagne', 'star',
  // baby
  'baby', 'bottle', 'pacifier',
  // childhood
  'teddy', 'kite',
  // sports
  'trophy', 'ball', 'medal',
  // painting and hobbies
  'palette', 'brush',
  // first plant
  'sprout', 'cactus', 'flower',
  // breakfast and coffee
  'cafe', 'croissant', 'donut',
  // pets
  'dog', 'cat', 'paw',
] as const;
export type MapIcon = (typeof MAP_ICONS)[number];

/** The icons by theme, in the order the picker shows them; the ids match the watercolour groups. */
export const ICON_GROUPS: ReadonlyArray<{ id: string; icons: readonly MapIcon[] }> = [
  { id: 'love', icons: ['love', 'ring', 'rose', 'letter'] },
  { id: 'roadtrip', icons: ['car', 'van'] },
  { id: 'travel', icons: ['plane', 'suitcase', 'globe', 'map', 'mountain', 'sea', 'forest', 'tent', 'city', 'flag'] },
  { id: 'cycling', icons: ['bicycle'] },
  { id: 'cozy', icons: ['home', 'mug', 'candle'] },
  { id: 'reading', icons: ['book', 'cap'] },
  { id: 'remote', icons: ['laptop'] },
  { id: 'music', icons: ['music', 'headphones', 'gamepad', 'guitar'] },
  { id: 'creative', icons: ['camera', 'clapper', 'popcorn'] },
  { id: 'shopping', icons: ['bag', 'gift'] },
  { id: 'celebrate', icons: ['cake', 'balloon', 'party', 'champagne', 'star'] },
  { id: 'baby', icons: ['baby', 'bottle', 'pacifier'] },
  { id: 'childhood', icons: ['teddy', 'kite'] },
  { id: 'sports', icons: ['trophy', 'ball', 'medal'] },
  { id: 'painting', icons: ['palette', 'brush'] },
  { id: 'plant', icons: ['sprout', 'cactus', 'flower'] },
  { id: 'breakfast', icons: ['cafe', 'croissant', 'donut'] },
  { id: 'pets', icons: ['dog', 'cat', 'paw'] },
];

/** What an illustration may take from the theme; the icons keep their own colours and ignore it. */
export type IconPalette = { ink: string; card: string; accent: string; land: string; water: string; park: string };

// the shared colours: bright and warm, with a deep violet for small dark details
const C = {
  red: '#F0605D',
  orange: '#FF9F43',
  yellow: '#FFC93C',
  green: '#3DBE8B',
  teal: '#27B3C4',
  blue: '#4C8DF6',
  violet: '#8B6CEF',
  pink: '#FF7EB6',
  brown: '#B5703F',
  cream: '#FFF1D6',
  white: '#FFFFFF',
  dark: '#2F2A4A',
  grey: '#C9CFE0',
} as const;

const line = (color: string, w: number) => `fill="none" stroke="${color}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"`;
const dot = (x: number, y: number, r: number, fill: string) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}"/>`;

const DRAWINGS: Record<MapIcon, string> = {
  love:
    `<path d="M50 86C14 62 10 34 29 25C40 20 48 26 50 34C52 26 60 20 71 25C90 34 86 62 50 86Z" fill="${C.red}"/>` +
    `<path d="M26 38Q28 31 36 31" ${line(C.white, 4)} stroke-opacity="0.7"/>`,
  ring:
    `<circle cx="50" cy="64" r="22" ${line(C.yellow, 9)}/>` +
    `<path d="M50 16L63 30L50 46L37 30Z" fill="${C.blue}"/><path d="M37 30H63L50 46Z" fill="${C.teal}"/>` +
    `<path d="M20 22L26 28M80 22L74 28M50 6V11" ${line(C.orange, 3.5)}/>`,
  rose:
    `<path d="M50 56V92" ${line(C.green, 5)}/><path d="M50 78Q32 76 28 62Q44 62 50 76Z" fill="${C.green}"/>` +
    `<circle cx="50" cy="34" r="24" fill="${C.red}"/>` +
    `<path d="M50 34Q56 28 50 24Q42 24 40 34Q40 46 52 46Q64 44 64 32" ${line('#B8333A', 3.5)}/>`,
  letter:
    `<rect x="12" y="26" width="76" height="52" rx="8" fill="#FFE0A8"/>` +
    `<path d="M14 32L50 58L86 32" ${line(C.orange, 4)}/>` +
    `<path d="M50 70C38 62 38 52 44 50C47 49 50 51 50 54C50 51 53 49 56 50C62 52 62 62 50 70Z" fill="${C.red}"/>`,
  car:
    `<path d="M10 62Q10 50 22 48L32 32Q35 28 40 28H62Q67 28 70 32L78 48Q90 50 90 62V70H10Z" fill="${C.red}"/>` +
    `<path d="M37 34H48V48H30ZM53 34H63L72 48H53Z" fill="${C.cream}"/>` +
    `${dot(28, 72, 10, C.dark)}${dot(72, 72, 10, C.dark)}${dot(28, 72, 4, C.grey)}${dot(72, 72, 4, C.grey)}`,
  van:
    `<path d="M8 66V38Q8 28 18 28H68Q76 28 82 40L92 56V66Z" fill="${C.teal}"/>` +
    `<path d="M8 50H92V58H8Z" fill="${C.white}" fill-opacity="0.85"/>` +
    `<path d="M16 34H34V46H16ZM40 34H60V46H40ZM66 34H72Q76 34 78 38L82 46H66Z" fill="${C.cream}"/>` +
    `${dot(28, 70, 9, C.dark)}${dot(72, 70, 9, C.dark)}${dot(28, 70, 3.5, C.grey)}${dot(72, 70, 3.5, C.grey)}`,
  plane:
    `<path d="M10 48L90 14L68 86L48 60Z" fill="${C.teal}"/><path d="M10 48L48 60L90 14Z" fill="${C.blue}"/>` +
    `<path d="M48 60L52 80L60 70Z" fill="${C.violet}"/>`,
  suitcase:
    `<path d="M36 30V22Q36 16 42 16H58Q64 16 64 22V30" ${line(C.dark, 5)}/>` +
    `<rect x="12" y="30" width="76" height="52" rx="10" fill="${C.orange}"/>` +
    `<rect x="28" y="30" width="8" height="52" fill="${C.brown}"/><rect x="64" y="30" width="8" height="52" fill="${C.brown}"/>` +
    `<rect x="44" y="50" width="12" height="10" rx="3" fill="${C.yellow}"/>`,
  globe:
    `<circle cx="50" cy="50" r="36" fill="${C.blue}"/>` +
    `<path d="M30 28Q42 22 48 32Q44 42 34 40Q26 38 30 28ZM56 52Q70 46 76 58Q72 72 60 74Q54 64 56 52Z" fill="${C.green}"/>` +
    `<path d="M14 50H86M50 14Q28 50 50 86M50 14Q72 50 50 86" ${line(C.white, 2.5)} stroke-opacity="0.55"/>`,
  map:
    `<path d="M10 24L36 16V78L10 86ZM36 16L64 24V86L36 78ZM64 24L90 16V78L64 86Z" fill="${C.cream}"/>` +
    `<path d="M36 16L64 24V86L36 78Z" fill="${C.green}" fill-opacity="0.35"/>` +
    `<path d="M20 66Q34 40 48 56T78 34" ${line(C.red, 3.5)} stroke-dasharray="1 7"/>` +
    `<path d="M80 22C72 22 70 30 80 38C90 30 88 22 80 22Z" fill="${C.red}"/>${dot(80, 27, 2.6, C.white)}`,
  mountain:
    `${dot(76, 24, 11, C.yellow)}<path d="M4 84L36 30L68 84Z" fill="${C.blue}"/><path d="M38 84L66 40L96 84Z" fill="${C.green}"/>` +
    `<path d="M36 30L26 47L32 44L36 49L41 44L46 47Z" fill="${C.white}"/>`,
  sea:
    `${dot(70, 28, 13, C.yellow)}<path d="M28 20L28 52L50 52Z" fill="${C.red}"/><path d="M26 54H58L52 62H32Z" fill="${C.brown}"/>` +
    `<path d="M0 62Q12 54 25 62T50 62T75 62T100 62V100H0Z" fill="${C.blue}"/>` +
    `<path d="M0 78Q12 70 25 78T50 78T75 78T100 78V100H0Z" fill="${C.teal}"/>`,
  forest:
    `<rect x="26" y="68" width="8" height="18" fill="${C.brown}"/><rect x="66" y="72" width="8" height="14" fill="${C.brown}"/>` +
    `<path d="M30 14L52 44H8Z" fill="${C.green}"/><path d="M30 34L56 68H4Z" fill="#2E9E73"/>` +
    `<path d="M70 28L92 56H48Z" fill="#2E9E73"/><path d="M70 44L96 74H44Z" fill="${C.green}"/>`,
  tent:
    `<path d="M4 84H96" ${line(C.green, 6)}/><path d="M50 18L90 82H10Z" fill="${C.orange}"/>` +
    `<path d="M50 18L50 82H10Z" fill="${C.red}" fill-opacity="0.45"/><path d="M50 50L64 82H36Z" fill="${C.dark}"/>` +
    `<path d="M50 18V10" ${line(C.dark, 4)}/>`,
  city:
    `<rect x="10" y="40" width="24" height="46" rx="3" fill="${C.violet}"/><rect x="36" y="18" width="28" height="68" rx="3" fill="${C.blue}"/>` +
    `<rect x="66" y="46" width="24" height="40" rx="3" fill="${C.teal}"/>` +
    `<path d="M16 48H28M16 58H28M16 68H28M42 26H58M42 38H58M42 50H58M42 62H58M72 54H84M72 64H84" ${line(C.yellow, 4)}/>`,
  flag:
    `<path d="M26 12V88" ${line(C.dark, 5)}/><path d="M28 14Q46 6 58 14T88 14V50Q74 58 58 50T28 50Z" fill="${C.red}"/>` +
    `<ellipse cx="26" cy="88" rx="14" ry="4" fill="${C.grey}"/>`,
  bicycle:
    `<circle cx="24" cy="64" r="18" ${line(C.dark, 5)}/><circle cx="76" cy="64" r="18" ${line(C.dark, 5)}/>` +
    `<path d="M24 64L40 36H64L76 64M40 36L52 64H24M52 64L64 36" ${line(C.red, 5)}/>` +
    `<path d="M34 30H46M62 30L68 24H78" ${line(C.dark, 5)}/>${dot(52, 64, 4, C.yellow)}`,
  home:
    `<rect x="64" y="20" width="9" height="22" fill="${C.brown}"/><path d="M10 52L50 14L90 52Z" fill="${C.red}"/>` +
    `<rect x="20" y="50" width="60" height="38" fill="${C.cream}"/><rect x="43" y="62" width="14" height="26" rx="3" fill="${C.blue}"/>` +
    `<rect x="26" y="58" width="12" height="12" rx="2" fill="${C.yellow}"/><rect x="62" y="58" width="12" height="12" rx="2" fill="${C.yellow}"/>`,
  mug:
    `<path d="M34 28Q28 20 34 12M48 28Q42 20 48 12M62 28Q56 20 62 12" ${line(C.grey, 4)}/>` +
    `<path d="M20 36H72V62Q72 86 46 86Q20 86 20 62Z" fill="${C.violet}"/><path d="M72 44Q92 44 88 60Q84 72 70 70" ${line(C.violet, 7)}/>` +
    `<path d="M46 72C36 65 36 56 42 55C44 54.5 46 56 46 58C46 56 48 54.5 50 55C56 56 56 65 46 72Z" fill="${C.pink}"/>`,
  candle:
    `<path d="M50 8C40 20 40 28 50 32C60 28 60 20 50 8Z" fill="${C.orange}"/><path d="M50 18C46 24 46 27 50 29C54 27 54 24 50 18Z" fill="${C.yellow}"/>` +
    `<rect x="36" y="34" width="28" height="42" rx="4" fill="${C.cream}"/><path d="M36 44Q42 54 50 44Q58 54 64 44V38H36Z" fill="${C.white}"/>` +
    `<ellipse cx="50" cy="80" rx="28" ry="7" fill="${C.blue}"/>`,
  book:
    `<path d="M8 24Q30 16 50 28V84Q30 72 8 80Z" fill="${C.teal}"/><path d="M92 24Q70 16 50 28V84Q70 72 92 80Z" fill="${C.blue}"/>` +
    `<path d="M14 30Q30 26 44 34M14 44Q30 40 44 48M14 58Q30 54 44 62M56 34Q70 26 86 30M56 48Q70 40 86 44M56 62Q70 54 86 58" ${line(C.white, 3)} stroke-opacity="0.8"/>` +
    `<path d="M62 28V50L68 45L74 50V24Z" fill="${C.yellow}"/>`,
  cap:
    `<path d="M50 20L96 40L50 60L4 40Z" fill="${C.dark}"/><path d="M24 52V70Q50 86 76 70V52L50 64Z" fill="${C.violet}"/>` +
    `<path d="M88 44V68" ${line(C.yellow, 3.5)}/>${dot(88, 72, 5, C.yellow)}`,
  laptop:
    `<rect x="18" y="20" width="64" height="44" rx="6" fill="${C.dark}"/><rect x="23" y="25" width="54" height="34" rx="3" fill="${C.blue}"/>` +
    `<path d="M30 34H52M30 42H64M30 50H46" ${line(C.white, 3.5)} stroke-opacity="0.85"/>` +
    `<path d="M6 70H94L88 80Q87 82 84 82H16Q13 82 12 80Z" fill="${C.grey}"/>`,
  music:
    `<path d="M36 70V24L78 14V60" ${line(C.dark, 5)}/><path d="M36 24L78 14V32L36 42Z" fill="${C.violet}"/>` +
    `<ellipse cx="28" cy="72" rx="12" ry="9" fill="${C.pink}"/><ellipse cx="70" cy="62" rx="12" ry="9" fill="${C.pink}"/>`,
  headphones:
    `<path d="M16 62V50Q16 16 50 16T84 50V62" ${line(C.violet, 8)}/>` +
    `<rect x="10" y="52" width="20" height="32" rx="9" fill="${C.red}"/><rect x="70" y="52" width="20" height="32" rx="9" fill="${C.red}"/>`,
  gamepad:
    `<path d="M22 28H78Q94 28 94 52Q94 76 80 76Q72 76 66 66H34Q28 76 20 76Q6 76 6 52Q6 28 22 28Z" fill="${C.violet}"/>` +
    `<path d="M28 42V62M18 52H38" ${line(C.white, 6)}/>${dot(70, 44, 6, C.yellow)}${dot(82, 54, 6, C.red)}${dot(70, 58, 6, C.teal)}`,
  guitar:
    `<path d="M62 40L90 12" ${line(C.brown, 7)}/><path d="M84 6L96 18L88 22L80 14Z" fill="${C.dark}"/>` +
    `<path d="M26 56Q26 40 44 42Q52 36 62 44Q70 54 58 62Q58 76 40 84Q14 90 14 68Q14 62 26 56Z" fill="${C.orange}"/>` +
    `${dot(40, 62, 8, C.dark)}`,
  camera:
    `<path d="M34 28L40 18H60L66 28Z" fill="${C.dark}"/><rect x="8" y="28" width="84" height="56" rx="10" fill="${C.violet}"/>` +
    `<circle cx="50" cy="56" r="22" fill="${C.white}"/><circle cx="50" cy="56" r="14" fill="${C.blue}"/>${dot(45, 51, 4, C.white)}` +
    `${dot(78, 40, 4, C.yellow)}`,
  clapper:
    `<rect x="10" y="42" width="80" height="44" rx="6" fill="${C.dark}"/>` +
    `<path d="M10 40L84 20L89 34L14 54Z" fill="${C.yellow}"/><path d="M22 36L32 33L40 46L28 49ZM44 30L54 27L62 40L50 43ZM66 24L76 21L84 34L72 37Z" fill="${C.dark}"/>` +
    `<path d="M22 62H48M22 72H66" ${line(C.white, 4)} stroke-opacity="0.8"/>`,
  popcorn:
    `${dot(32, 30, 12, C.cream)}${dot(50, 22, 14, C.white)}${dot(68, 30, 12, C.cream)}${dot(42, 38, 11, C.white)}${dot(60, 40, 11, C.cream)}` +
    `${dot(50, 20, 3, C.yellow)}${dot(30, 28, 3, C.yellow)}` +
    `<path d="M22 44H78L70 88H30Z" fill="${C.white}"/><path d="M30 44L34 88M45 44V88M60 44L58 88M70 44L66 88" ${line(C.red, 7)}/>`,
  bag:
    `<path d="M36 36V28Q36 14 50 14T64 28V36" ${line(C.dark, 5)}/><path d="M18 34H82L88 86H12Z" fill="${C.pink}"/>` +
    `<path d="M50 56C40 50 38 62 50 70C62 62 60 50 50 56Z" fill="${C.white}"/>`,
  gift:
    `<rect x="12" y="40" width="76" height="46" rx="5" fill="${C.red}"/><rect x="8" y="30" width="84" height="16" rx="5" fill="${C.orange}"/>` +
    `<rect x="44" y="30" width="12" height="56" fill="${C.yellow}"/>` +
    `<path d="M50 30C36 30 28 14 38 12C46 11 50 22 50 30ZM50 30C64 30 72 14 62 12C54 11 50 22 50 30Z" fill="${C.yellow}"/>`,
  cake:
    `<rect x="47" y="16" width="6" height="18" rx="2" fill="${C.blue}"/><path d="M50 4C57 11 55 17 50 18C45 17 43 11 50 4Z" fill="${C.orange}"/>` +
    `<rect x="26" y="34" width="48" height="20" rx="5" fill="${C.pink}"/><rect x="14" y="52" width="72" height="30" rx="6" fill="${C.cream}"/>` +
    `<path d="M14 58Q22 68 30 58Q38 68 46 58Q54 68 62 58Q70 68 78 58Q82 64 86 58V54H14Z" fill="${C.pink}"/>` +
    `<ellipse cx="50" cy="86" rx="42" ry="5" fill="${C.grey}"/>`,
  balloon:
    `<path d="M32 76Q40 88 34 96M64 80Q58 88 66 96" ${line(C.grey, 2.5)}/>` +
    `<ellipse cx="34" cy="38" rx="20" ry="24" fill="${C.red}"/><ellipse cx="66" cy="42" rx="18" ry="22" fill="${C.yellow}"/>` +
    `<path d="M30 60L34 66L38 60ZM62 62L66 68L70 62Z" fill="${C.dark}" fill-opacity="0.5"/>` +
    `<path d="M24 28Q26 22 32 22" ${line(C.white, 3.5)} stroke-opacity="0.7"/>`,
  party:
    `<path d="M10 90L34 38L62 66Z" fill="${C.yellow}"/><path d="M10 90L22 64L36 78Z" fill="${C.orange}"/>` +
    `<path d="M48 34Q58 18 74 28M62 52Q80 48 88 62" ${line(C.teal, 4)}/>` +
    `${dot(66, 14, 4, C.pink)}${dot(86, 32, 4, C.blue)}${dot(40, 14, 4, C.red)}${dot(88, 80, 4, C.violet)}${dot(78, 46, 3, C.green)}`,
  champagne:
    `<path d="M22 14H42L40 44Q38 56 32 56Q26 56 24 44Z" fill="${C.yellow}"/><path d="M58 14H78L76 44Q74 56 68 56Q62 56 60 44Z" fill="${C.yellow}" transform="translate(0 0)"/>` +
    `<path d="M32 56V80M24 82H40M68 56V80M60 82H76" ${line(C.dark, 4)}/>` +
    `${dot(30, 26, 3, C.white)}${dot(35, 34, 2.5, C.white)}${dot(66, 26, 3, C.white)}${dot(71, 34, 2.5, C.white)}` +
    `<path d="M48 10L50 4M44 12L40 7M52 12L56 7" ${line(C.orange, 3)}/>`,
  star:
    `<path d="M50 8L61 37L92 38L68 57L76 88L50 70L24 88L32 57L8 38L39 37Z" fill="${C.yellow}"/>` +
    `<path d="M50 8L61 37L50 70L24 88L32 57L8 38L39 37Z" fill="${C.orange}" fill-opacity="0.35"/>`,
  baby:
    `<path d="M50 12Q56 6 62 12" ${line(C.orange, 5)}/><circle cx="50" cy="52" r="34" fill="#FFD3A8"/>` +
    `${dot(20, 54, 6, '#FFD3A8')}${dot(80, 54, 6, '#FFD3A8')}${dot(36, 52, 4, C.dark)}${dot(64, 52, 4, C.dark)}` +
    `${dot(30, 64, 6, C.pink)}${dot(70, 64, 6, C.pink)}<path d="M42 68Q50 76 58 68" ${line(C.dark, 3.5)}/>`,
  bottle:
    `<path d="M44 8Q50 2 56 8V22H44Z" fill="${C.yellow}"/><rect x="36" y="20" width="28" height="8" rx="3" fill="${C.pink}"/>` +
    `<rect x="30" y="28" width="40" height="60" rx="12" fill="${C.cream}"/><path d="M30 52H70V76Q70 88 58 88H42Q30 88 30 76Z" fill="${C.blue}" fill-opacity="0.35"/>` +
    `<path d="M38 40H50M38 56H46M38 68H50" ${line(C.blue, 3)}/>`,
  pacifier:
    `<circle cx="50" cy="20" r="14" ${line(C.pink, 6)}/><path d="M14 40Q50 30 86 40Q80 62 50 62Q20 62 14 40Z" fill="${C.blue}"/>` +
    `<path d="M40 60Q40 86 50 86Q60 86 60 60Z" fill="${C.yellow}"/>${dot(50, 46, 6, C.white)}`,
  teddy:
    `${dot(24, 26, 13, C.brown)}${dot(76, 26, 13, C.brown)}${dot(24, 26, 6, C.cream)}${dot(76, 26, 6, C.cream)}` +
    `<circle cx="50" cy="52" r="34" fill="${C.orange}"/><ellipse cx="50" cy="64" rx="15" ry="12" fill="${C.cream}"/>` +
    `${dot(38, 46, 4, C.dark)}${dot(62, 46, 4, C.dark)}<ellipse cx="50" cy="60" rx="5" ry="3.5" fill="${C.dark}"/><path d="M50 64V70M44 72Q50 76 56 72" ${line(C.dark, 2.5)}/>` +
    `<path d="M40 8L50 16L60 8L56 20H44Z" fill="${C.red}"/>`,
  kite:
    `<path d="M50 6L80 38L50 70L20 38Z" fill="${C.red}"/><path d="M50 6L80 38H50Z" fill="${C.yellow}"/><path d="M50 70L20 38H50Z" fill="${C.blue}"/>` +
    `<path d="M50 70Q40 80 52 86T48 98" ${line(C.dark, 2.5)}/><path d="M46 80L40 76L42 84ZM50 90L58 88L54 94Z" fill="${C.pink}"/>`,
  trophy:
    `<path d="M28 12H72V40Q72 62 50 62Q28 62 28 40Z" fill="${C.yellow}"/>` +
    `<path d="M28 20H14Q14 42 32 46M72 20H86Q86 42 68 46" ${line(C.yellow, 6)}/>` +
    `<rect x="44" y="60" width="12" height="16" fill="${C.orange}"/><rect x="28" y="76" width="44" height="12" rx="4" fill="${C.brown}"/>` +
    `<path d="M38 22V40" ${line(C.white, 4)} stroke-opacity="0.6"/>`,
  ball:
    `<circle cx="50" cy="50" r="38" fill="${C.white}"/><circle cx="50" cy="50" r="38" fill="none" stroke="${C.dark}" stroke-width="3.5"/>` +
    `<path d="M50 36L63 45L58 61H42L37 45Z" fill="${C.dark}"/>` +
    `<path d="M50 36V16M63 45L82 38M58 61L70 78M42 61L30 78M37 45L18 38" ${line(C.dark, 3.5)}/>`,
  medal:
    `<path d="M26 8H44L56 40H40ZM74 8H56L44 40H60Z" fill="${C.red}"/><path d="M44 8H56L50 22Z" fill="${C.blue}"/>` +
    `<circle cx="50" cy="64" r="24" fill="${C.yellow}"/><circle cx="50" cy="64" r="17" fill="${C.orange}" fill-opacity="0.6"/>` +
    `<path d="M50 52L54 61L63 62L56 68L58 77L50 72L42 77L44 68L37 62L46 61Z" fill="${C.white}"/>`,
  palette:
    `<path d="M50 10C24 10 8 28 8 50C8 74 28 90 48 90C58 90 60 82 54 76C48 70 54 62 62 62H76C88 62 94 54 92 42C88 22 72 10 50 10Z" fill="${C.cream}"/>` +
    `${dot(30, 40, 8, C.red)}${dot(50, 26, 8, C.yellow)}${dot(72, 36, 8, C.green)}${dot(28, 64, 8, C.blue)}`,
  brush:
    `<path d="M82 8Q92 8 92 18Q92 26 66 52L50 36Q76 8 82 8Z" fill="${C.brown}"/><path d="M52 34L68 50L58 60L42 44Z" fill="${C.grey}"/>` +
    `<path d="M42 46L56 60Q50 82 24 88Q10 88 14 76Q24 76 28 66Q32 52 42 46Z" fill="${C.red}"/>`,
  sprout:
    `<path d="M50 62V36" ${line(C.green, 5)}/><path d="M50 40Q50 16 78 14Q80 40 50 40Z" fill="${C.green}"/><path d="M50 50Q50 30 24 28Q22 50 50 50Z" fill="#2E9E73"/>` +
    `<path d="M24 62H76L68 90H32Z" fill="${C.orange}"/><rect x="20" y="58" width="60" height="9" rx="3" fill="${C.red}"/>`,
  cactus:
    `<rect x="38" y="16" width="24" height="64" rx="12" fill="${C.green}"/>` +
    `<path d="M38 52H28Q22 52 22 46V36" ${line(C.green, 9)}/><path d="M62 44H72Q78 44 78 38V28" ${line(C.green, 9)}/>` +
    `<path d="M50 28V44M46 54V66" ${line('#2E9E73', 2.5)}/>${dot(50, 12, 4, C.pink)}` +
    `<path d="M26 78H74L68 92H32Z" fill="${C.red}"/>`,
  flower:
    `<path d="M50 58V92" ${line(C.green, 5)}/><path d="M50 82Q66 80 70 68Q54 68 50 80Z" fill="${C.green}"/>` +
    `${dot(50, 22, 14, C.pink)}${dot(72, 38, 14, C.pink)}${dot(28, 38, 14, C.pink)}${dot(36, 56, 14, C.pink)}${dot(64, 56, 14, C.pink)}${dot(50, 42, 12, C.yellow)}`,
  cafe:
    `<path d="M34 26Q28 18 34 10M48 26Q42 18 48 10M62 26Q56 18 62 10" ${line(C.grey, 4)}/>` +
    `<ellipse cx="46" cy="82" rx="32" ry="7" fill="${C.teal}"/><path d="M18 36H74V56Q74 78 46 78Q18 78 18 56Z" fill="${C.red}"/>` +
    `<path d="M74 44Q92 44 88 58Q84 68 72 66" ${line(C.red, 7)}/>` +
    `<path d="M46 64C37 58 37 50 42 49C44 48.5 46 50 46 52C46 50 48 48.5 50 49C55 50 55 58 46 64Z" fill="${C.white}"/>`,
  croissant:
    `<path d="M8 66Q6 40 30 28Q50 20 70 28Q94 40 92 66Q88 76 80 72Q76 60 64 56L36 56Q24 60 20 72Q12 76 8 66Z" fill="${C.orange}"/>` +
    `<path d="M36 26L40 56M50 22V56M64 26L60 56" ${line(C.brown, 3.5)}/><path d="M24 40Q28 34 34 30" ${line(C.yellow, 4)}/>`,
  donut:
    `<circle cx="50" cy="52" r="38" fill="${C.orange}"/><path d="M50 18C72 18 88 34 88 52C88 66 78 72 70 66Q64 76 50 74Q36 76 30 66Q22 72 12 62Q12 34 30 22Q38 18 50 18Z" fill="${C.pink}"/>` +
    `<circle cx="50" cy="48" r="11" fill="${C.cream}"/>` +
    `<path d="M26 40L32 36M68 30L74 34M72 52L78 48M34 62L40 66M60 64L66 62" ${line(C.yellow, 3.5)}/>`,
  dog:
    `<path d="M20 28Q6 30 8 56Q10 72 24 66Q28 46 28 36Z" fill="${C.brown}"/><path d="M80 28Q94 30 92 56Q90 72 76 66Q72 46 72 36Z" fill="${C.brown}"/>` +
    `<ellipse cx="50" cy="48" rx="28" ry="30" fill="${C.orange}"/><ellipse cx="50" cy="62" rx="16" ry="12" fill="${C.cream}"/>` +
    `${dot(38, 42, 4, C.dark)}${dot(62, 42, 4, C.dark)}<ellipse cx="50" cy="56" rx="6" ry="4.5" fill="${C.dark}"/>` +
    `<path d="M50 60V68M42 70Q50 76 58 70" ${line(C.dark, 3)}/><path d="M44 84Q50 94 56 84Z" fill="${C.pink}"/>`,
  cat:
    `<path d="M16 46L18 12L42 28ZM84 46L82 12L58 28Z" fill="${C.orange}"/><path d="M22 36L22 22L33 29ZM78 36L78 22L67 29Z" fill="${C.pink}"/>` +
    `<ellipse cx="50" cy="56" rx="36" ry="32" fill="${C.orange}"/>` +
    `<ellipse cx="38" cy="52" rx="4" ry="5.5" fill="${C.dark}"/><ellipse cx="62" cy="52" rx="4" ry="5.5" fill="${C.dark}"/>` +
    `<path d="M45 62H55L50 68Z" fill="${C.pink}"/><path d="M50 68Q44 76 38 72M50 68Q56 76 62 72" ${line(C.dark, 2.5)}/>` +
    `<path d="M10 60L30 62M10 70L30 66M90 60L70 62M90 70L70 66" ${line(C.dark, 2)} stroke-opacity="0.5"/>`,
  paw:
    `<ellipse cx="50" cy="66" rx="22" ry="18" fill="${C.blue}"/>` +
    `<ellipse cx="22" cy="44" rx="9" ry="12" fill="${C.blue}" transform="rotate(-18 22 44)"/><ellipse cx="40" cy="26" rx="9" ry="13" fill="${C.blue}" transform="rotate(-6 40 26)"/>` +
    `<ellipse cx="60" cy="26" rx="9" ry="13" fill="${C.blue}" transform="rotate(6 60 26)"/><ellipse cx="78" cy="44" rx="9" ry="12" fill="${C.blue}" transform="rotate(18 78 44)"/>`,
};

/** One picture, drawn on a 100 x 100 sheet. The theme's palette is not used: the icons keep their own colours. */
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- kept so callers can still pass the theme
export function iconMarkup(icon: MapIcon, _palette?: IconPalette): string {
  return DRAWINGS[icon];
}
