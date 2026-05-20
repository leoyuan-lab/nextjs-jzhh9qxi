'use client';

/** Catches root render errors; wire Sentry in `instrumentation.ts` when DSN is configured. */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  if (process.env.NODE_ENV === 'production') {
    console.error('[roooll-global-error]', error.digest ?? error.message);
  }

  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: 'system-ui, sans-serif', padding: 48, background: '#f5f5f7' }}>
        <h1 style={{ fontSize: 24, color: '#1d1d1f' }}>Something went wrong</h1>
        <p style={{ color: '#6e6e73', maxWidth: 480 }}>
          Please refresh the page or return to the homepage. If the problem persists, contact info@roooll.com.
        </p>
        <button
          type="button"
          onClick={() => reset()}
          style={{
            marginTop: 16,
            padding: '10px 18px',
            borderRadius: 980,
            border: 'none',
            background: '#0071e3',
            color: '#fff',
            cursor: 'pointer',
          }}
        >
          Try again
        </button>
      </body>
    </html>
  );
}
