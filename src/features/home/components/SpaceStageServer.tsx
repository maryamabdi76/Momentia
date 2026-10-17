import { getTranslations } from 'next-intl/server';
import { SpaceStage } from './SpaceStage';

export async function SpaceStageServer() {
  const t = await getTranslations('HomePage.space');
  return (
    <SpaceStage
      labels={{ clock: t('clock'), moon: t('moon'), lit: t('lit') }}
    />
  );
}
