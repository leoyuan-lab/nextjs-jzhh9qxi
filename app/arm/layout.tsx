/**
 * /arm 首帧黑底：不依赖客户端 styled-jsx，减轻极短无样式/白底闪一下。
 * 不用 body:has（Safari + 重页面上曾出过问题）。
 */
export default function ArmLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="arm-route-shell"
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
