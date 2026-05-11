'use client';

import dynamic from 'next/dynamic';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';

import { AdvisorHeroGlb } from '@/components/selector/AdvisorHeroGlb';
import {
  type AdvisorAnswers,
  type AdvisorLetter,
  buildAdvisorInquiryDraft,
  computeAdvisorResult,
  readAdvisorPersisted,
  touchAdvisorStep,
  writeAdvisorPersisted,
} from '@/lib/advisor-engine';
import { useSiteLang } from '@/lib/site-lang-context';

const AdvisorResultPanel = dynamic(() => import('@/components/selector/AdvisorResultPanel'), {
  loading: () => (
    <div
      className="min-h-[240px] rounded-[1.25rem] border border-[#e8e8ed] bg-[#fbfbfd]"
      aria-busy="true"
    />
  ),
});

function normalizeStep(raw: string | null): string {
  if (!raw) return '1';
  if (raw === 'result') return 'result';
  const n = Number(raw);
  if (!Number.isFinite(n) || n < 1 || n > 5) return '1';
  return String(n);
}

const Q_KEYS = ['q1', 'q2', 'q3', 'q4', 'q5'] as const;

type QKey = (typeof Q_KEYS)[number];

function pickKey(stepStr: string): QKey | null {
  const n = Number(stepStr);
  if (!Number.isFinite(n) || n < 1 || n > 5) return null;
  return Q_KEYS[n - 1];
}

type StepOpt = { k: AdvisorLetter; title: string; hint: string };

type StepBlock = {
  eyebrow: string;
  title: string;
  lede: string;
  opts: StepOpt[];
};

type StepAnim = 'idle' | 'leave-forward' | 'leave-back' | 'enter-forward' | 'enter-back';
type TransitionDir = 'forward' | 'back';

