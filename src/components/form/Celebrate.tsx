import { Sparkles } from 'lucide-react';

const SPARKS = Array.from({ length: 16 }, (_, i) => {
  const angle = (i / 16) * Math.PI * 2;
  const distance = i % 2 === 0 ? 150 : 95;
  return {
    x: Math.round(Math.cos(angle) * distance),
    y: Math.round(Math.sin(angle) * distance * 0.7),
    delay: (i % 4) * 60,
    size: i % 3 === 0 ? 'size-4' : 'size-3',
    tone: i % 2 === 0 ? 'text-[#E6CF92]' : 'text-[#FFF1D6]',
  };
});

/**
 * A short burst of gold sparks, played once when it appears: the small "it is ready" moment on the
 * last step. It takes no space, ignores taps, and is not drawn at all for people who ask for less motion.
 */
export function Celebrate() {
  return (
    <span aria-hidden className="pointer-events-none relative block h-0 w-full motion-reduce:hidden">
      <span className="absolute start-1/2 top-10 block size-0">
        {SPARKS.map((s, i) => (
          <Sparkles
            key={i}
            className={`absolute -ms-1.5 -mt-1.5 opacity-0 ${s.size} ${s.tone}`}
            style={{
              ['--spark-x' as string]: `${s.x}px`,
              ['--spark-y' as string]: `${s.y}px`,
              animation: `spark-burst 1100ms ease-out ${s.delay}ms 1 both`,
            }}
          />
        ))}
      </span>
    </span>
  );
}
