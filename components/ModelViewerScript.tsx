import Script from 'next/script';

/** Load only on routes that use `<model-viewer>` to avoid Next chunk / preload noise sitewide. */
export function ModelViewerScript() {
  return (
    <Script
      id="model-viewer-lib"
      src="/model-viewer.min.js"
      strategy="afterInteractive"
      type="module"
      crossOrigin="anonymous"
    />
  );
}
