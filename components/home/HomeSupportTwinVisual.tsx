const HOME_SUPPORT_TWIN_VIDEO = '/applications/video/sunrise-from-space.mp4';

/** Full-bleed loop for homepage Support twin panel. */
export function HomeSupportTwinVisual() {
  return (
    <video
      className="home-support-twin-video"
      src={HOME_SUPPORT_TWIN_VIDEO}
      autoPlay
      muted
      loop
      playsInline
      preload="metadata"
      aria-hidden
    />
  );
}
