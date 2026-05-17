/**
 * Shared chrome for immersive cobot detail routes (`/cobots/r-lite`, `/cobots/r-ultra`).
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
