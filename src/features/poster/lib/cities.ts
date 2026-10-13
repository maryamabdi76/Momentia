export type City = {
  name: string;
  province: string;
  tz: string;
  /** Degrees north. City-centre precision (~1 km) is plenty for a sky chart. */
  lat: number;
  /** Degrees east. */
  lon: number;
};

export const IRAN_CITIES: City[] = [
  { name: 'تهران', province: 'تهران', tz: 'Asia/Tehran', lat: 35.69, lon: 51.39 },
  { name: 'مشهد', province: 'خراسان رضوی', tz: 'Asia/Tehran', lat: 36.30, lon: 59.60 },
  { name: 'اصفهان', province: 'اصفهان', tz: 'Asia/Tehran', lat: 32.65, lon: 51.67 },
  { name: 'کرج', province: 'البرز', tz: 'Asia/Tehran', lat: 35.84, lon: 50.94 },
  { name: 'شیراز', province: 'فارس', tz: 'Asia/Tehran', lat: 29.59, lon: 52.58 },
  { name: 'تبریز', province: 'آذربایجان شرقی', tz: 'Asia/Tehran', lat: 38.08, lon: 46.29 },
  { name: 'اهواز', province: 'خوزستان', tz: 'Asia/Tehran', lat: 31.32, lon: 48.67 },
  { name: 'قم', province: 'قم', tz: 'Asia/Tehran', lat: 34.64, lon: 50.88 },
  { name: 'کرمانشاه', province: 'کرمانشاه', tz: 'Asia/Tehran', lat: 34.31, lon: 47.07 },
  { name: 'ارومیه', province: 'آذربایجان غربی', tz: 'Asia/Tehran', lat: 37.55, lon: 45.08 },
  { name: 'رشت', province: 'گیلان', tz: 'Asia/Tehran', lat: 37.28, lon: 49.58 },
  { name: 'زاهدان', province: 'سیستان و بلوچستان', tz: 'Asia/Tehran', lat: 29.50, lon: 60.86 },
  { name: 'همدان', province: 'همدان', tz: 'Asia/Tehran', lat: 34.80, lon: 48.51 },
  { name: 'کرمان', province: 'کرمان', tz: 'Asia/Tehran', lat: 30.28, lon: 57.08 },
  { name: 'یزد', province: 'یزد', tz: 'Asia/Tehran', lat: 31.90, lon: 54.37 },
  { name: 'اردبیل', province: 'اردبیل', tz: 'Asia/Tehran', lat: 38.25, lon: 48.29 },
  { name: 'بندرعباس', province: 'هرمزگان', tz: 'Asia/Tehran', lat: 27.18, lon: 56.27 },
  { name: 'ساری', province: 'مازندران', tz: 'Asia/Tehran', lat: 36.56, lon: 53.06 },
  { name: 'گرگان', province: 'گلستان', tz: 'Asia/Tehran', lat: 36.84, lon: 54.44 },
  { name: 'سنندج', province: 'کردستان', tz: 'Asia/Tehran', lat: 35.32, lon: 46.99 },
  { name: 'خرم‌آباد', province: 'لرستان', tz: 'Asia/Tehran', lat: 33.49, lon: 48.36 },
  { name: 'بوشهر', province: 'بوشهر', tz: 'Asia/Tehran', lat: 28.92, lon: 50.82 },
  { name: 'شهرکرد', province: 'چهارمحال و بختیاری', tz: 'Asia/Tehran', lat: 32.33, lon: 50.86 },
  { name: 'ایلام', province: 'ایلام', tz: 'Asia/Tehran', lat: 33.64, lon: 46.42 },
  { name: 'بجنورد', province: 'خراسان شمالی', tz: 'Asia/Tehran', lat: 37.47, lon: 57.33 },
  { name: 'بیرجند', province: 'خراسان جنوبی', tz: 'Asia/Tehran', lat: 32.86, lon: 59.23 },
  { name: 'قزوین', province: 'قزوین', tz: 'Asia/Tehran', lat: 36.28, lon: 50.00 },
  { name: 'زنجان', province: 'زنجان', tz: 'Asia/Tehran', lat: 36.67, lon: 48.48 },
  { name: 'سمنان', province: 'سمنان', tz: 'Asia/Tehran', lat: 35.58, lon: 53.39 },
  { name: 'یاسوج', province: 'کهگیلویه و بویراحمد', tz: 'Asia/Tehran', lat: 30.67, lon: 51.59 },
];

export function searchCities(query: string): City[] {
  if (!query.trim()) return IRAN_CITIES.slice(0, 8);
  const q = query.trim();
  return IRAN_CITIES.filter(
    (c) => c.name.includes(q) || c.province.includes(q),
  );
}

export function findCity(name: string): City | undefined {
  return IRAN_CITIES.find((c) => c.name === name);
}
