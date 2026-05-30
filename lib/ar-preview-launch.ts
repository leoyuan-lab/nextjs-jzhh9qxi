import { detectAndroidDevice, detectIosQuickLookDevice } from '@/lib/ar-device';
import { openSceneViewerForModel } from '@/lib/scene-viewer-intent';

export type ArPreviewModelSources = {
  glb: string;
  usdz: string;
};

type ModelViewerEl = HTMLElement & {
  activateAR?: () => void;
  setAttribute: (name: string, value: string) => void;
};

function ensureModelSources(viewer: ModelViewerEl, sources: ArPreviewModelSources): void {
  if (!viewer.getAttribute('ios-src')) {
    viewer.setAttribute('ios-src', sources.usdz);
  }
  if (!viewer.getAttribute('src')) {
    viewer.setAttribute('src', sources.glb);
  }
}

/**
 * Preview `<model-viewer>` + external pill.
 * iOS: `activateAR()` on the preview viewer (real tap).
 * Android: native Scene Viewer (`ar_only` → `com.google.ar.core`), or `activateAR()` on preview.
 */
export function launchArFromUserTap(
  viewer: ModelViewerEl | null | undefined,
  sources: ArPreviewModelSources,
): void {
  if (detectIosQuickLookDevice()) {
    if (!viewer) return;
    ensureModelSources(viewer, sources);
    viewer.setAttribute('ar-modes', 'quick-look webxr scene-viewer');
    try {
      viewer.activateAR?.();
    } catch {
      /* Quick Look may reject if gesture chain breaks */
    }
    return;
  }

  if (detectAndroidDevice()) {
    if (viewer) {
      ensureModelSources(viewer, sources);
      viewer.setAttribute('ar', '');
      viewer.setAttribute('ar-modes', 'scene-viewer');
      viewer.setAttribute('ar-scale', 'fixed');
      viewer.setAttribute('ar-placement', 'floor');
      try {
        viewer.activateAR?.();
        return;
      } catch {
        /* gesture / MV failure → explicit intent */
      }
    }
    openSceneViewerForModel(sources.glb);
  }
}
