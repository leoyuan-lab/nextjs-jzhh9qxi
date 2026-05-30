import { detectIosQuickLookDevice } from '@/lib/ar-device';

export type ArPreviewModelSources = {
  glb: string;
  usdz: string;
};

type ModelViewerEl = HTMLElement & {
  activateAR?: () => void;
  model?: unknown;
  getAttribute: (name: string) => string | null;
  setAttribute: (name: string, value: string) => void;
  addEventListener: (
    type: string,
    listener: () => void,
    options?: boolean | AddEventListenerOptions,
  ) => void;
};

/**
 * Launch AR from a hidden `<model-viewer>` (user-gesture chain must call this synchronously).
 */
export function launchArPreview(
  viewer: ModelViewerEl | null | undefined,
  sources: ArPreviewModelSources,
  onLoadingChange: (loading: boolean) => void,
): void {
  if (!viewer) {
    onLoadingChange(false);
    return;
  }

  const isIos = detectIosQuickLookDevice();

  if (!viewer.getAttribute('ios-src')) {
    viewer.setAttribute('ios-src', sources.usdz);
  }
  if (!viewer.getAttribute('src')) {
    viewer.setAttribute('src', sources.glb);
  }

  const launch = () => {
    onLoadingChange(false);
    try {
      viewer.activateAR?.();
    } catch {
      /* Quick Look / Scene Viewer may reject if user gesture chain breaks */
    }
  };

  if (isIos) {
    launch();
    return;
  }

  const fail = () => onLoadingChange(false);
  const loadTimeout = window.setTimeout(fail, 20000);

  const onReady = () => {
    window.clearTimeout(loadTimeout);
    launch();
  };

  if (viewer.model) {
    onReady();
    return;
  }

  viewer.addEventListener('load', onReady, { once: true });
  viewer.addEventListener(
    'error',
    () => {
      window.clearTimeout(loadTimeout);
      fail();
    },
    { once: true },
  );
}
