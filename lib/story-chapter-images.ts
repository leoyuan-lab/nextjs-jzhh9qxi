import { ALL_COBOTS_JOURNEY_HERO_IMG } from '@/data/products';

/** Our Story chapter visuals. */
export const STORY_CHAPTER_IMAGES = {
  logo: '/images/brand/roooll-loading-logo.webp',
  originProduct: ALL_COBOTS_JOURNEY_HERO_IMG,
  people: '/images/story/roooll-story-chapter-people.jpg',
  planet: '/images/story/roooll-story-chapter-planet.jpg',
  closing: '/images/story/roooll-story-chapter-opening.jpg',
} as const;

export type StoryChapterImageKey = keyof typeof STORY_CHAPTER_IMAGES;

/** Must match `.curtain-pull { margin-top }` in globals.css (vh). */
export const STORY_CURTAIN_OPENING_OVERLAP = {
  desktop: 0.24,
  mobile: 0.14,
} as const;

export const STORY_SCROLL_TRACK = {
  /** Scale + exit; tail trimmed so handoff scroll is shorter. */
  opening: 1.65,
  imageChapter: 1,
} as const;

/** Opening: scale to 77%, then card + origin exit together. */
export const STORY_OPENING_PHASE = {
  scaleEnd: 0.38,
  exitStart: 0.38,
  exitEnd: 0.84,
  /** Hand off to curtain the moment origin fills the screen. */
  handoffEnd: 0.84,
} as const;

/** Curtain (screens 2+3): top lifts first; stage/philosophy only after top is fully gone. */
export const STORY_CURTAIN_PHASE = {
  topHoldEnd: 0,
  topLiftEnd: 0.54,
  /** People enters as philosophy exits — same beat, no gap. */
  stageLiftStart: 0.54,
  navDarkAt: 0.54,
} as const;