const COPY = {
  zh: {
    hero2Title: '慢慢来，我们一句一句聊',
    hero2Subtitle: '没有考试感，更像在店里试一支耳机：选最贴近您直觉的那一项就好。',
    back: '上一题',
    confirm: '确定',
    openDrawer: '查看结果',
    reset: '重新聊一遍',
    steps: [
      {
        eyebrow: '先从日常里找线索',
        title: '最近这段时间，它主要会在哪种节奏里工作？',
        lede: '不用想得太精确，凭第一印象就好。',
        opts: [
          { k: 'A', title: '轻巧、频繁拿起放下', hint: '小件、短节拍，更像工作台旁的帮手。' },
          { k: 'B', title: '站在设备边，稳稳地接力', hint: '机床、检测台旁，重复但要有手感。' },
          { k: 'C', title: '跨过去、够得远', hint: '要覆盖更大一片区域，少走两步路。' },
          { k: 'D', title: '沉一点，也久一点', hint: '工件偏重或节拍偏满，想留足余量。' },
        ],
      },
      {
        eyebrow: '聊聊「力气」这件事',
        title: '如果把它拟人化，您更希望它是哪种体型？',
        lede: '我们在看负载区间，但用更软的说法问您。',
        opts: [
          { k: 'A', title: '精瘦型，够用就好', hint: '≤5 kg 左右，紧凑、好塞进现有线体。' },
          { k: 'B', title: '匀称型，日常全能', hint: '大约 5–10 kg，多数场景都舒服。' },
          { k: 'C', title: '结实型，扛得住', hint: '10–20 kg，更在意稳和耐用。' },
          { k: 'D', title: '重载型，或末端工装本身就很沉', hint: '≥20 kg 或工具盘偏重，想一次到位。' },
        ],
      },
      {
        eyebrow: '臂展：像伸手拿东西的感觉',
        title: '它「伸手」时，您脑海里的画面更接近哪一种？',
        lede: '半径没有标准答案，想象您最常需要够到的范围。',
        opts: [
          { k: 'A', title: '就在手边', hint: '紧凑工位，台面附近。' },
          { k: 'B', title: '绕一台设备转一圈', hint: '中等半径，单工位内够用。' },
          { k: 'C', title: '要跨过邻居设备', hint: '较大跨度，产线或输送线两侧。' },
          { k: 'D', title: '想再远一点，或配合滑轨/第七轴', hint: '延展场景，后续可能加长臂或外轴。' },
        ],
      },
      {
        eyebrow: '节拍与手感',
        title: '哪一种「脾气」您更喜欢呢？',
        lede: '精度、节拍、示教友好——很难全满分，先选当下最在意的一个。',
        opts: [
          { k: 'A', title: '慢一点没关系，好教、好改', hint: '示教友好、迭代快。' },
          { k: 'B', title: '中小批量，想稳一点', hint: '均衡：可重复、也要能调。' },
          { k: 'C', title: '轨迹要顺、落点要准', hint: '重复定位与路径质量优先。' },
          { k: 'D', title: '产能拉满，防护也不能省', hint: '高节拍 + 重载或严苛工况。' },
        ],
      },
      {
        eyebrow: '最后一笔：现场气质',
        title: '把它放进您的车间/实验室，您最担心哪种「意外」？',
        lede: '环境决定很多温柔的小细节，比如密封、线缆与清洗。',
        opts: [
          { k: 'A', title: '常规尘屑，正常打扫就好', hint: '一般车间。' },
          { k: 'B', title: '粉尘或液体偶尔会溅到', hint: '需要更稳妥的防护思路。' },
          { k: 'C', title: '高位、远距离或楼层间搬运', hint: '仓储、多楼层转运场景。' },
          { k: 'D', title: '清洗、食品医药或特别苛刻', hint: '对材料与认证更敏感。' },
        ],
      },
    ] satisfies StepBlock[],
  },
  en: {
    hero2Title: 'We’ll walk through it one beat at a time.',
    hero2Subtitle: 'Less “exam”, more like trying headphones in-store: pick what feels closest.',
    back: 'Back',
    confirm: 'OK',
    openDrawer: 'View result',
    reset: 'Start over',
    steps: [
      {
        eyebrow: 'Start with the everyday',
        title: 'What rhythm will it live in most of the time?',
        lede: 'First instinct is enough—no need to be exact.',
        opts: [
          { k: 'A', title: 'Light, frequent pick & place', hint: 'Small parts, short cycles—bench-side helper energy.' },
          { k: 'B', title: 'Shoulder to machine, steady relay', hint: 'Tending, inspection—repeatable but still “human-paced”.' },
          { k: 'C', title: 'Reach farther, cover more', hint: 'Wide coverage—fewer steps for the arm.' },
          { k: 'D', title: 'Heavier, longer shifts', hint: 'Heavier payloads or fuller cycles—leave headroom.' },
        ],
      },
      {
        eyebrow: 'About “strength”',
        title: 'If it were a person, which build fits your story?',
        lede: 'We’re mapping payload—just in softer language.',
        opts: [
          { k: 'A', title: 'Lean—just enough', hint: '≤5 kg, compact, slips into existing cells.' },
          { k: 'B', title: 'Balanced daily driver', hint: '~5–10 kg—most lanes feel fine.' },
          { k: 'C', title: 'Sturdy—likes a workout', hint: '10–20 kg—stability matters.' },
          { k: 'D', title: 'Heavy-duty—or the EOAT itself is a beast', hint: '≥20 kg or big tooling—plan once, cry less later.' },
        ],
      },
      {
        eyebrow: 'Reach, like reaching for coffee',
        title: 'Which mental image is closer?',
        lede: 'No single right radius—think where you most often need the wrist to be.',
        opts: [
          { k: 'A', title: 'Within arm’s length', hint: 'Compact cell, bench height.' },
          { k: 'B', title: 'Orbit one machine', hint: 'Medium radius inside a single station.' },
          { k: 'C', title: 'Across neighbors', hint: 'Larger span—lines, conveyors, two islands.' },
          { k: 'D', title: 'Even farther—or rails / 7th axis later', hint: 'Extension mindset from day one.' },
        ],
      },
      {
        eyebrow: 'Tempo & feel',
        title: 'Which “mood” do you like better?',
        lede: 'Accuracy, cycle, teachability—pick what matters most today.',
        opts: [
          { k: 'A', title: 'Slower is OK if it’s easy to teach', hint: 'Iteration-friendly programming.' },
          { k: 'B', title: 'SMB batches—stay predictable', hint: 'Balanced repeatability + flexibility.' },
          { k: 'C', title: 'Silky paths, crisp landings', hint: 'Repeatability & path quality first.' },
          { k: 'D', title: 'Throughput up, protection too', hint: 'Fast cycles + heavy or harsh duty.' },
        ],
      },
      {
        eyebrow: 'Last brushstroke: floor vibe',
        title: 'Once it lands in your shop or lab, what “surprise” worries you most?',
        lede: 'Dust, splash, height, wash-down—small words, big design choices.',
        opts: [
          { k: 'A', title: 'Normal dust—regular housekeeping', hint: 'Typical factory floor.' },
          { k: 'B', title: 'Dust or fluid splashes sometimes', hint: 'Need a calmer protection story.' },
          { k: 'C', title: 'Elevation, distance, or floors in between', hint: 'Warehouse / multi-floor moves.' },
          { k: 'D', title: 'Wash-down, food/med, or harsh chemistry', hint: 'Materials & certs get louder.' },
        ],
      },
    ] satisfies StepBlock[],
  },
} as const;

