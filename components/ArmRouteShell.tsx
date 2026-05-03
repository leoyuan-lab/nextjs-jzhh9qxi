/**
 * Shared chrome for r‑Core detail route (`/cobots/r-core`).
 */
export function ArmRouteShell({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`arm-route-shell ${className}`.trim()}
      style={{
        background: '#000',
        color: '#fff',
        minHeight: '100vh',
      }}
    >
      {children}
    </div>
  );
}
