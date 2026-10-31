import { getTranslations } from 'next-intl/server';
import { Camera, Mail, Send } from 'lucide-react';
import { hasContact, readSupportConfig } from '@/lib/support';

const linkClass =
  'flex items-center gap-3 rounded-xl border border-[#33415B] bg-[#142039] px-4 py-3 text-sm text-[#E8D9B8] transition-colors hover:border-[#CEB47B]/60 hover:text-[#CEB47B] focus-visible:outline-2 focus-visible:outline-[#CEB47B]';

/** The configured contact channels (see src/lib/support.ts); each one is shown only when it is set. */
export async function ContactLinks() {
  const t = await getTranslations('Support.contact');
  const config = readSupportConfig();

  if (!hasContact(config)) {
    return (
      <p className="rounded-xl border border-[#33415B] bg-[#142039] px-4 py-3 text-sm leading-7 text-[#AAB6CD]">
        {t('none')}
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {config.email && (
        <li>
          <a href={`mailto:${config.email}`} className={linkClass}>
            <Mail aria-hidden className="size-4 shrink-0 text-[#CEB47B]" />
            <span>{t('email')}</span>
            <span dir="ltr" className="ms-auto text-[12px] text-[#AAB6CD]">
              {config.email}
            </span>
          </a>
        </li>
      )}
      {config.telegram && (
        <li>
          <a
            href={`https://t.me/${config.telegram}`}
            target="_blank"
            rel="noopener noreferrer"
            className={linkClass}
          >
            <Send aria-hidden className="size-4 shrink-0 text-[#CEB47B]" />
            <span>{t('telegram')}</span>
            <span dir="ltr" className="ms-auto text-[12px] text-[#AAB6CD]">
              @{config.telegram}
            </span>
          </a>
        </li>
      )}
      {config.instagram && (
        <li>
          <a
            href={`https://instagram.com/${config.instagram}`}
            target="_blank"
            rel="noopener noreferrer"
            className={linkClass}
          >
            <Camera aria-hidden className="size-4 shrink-0 text-[#CEB47B]" />
            <span>{t('instagram')}</span>
            <span dir="ltr" className="ms-auto text-[12px] text-[#AAB6CD]">
              @{config.instagram}
            </span>
          </a>
        </li>
      )}
    </ul>
  );
}
