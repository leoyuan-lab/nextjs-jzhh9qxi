/**
 * r‑Max 占位落地页。沉浸详情与 r‑Core 共用同一套实现时：
 * - `page.tsx`：`getSiteLang` + `RCorePageClient` from `app/cobots/r-core/RCorePageClient`，传入 `immersiveProductId="r-max"`。
 * - 先将 `locales` 的 `pages.r_max` 补全为与 `r_core` 同结构（至少含 `scroll_film`）。
 * - `layout.tsx` 对齐 r‑core：`ArmRouteShell`、`ModelViewerScript`、`GlbPreloadLinks`、OG。
 * 详见 `lib/cobot-immersive-page-config.ts`。
 */
import { SeoBriefLanding } from '@/components/SeoBriefLanding';

export default function CobotsRMaxPage() {
  return (
    <SeoBriefLanding
      copy={{
        zh: {
          title: 'r-Max（强力负载型）',
          body: '高负载协作机器人系列——面向汽车制造、大件搬运及重载装配等场景的能力正在扩展中。',
          ctaHome: '返回首页',
          ctaInquiry: '咨询方案',
        },
        en: {
          title: 'r-Max (High Payload)',
          body: 'Our high-payload cobot roadmap for automotive, heavy material handling, and demanding assembly—in active expansion.',
          ctaHome: 'Back to Home',
          ctaInquiry: 'Talk to us',
        },
      }}
    />
  );
}
