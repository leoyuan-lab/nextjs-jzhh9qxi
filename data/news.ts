import type { MultiLang } from '@/data/products';
import {
  rLiteOgProductImagePath,
  rUltraOgProductImagePath,
} from '@/lib/cobot-immersive-page-config';
import { R_CORE_LITE_HERO_HD_PATH } from '@/lib/rcore-lite-page-config';
import { SITE_BRAND_ORBIT_LOGO_PATH } from '@/lib/site-brand-paths';

export type NewsCategoryId = 'product' | 'company';

export type NewsArticleImageAltKey = 'hero_rcore' | 'hero_rlite' | 'hero_rultra' | 'hero_site';

export type NewsArticle = {
  slug: string;
  category: NewsCategoryId;
  publishedAt: string;
  title: MultiLang;
  excerpt: MultiLang;
  body: MultiLang;
  imagePath: string;
  imageAltKey: NewsArticleImageAltKey;
};

export const NEWS_ARTICLES: readonly NewsArticle[] = [
  {
    slug: 'r-core-line-launch',
    category: 'product',
    publishedAt: '2026-05-25',
    title: {
      zh: 'r-Core 发布：多数产线项目的默认起点',
      en: 'r-Core launch: the default starting point for most lines',
    },
    excerpt: {
      zh: 'r 系列产线主力 r-Core 正式对外发布。多数部署不必从最大负载或最长臂展起跳——5 kg 级、922 mm 臂展与 ±0.02 mm 级重复定位，覆盖装配、检测与线边物流的默认答案。',
      en: 'r-Core is now the line-ready default in the r-Series. Most cells do not need the largest payload or longest reach on day one—5 kg class, 922 mm reach, and ±0.02 mm repeatability cover assembly, inspection, and line-side handling.',
    },
    body: {
      zh: `在评估一条协作机器人产线时，我们反复听到同一种困境：集成商和客户并不缺「更大、更重」的选项，缺的是不必为规格过度支付、却仍能在首日跑通 pick-place 与检测节拍的那一档。

r-Core 正是按这个缺口定义的。5 kg 级负载、922 mm 工作半径、±0.02 mm 级重复定位——不是参数表上的峰值，而是多数工位在稳定运行后仍会落回的一档。标准型、一体式 -C 与移动 WML 三种布局，覆盖外置控制柜产线与紧凑单元，而不强迫项目在立项阶段就绑定单一形态。

我们选择把 r-Core 作为 r 系列对外叙事里的「产线主力」，不是因为它是最大或最轻，而是因为它最贴近从评估到首条轨迹的真实路径：拖拽示教与 Web App 调校足够快，Modbus 就绪 I/O 足够贴近现有 PLC 习惯，ISO 9409-1 法兰足够让 EOAT 供应商按熟悉方式对接。

若你正在对比 r-Lite 与 r-Core，问题往往不在「能不能做」，而在五年后这条线是否仍会以这一档为默认备件与工艺模板。r-Core 页面上每一条规格与工程图纸，都服务于这个判断——而不是堆砌型号数量。`,
      en: `When we assess collaborative robot deployments, the same gap appears again and again: integrators and end users are not short of “bigger/heavier” options—they are short of a tier that does not over-buy on specs yet still runs pick-place and inspection on day one.

r-Core is defined around that gap. Five-kilogram class payload, 922 mm reach, and ±0.02 mm repeatability are not peak numbers on a chart; they are the tier most stations settle on once the line is stable. Standard, integrated -C, and mobile WML layouts cover cabinet lines and compact cells without locking the project into one form factor at bid stage.

We position r-Core as the line-ready anchor in the r-Series narrative not because it is the largest or lightest, but because it matches the path from evaluation to first trajectory: hand-guided teach paths and web tuning are fast enough; Modbus-ready I/O fits existing PLC habits; ISO 9409-1 tooling is familiar to EOAT partners.

If you are choosing between r-Lite and r-Core, the question is usually not capability—it is whether this tier will still be your default spare and process template five years out. Every spec row and blueprint on the r-Core page supports that decision, not a longer model list.`,
    },
    imagePath: R_CORE_LITE_HERO_HD_PATH,
    imageAltKey: 'hero_rcore',
  },
  {
    slug: 'r-ultra-line-launch',
    category: 'product',
    publishedAt: '2026-05-22',
    title: {
      zh: 'r-Ultra 发布：重载协作的产线级答案',
      en: 'r-Ultra launch: line-grade answers for heavy collaborative cells',
    },
    excerpt: {
      zh: 'r-Ultra 正式加入 r 系列公开叙事：30 kg 额定负载、1402 mm 臂展与 ±0.1 mm 级重复定位，面向码垛、机床上下料与末端搬运——在少占地面、少叠防护的前提下，把重载工序收进协作单元。',
      en: 'r-Ultra joins the public r-Series lineup: 30 kg rated payload, 1402 mm reach, and ±0.1 mm repeatability for palletizing, machine tending, and end-of-line transfer—heavy work in a collaborative footprint.',
    },
    body: {
      zh: `当项目讨论从「能不能协作」转向「能不能扛住节拍与负载」时，规格表上的峰值才开始有意义。r-Ultra 面向的是已经确定需要重载、却仍希望保留示教友好与单元紧凑性的产线。

30 kg 额定负载（最大 35 kg）、1402 mm 工作半径、±0.1 mm 级重复定位——这组数字服务的不是 brochure 排序，而是码垛层数、机床门开度与栈板包络的真实边界。对集成商而言，更少一层传统围栏与更少一次现场改制，往往比单轴扭矩曲线更能决定交期。

r-Ultra 页面上的 3D 叙事、工程图纸与应用场景，按同一套评估语言组织：先看负载与臂展是否覆盖工序，再看 I/O 与通信是否贴合现有 PLC/Modbus 习惯，最后才进入轨迹与节拍微调。我们不在立项阶段承诺「万能臂」，而是把重载协作的默认备件与工艺模板讲清楚。

若你的项目已在 r-Core 与 r-Ultra 之间摇摆，关键通常不是最大数字，而是五年后这条重载单元是否仍是产线里可预测、可维护、可扩容的那一档。`,
      en: `Once a project moves from “can we collaborate?” to “can we hold takt under load?”, peak specs start to matter. r-Ultra is for lines that already know they need heavy capacity yet still want teach-friendly deployment and a compact cell.

Thirty kilograms rated (35 kg max), 1402 mm reach, and ±0.1 mm repeatability serve real pallet envelopes, machine door clearances, and stack heights—not brochure sorting. For integrators, one less hard guard layer and one less floor rework often decides schedule more than a torque curve.

The r-Ultra page organizes 3D story, blueprints, and applications in the same assessment language: confirm payload and reach first, then I/O and fieldbus fit, then trajectory and takt tuning. We do not sell a universal arm at bid stage—we explain the default spare and process template for heavy collaborative work.

If you are choosing between r-Core and r-Ultra, the decisive question is usually not the largest number—it is whether this heavy cell will still be the predictable, maintainable tier on your line five years out.`,
    },
    imagePath: rUltraOgProductImagePath(),
    imageAltKey: 'hero_rultra',
  },
  {
    slug: 'r-lite-line-launch',
    category: 'product',
    publishedAt: '2026-05-18',
    title: {
      zh: 'r-Lite 发布：控制箱一体的紧凑协作起点',
      en: 'r-Lite launch: the compact, integrated starting point',
    },
    excerpt: {
      zh: 'r-Lite 以控制箱一体形态公开：3 kg 额定（瞬时 5 kg）、622 mm 臂展与 ±0.05 mm 重复定位，面向精密装配、检测与实验室单元——在 reclaim 台面空间的同时保留产线级接口习惯。',
      en: 'r-Lite is now public in its integrated-controller form: 3 kg nominal (5 kg instant), 622 mm reach, and ±0.05 mm repeatability for precision assembly, inspection, and lab cells—reclaiming bench space without abandoning line-grade interfaces.',
    },
    body: {
      zh: `许多产线与实验室的第一台协作臂，并不是从最大臂展起跳，而是从「还能不能塞进现有单元、接上现有 I/O」起跳。r-Lite 按这个现实定义：控制箱集成于基座，额定 3 kg（瞬时 5 kg）、622 mm 工作半径、±0.05 mm 级重复定位。

一体式 -C 布局把线缆、柜体与占地压缩到工位可接受的包络里，同时保留 Modbus 就绪 I/O、ISO 9409-1 法兰与 Web/示教路径——让集成商不必在「紧凑」与「可维护」之间二选一。对检测、小件装配与线边补料而言，这一档往往是项目从评估走向首条轨迹的最低摩擦入口。

r-Lite 详情页用沉浸式 3D 与工程图纸把法兰、基座与腕部模块讲透，不是为了堆规格行数，而是为了让选型者在立项阶段就能判断：未来三年这条单元是否仍会以这一形态作为默认备件模板。

若你在 r-Lite 与 r-Core 之间犹豫，问题通常不是峰值负载，而是现场空间、接口习惯与五年后的备件路径是否一致。`,
      en: `Many lines and labs do not start with the longest reach—they start with whether an arm still fits the existing cell and talks to existing I/O. r-Lite is defined around that reality: controller integrated at the base, 3 kg nominal (5 kg instant), 622 mm reach, and ±0.05 mm repeatability.

The integrated -C layout compresses cabling, cabinet volume, and footprint into an envelope cells can accept, while keeping Modbus-ready I/O, ISO 9409-1 tooling, and web/teach paths—so integrators do not trade compactness for maintainability. For inspection, small-part assembly, and line-side feeding, this tier is often the lowest-friction entry from evaluation to first trajectory.

The r-Lite page uses immersive 3D and blueprints to explain flange, base, and wrist modules—not to inflate spec rows, but so teams can judge at bid stage whether this form factor will remain the default spare template three years out.

If you are weighing r-Lite against r-Core, the question is usually not peak payload—it is whether floor space, interface habits, and the spare path still align five years forward.`,
    },
    imagePath: rLiteOgProductImagePath(),
    imageAltKey: 'hero_rlite',
  },
  {
    slug: 'roooll-website-launch',
    category: 'company',
    publishedAt: '2026-05-12',
    title: {
      zh: 'Roooll 新网站上线：r 系列协作机器人公开叙事',
      en: 'Roooll website launch: the r-Series cobot story, in the open',
    },
    excerpt: {
      zh: 'Roooll 全新官网正式上线：中英双语、r 系列产品页、选型向导与新闻资讯在同一套评估语言下贯通——从首页 3D 展示到规格与工程图纸，支持集成商与客户按同一路径做判断。',
      en: 'Roooll’s new site is live: bilingual r-Series product pages, advisor, and newsroom under one assessment language—from homepage 3D showcases to specs and blueprints for integrators and end users.',
    },
    body: {
      zh: `过去，协作机器人的信息往往散落在 PDF、价目表与零散渲染图之间；集成商与客户需要在不同格式里自行拼出「这一档是否适合我的单元」。新网站把 r 系列的公开叙事收拢到同一条路径上。

首页以 r-Lite、r-Ultra 与 r-Core 的沉浸式 3D 展示开场，导航直达各产品详情、全系规格与选型向导。每一条产品路径都保留工程图纸、应用语境与询价入口，避免「看得到图、对不上规格」的断裂。

新闻资讯（Newsroom）用于发布产品里程碑与公司更新；Legal 与 Contact 保持可索引的中英版本，hreflang 与站点地图按语言前缀 /zh / /en 成对发布，便于跨区域分享与检索。

这不是一次视觉翻新，而是把 Roooll 对外评估语言固定下来：先判断负载、臂展与现场约束，再进入轨迹与集成细节。网站会随 r 系列扩展持续更新——欢迎从首页或 Newsroom 开始浏览。`,
      en: `Collaborative robot information often lived across PDFs, price sheets, and scattered renders; integrators and end users had to assemble “does this tier fit my cell?” by hand. The new site gathers the public r-Series narrative into one path.

The homepage opens with immersive 3D for r-Lite, r-Ultra, and r-Core, with navigation into product detail, full specs, and the advisor. Every product route keeps blueprints, application context, and inquiry entry together—avoiding the break where marketing visuals no longer match spec rows.

Newsroom carries product milestones and company updates; Legal and Contact stay indexable in Chinese and English, with hreflang and sitemap pairs under /zh and /en for cross-region sharing and search.

This is not a visual refresh alone—it fixes Roooll’s external assessment language: judge payload, reach, and site constraints first, then trajectories and integration detail. The site will evolve with the r-Series—start from the homepage or Newsroom.`,
    },
    imagePath: SITE_BRAND_ORBIT_LOGO_PATH,
    imageAltKey: 'hero_site',
  },
] as const;

export const NEWS_SLUGS: readonly string[] = NEWS_ARTICLES.map((a) => a.slug);

export function newsArticleBySlug(slug: string): NewsArticle | undefined {
  return NEWS_ARTICLES.find((a) => a.slug === slug);
}

export function newsArticlePathname(slug: string): `/news/${string}` {
  return `/news/${slug}`;
}
