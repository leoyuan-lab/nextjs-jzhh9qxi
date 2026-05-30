/** Replaces model-viewer default AR FAB so no ghost icon shows (iOS). */
export function ArSlotAbsorb() {
  return (
    <button type="button" slot="ar-button" className="roooll-ar-slot-absorb" tabIndex={-1} aria-hidden>
      {' '}
    </button>
  );
}
