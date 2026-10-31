'use client';

/**
 * Last-resort screen for a crash in the root layout itself. The layout (fonts,
 * translations) is gone at this point, so the text is written out here instead
 * of coming from messages/fa.json.
 */
export default function GlobalError({ reset }: { reset: () => void }) {
  return (
    <html lang="fa" dir="rtl">
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '0 24px',
          background: '#080f28',
          color: '#f7f3e8',
          fontFamily: 'Tahoma, sans-serif',
        }}
      >
        <h1 style={{ fontSize: 28, margin: 0 }}>یک چیزی درست کار نکرد</h1>
        <p style={{ marginTop: 16, lineHeight: 2, color: '#AAB6CD' }}>
          خطایی پیش‌بینی‌نشده پیش آمد. یک بار دیگر امتحان کن.
        </p>
        <button
          type="button"
          onClick={reset}
          style={{
            alignSelf: 'flex-start',
            marginTop: 16,
            padding: '12px 24px',
            border: 0,
            borderRadius: 8,
            background: '#CEB47B',
            color: '#0c142b',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          تلاش دوباره
        </button>
      </body>
    </html>
  );
}
