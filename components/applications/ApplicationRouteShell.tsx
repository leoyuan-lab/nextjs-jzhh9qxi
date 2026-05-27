/**
 * Dark immersive shell for application industry pages (manufacturing, etc.).
 */
export function ApplicationRouteShell({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`application-route-shell ${className}`.trim()}
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
