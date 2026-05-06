/**
 * GLB (glTF binary): align `<link rel="preload" as="fetch">` and the warmup `fetch()`
 * so Lighthouse does not flag credential / type mismatches. Keep in sync everywhere
 * that touches `.glb` preloading.
 */
export const GLB_MIME_TYPE = 'model/gltf-binary';

/** RequestInit for `preloadGlb` warmup only — must match preload link (CORS + Accept). */
export function glbWarmupFetchInit(): RequestInit {
  return {
    cache: 'force-cache',
    mode: 'cors',
    credentials: 'omit',
    headers: {
      Accept: `${GLB_MIME_TYPE}, */*`,
    },
  };
}
