'use client';

import { useTranslations } from 'next-intl';

export type PreviewScene = 'poster' | 'wall';

/** Step 3 of every creator can show the poster on its own, or framed on a wall. */
export function SceneToggle({ value, onChange }: { value: PreviewScene; onChange: (scene: PreviewScene) => void }) {
  const t = useTranslations('CreatePage');
  return (
    <div role="group" aria-label={t('preview.sceneLabel')} className="mt-5 flex justify-center gap-1 text-xs">
      {(['poster', 'wall'] as const).map((kind) => (
        <button
          key={kind}
          type="button"
          aria-pressed={value === kind}
          onClick={() => onChange(kind)}
          className={`rounded-full px-3.5 py-1.5 transition-colors ${
            value === kind ? 'bg-[#1c2540] text-[#F4EFE6]' : 'text-[#1c2540]/70 hover:bg-[#1c2540]/10'
          }`}
        >
          {t(kind === 'poster' ? 'preview.scenePoster' : 'preview.sceneWall')}
        </button>
      ))}
    </div>
  );
}