export function AdvisorWizard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const lang = useSiteLang();
  const safeLang = lang === 'en' ? 'en' : 'zh';
  const t = COPY[safeLang];

  const urlStep = useMemo(
    () => normalizeStep(searchParams.get('advisorStep')),
    [searchParams],
  );
  const [answers, setAnswers] = useState<AdvisorAnswers>({});
  const [pendingChoice, setPendingChoice] = useState<AdvisorLetter | null>(null);
  const [stepAnim, setStepAnim] = useState<StepAnim>('idle');
  const [isAdvancing, setIsAdvancing] = useState(false);
  const navDirRef = useRef<TransitionDir>('forward');
  const enterTimerRef = useRef<number | null>(null);
  const ENTER_MS_FORWARD = 220;
  const ENTER_MS_BACK = 200;
  const LEAVE_MS_FORWARD = 180;
  const LEAVE_MS_BACK = 170;

  const setUrlStep = useCallback(
    (next: string) => {
      router.replace(`/selector/advisor?advisorStep=${next}`, { scroll: false });
    },
    [router],
  );

  const persist = useCallback(
    (next: AdvisorAnswers) => {
      const prev = readAdvisorPersisted();
      writeAdvisorPersisted({
        answers: next,
        updatedAt: new Date().toISOString(),
        lastAdvisorStep: prev?.lastAdvisorStep ?? urlStep,
        lastEmailSentAt: prev?.lastEmailSentAt,
      });
    },
    [urlStep],
  );

  useEffect(() => {
    touchAdvisorStep(urlStep);
  }, [urlStep]);

  useEffect(() => {
    if (urlStep !== 'result') return;
    if (Q_KEYS.every((k) => answers[k])) return;
    const p = readAdvisorPersisted();
    if (!p?.answers) return;
    const restored = p.answers;
    if (!Q_KEYS.every((k) => restored[k])) return;
    setAnswers(restored);
  }, [urlStep, answers]);

  useLayoutEffect(() => {
    if (urlStep === 'result') {
      setStepAnim('idle');
      setIsAdvancing(false);
      return;
    }
    const key = pickKey(urlStep);
    setPendingChoice(key ? (answers[key] ?? null) : null);
    const enterMs = navDirRef.current === 'back' ? ENTER_MS_BACK : ENTER_MS_FORWARD;
    setStepAnim(navDirRef.current === 'back' ? 'enter-back' : 'enter-forward');
    // Unlock actions as soon as the new step mounts to avoid double-tap feel.
    setIsAdvancing(false);
    if (enterTimerRef.current) window.clearTimeout(enterTimerRef.current);
    enterTimerRef.current = window.setTimeout(() => {
      setStepAnim('idle');
      enterTimerRef.current = null;
    }, enterMs);
    return () => {
      if (enterTimerRef.current) {
        window.clearTimeout(enterTimerRef.current);
        enterTimerRef.current = null;
      }
    };
  }, [urlStep]);

  useEffect(() => {
    window.dispatchEvent(new CustomEvent('roooll-nav-tone', { detail: { tone: 'light' } }));
    return () => {
      window.dispatchEvent(new CustomEvent('roooll-nav-tone', { detail: { tone: null } }));
    };
  }, []);

  useEffect(() => {
    const emit = (progress: number) => {
      window.dispatchEvent(new CustomEvent('roooll-main-nav-progress', { detail: { progress } }));
    };
    const onScroll = () => {
      emit(Math.min(1, window.scrollY / 36));
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      emit(0);
    };
  }, []);

  const onSelect = (letter: AdvisorLetter) => {
    if (isAdvancing) return;
    setPendingChoice(letter);
  };

  const onConfirm = () => {
    if (isAdvancing || !pendingChoice) return;
    const key = pickKey(urlStep);
    if (!key || urlStep === 'result') return;
    const leaveMs = LEAVE_MS_FORWARD;
    navDirRef.current = 'forward';
    setIsAdvancing(true);
    setStepAnim('leave-forward');
    window.setTimeout(() => {
      const next = { ...answers, [key]: pendingChoice } as AdvisorAnswers;
      setAnswers(next);
      persist(next);
      if (urlStep === '5') {
        setUrlStep('result');
      } else {
        setUrlStep(String(Number(urlStep) + 1));
      }
    }, leaveMs);
  };

  const goBack = () => {
    if (isAdvancing) return;
    if (urlStep === 'result') {
      setUrlStep('5');
      return;
    }
    const n = Number(urlStep);
    if (n <= 1) return;
    const leaveMs = LEAVE_MS_BACK;
    navDirRef.current = 'back';
    setIsAdvancing(true);
    setStepAnim('leave-back');
    window.setTimeout(() => {
      const prevKey = Q_KEYS[n - 2];
      const nextAnswers = { ...answers };
      delete nextAnswers[prevKey];
      setAnswers(nextAnswers);
      persist(nextAnswers);
      setUrlStep(String(n - 1));
    }, leaveMs);
  };

  const resetFlow = () => {
    const blank: AdvisorAnswers = {};
    setAnswers(blank);
    persist(blank);
    setUrlStep('1');
  };

  const result = urlStep === 'result' ? computeAdvisorResult(answers) : null;

  const stepIndex = urlStep === 'result' ? -1 : Number(urlStep) - 1;
  const stepCopy = stepIndex >= 0 && stepIndex < t.steps.length ? t.steps[stepIndex] : null;

  const picks = useMemo(() => {
    const lines: { step: number; question: string; line: string }[] = [];
    for (let i = 0; i < Q_KEYS.length; i++) {
      const key = Q_KEYS[i];
      const letter = answers[key];
      if (!letter) continue;
      const block = COPY.zh.steps[i];
      const blockEn = COPY.en.steps[i];
      const opt = (safeLang === 'zh' ? block : blockEn).opts.find((o) => o.k === letter);
      const qTitle = safeLang === 'zh' ? block.title : blockEn.title;
      const line = opt ? `${opt.title} — ${opt.hint}` : letter;
      lines.push({ step: i + 1, question: qTitle, line });
    }
    return lines;
  }, [answers, safeLang]);

  const inquiryDraft = useMemo(() => {
    if (picks.length < 5) return '';
    const res = computeAdvisorResult(answers);
    return buildAdvisorInquiryDraft(safeLang, res, picks);
  }, [picks, answers, safeLang]);

  const resultIntro = useMemo(() => {
    if (!result) return '';
    return (safeLang === 'zh' ? result.detailZh : result.detailEn).trim();
  }, [result, safeLang]);

  const answeredCount = Q_KEYS.reduce((n, k) => (answers[k] ? n + 1 : n), 0);
  const progressFilled = Math.min(5, answeredCount);

  return (
    <div className="bg-[#f5f5f7] text-[#1d1d1f] antialiased" style={{ WebkitFontSmoothing: 'antialiased' }}>
      <AdvisorHeroGlb lang={safeLang} />

      <div className="advisor-hero2-stack">
        <section
          className="border-t border-[#d2d2d7]/80 bg-white text-[#1d1d1f]"
          aria-labelledby="advisor-hero2-title"
        >
          <div className="mx-auto w-full max-w-[var(--roooll-w,1024px)] px-[22px] pb-16 pt-10 md:pb-24 md:pt-12">
            <h2
              id="advisor-hero2-title"
              className="mb-3 max-w-[52rem] text-[2rem] font-semibold leading-[1.07] tracking-[-0.03em] text-[#0071e3] md:text-[2.75rem]"
            >
              {urlStep === 'result' && result ? (safeLang === 'zh' ? result.headlineZh : result.headlineEn) : t.hero2Title}
            </h2>
            <div className="mb-10 md:mb-12" aria-hidden />

            {urlStep !== 'result' && stepCopy ? (
              <>
                <div className="mb-8 w-full max-w-[320px]" aria-hidden>
                  <div className="grid grid-cols-5 gap-1.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span
                        key={i}
                        className={`h-1.5 rounded-full transition-colors duration-200 ${
                          i < progressFilled ? 'bg-[#34c759]' : 'bg-[#d2d2d7]'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <div
                  className={`transition-[transform,opacity] will-change-transform ${
                    stepAnim === 'leave-back'
                      ? 'translate-y-8 opacity-0 md:translate-y-10'
                      : stepAnim === 'leave-forward'
                        ? '-translate-y-8 opacity-0 md:-translate-y-10'
                        : stepAnim === 'enter-back'
                          ? '-translate-y-5 opacity-0 md:-translate-y-6'
                          : stepAnim === 'enter-forward'
                            ? 'translate-y-5 opacity-0 md:translate-y-6'
                        : 'translate-y-0 opacity-100'
                  }`}
                  style={{
                    transitionDuration: `${
                      stepAnim === 'leave-back'
                        ? LEAVE_MS_BACK
                        : stepAnim === 'leave-forward'
                          ? LEAVE_MS_FORWARD
                          : stepAnim === 'enter-back'
                            ? ENTER_MS_BACK
                            : stepAnim === 'enter-forward'
                              ? ENTER_MS_FORWARD
                              : 220
                    }ms`,
                    transitionTimingFunction:
                      stepAnim === 'leave-back' || stepAnim === 'leave-forward'
                        ? 'cubic-bezier(0.32, 0.72, 0.45, 1)'
                        : 'cubic-bezier(0.18, 0.82, 0.24, 1)',
                  }}
                >
                  <h3 className="mb-3 max-w-[48rem] text-[1.5rem] font-semibold leading-tight tracking-[-0.02em] text-[#1d1d1f] md:text-[1.85rem]">
                    {stepCopy.title}
                  </h3>
                  <p className="mb-8 max-w-[42rem] text-[1.0625rem] leading-relaxed text-[#86868b]">{stepCopy.lede}</p>

                  <div className="grid gap-3 md:grid-cols-2 md:gap-4">
                    {stepCopy.opts.map((opt) => {
                      const selected = pendingChoice === opt.k;
                      return (
                        <button
                          key={opt.k}
                          type="button"
                          className={`group flex flex-col rounded-[1.05rem] border bg-[#fbfbfd] p-4 text-left shadow-[0_1px_0_rgba(0,0,0,0.04)] transition active:scale-[0.99] md:p-5 ${
                            selected
                              ? 'border-[#0071e3] ring-2 ring-[#0071e3]/25 shadow-[0_12px_40px_rgba(0,113,227,0.14)]'
                              : 'border-[#e8e8ed] hover:border-[#0071e3]/45 hover:ring-2 hover:ring-[#0071e3]/22 hover:shadow-[0_12px_40px_rgba(0,0,0,0.08)]'
                          }`}
                          onClick={() => onSelect(opt.k)}
                          disabled={isAdvancing}
                        >
                          <div className="mb-2.5 flex items-center gap-2.5">
                            <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-[0.78rem] font-semibold text-[#6e6e73] ring-1 ring-[#0000000d] group-hover:text-[#1d1d1f]">
                              {opt.k}
                            </span>
                            <span className="text-[1rem] font-semibold leading-snug text-[#1d1d1f]">{opt.title}</span>
                          </div>
                          <span className="text-[0.9rem] leading-relaxed text-[#6e6e73]">{opt.hint}</span>
                        </button>
                      );
                    })}
                  </div>

                </div>
                <div className="mt-8 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    className="inline-flex items-center justify-center rounded-full bg-[#0071e3] px-6 py-2.5 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(0,113,227,0.35)] transition hover:bg-[#0077ed] disabled:cursor-not-allowed disabled:opacity-40"
                    onClick={onConfirm}
                    disabled={!pendingChoice || isAdvancing}
                  >
                    {t.confirm}
                  </button>
                  {Number(urlStep) > 1 ? (
                    <button
                      type="button"
                      className="rounded-full border border-[#d2d2d7] bg-white px-6 py-2.5 text-sm font-semibold text-[#1d1d1f] transition hover:bg-[#f5f5f7] disabled:opacity-45"
                      onClick={goBack}
                      disabled={isAdvancing}
                    >
                      {t.back}
                    </button>
                  ) : (
                    <span aria-hidden className="hidden h-10 w-[84px] md:inline-block" />
                  )}
                </div>
              </>
            ) : result && picks.length >= 5 ? (
              <AdvisorResultPanel
                safeLang={safeLang}
                result={result}
                picks={picks}
                resultIntro={resultIntro}
                inquiryDraft={inquiryDraft}
                openDrawerLabel={t.openDrawer}
                resetLabel={t.reset}
                onReset={resetFlow}
              />
            ) : urlStep === 'result' ? (
              <p className="text-[#6e6e73]">
                {safeLang === 'zh' ? '选项不完整，请从第 1 步重新选择。' : 'Answers incomplete—please restart from step 1.'}
              </p>
            ) : null}
          </div>
        </section>
      </div>
    </div>
  );
}
