export type City = {
  name: string;
  province: string;
  tz: string;
};

export const IRAN_CITIES: City[] = [
  { name: 'تهران', province: 'تهران', tz: 'Asia/Tehran' },
  { name: 'مشهد', province: 'خراسان رضوی', tz: 'Asia/Tehran' },
  { name: 'اصفهان', province: 'اصفهان', tz: 'Asia/Tehran' },
  { name: 'کرج', province: 'البرز', tz: 'Asia/Tehran' },
  { name: 'شیراز', province: 'فارس', tz: 'Asia/Tehran' },
  { name: 'تبریز', province: 'آذربایجان شرقی', tz: 'Asia/Tehran' },
  { name: 'اهواز', province: 'خوزستان', tz: 'Asia/Tehran' },
  { name: 'قم', province: 'قم', tz: 'Asia/Tehran' },
  { name: 'کرمانشاه', province: 'کرمانشاه', tz: 'Asia/Tehran' },
  { name: 'ارومیه', province: 'آذربایجان غربی', tz: 'Asia/Tehran' },
  { name: 'رشت', province: 'گیلان', tz: 'Asia/Tehran' },
  { name: 'زاهدان', province: 'سیستان و بلوچستان', tz: 'Asia/Tehran' },
  { name: 'همدان', province: 'همدان', tz: 'Asia/Tehran' },
  { name: 'کرمان', province: 'کرمان', tz: 'Asia/Tehran' },
  { name: 'یزد', province: 'یزد', tz: 'Asia/Tehran' },
  { name: 'اردبیل', province: 'اردبیل', tz: 'Asia/Tehran' },
  { name: 'بندرعباس', province: 'هرمزگان', tz: 'Asia/Tehran' },
  { name: 'ساری', province: 'مازندران', tz: 'Asia/Tehran' },
  { name: 'گرگان', province: 'گلستان', tz: 'Asia/Tehran' },
  { name: 'سنندج', province: 'کردستان', tz: 'Asia/Tehran' },
  { name: 'خرم‌آباد', province: 'لرستان', tz: 'Asia/Tehran' },
  { name: 'بوشهر', province: 'بوشهر', tz: 'Asia/Tehran' },
  { name: 'شهرکرد', province: 'چهارمحال و بختیاری', tz: 'Asia/Tehran' },
  { name: 'ایلام', province: 'ایلام', tz: 'Asia/Tehran' },
  { name: 'بجنورد', province: 'خراسان شمالی', tz: 'Asia/Tehran' },
  { name: 'بیرجند', province: 'خراسان جنوبی', tz: 'Asia/Tehran' },
  { name: 'قزوین', province: 'قزوین', tz: 'Asia/Tehran' },
  { name: 'زنجان', province: 'زنجان', tz: 'Asia/Tehran' },
  { name: 'سمنان', province: 'سمنان', tz: 'Asia/Tehran' },
  { name: 'یاسوج', province: 'کهگیلویه و بویراحمد', tz: 'Asia/Tehran' },
];

export function searchCities(query: string): City[] {
  if (!query.trim()) return IRAN_CITIES.slice(0, 8);
  const q = query.trim();
  return IRAN_CITIES.filter(
    (c) => c.name.includes(q) || c.province.includes(q),
  );
}
