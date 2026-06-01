/**
 * All application marketing media lives under `public/applications/`.
 *
 *   masters/  — original .mov (archival; not referenced in UI)
 *   video/    — web .mp4 exports
 *   cards/    — static hub poster frames (from video extracts; .webp + archival .jpg)
 */
export const APPLICATION_ASSET_ROOT = '/applications';

export const applicationMasterPath = (filename: string) =>
  `${APPLICATION_ASSET_ROOT}/masters/${filename}`;

export const applicationVideoPath = (filename: string) =>
  `${APPLICATION_ASSET_ROOT}/video/${filename}`;

export const applicationCardPath = (filename: string) =>
  `${APPLICATION_ASSET_ROOT}/cards/${filename}`;

/** Web MP4 exports (loop / scenario / hero). */
export const APPLICATION_VIDEOS = {
  welding: applicationVideoPath('welding.mp4'),
  milkTea: applicationVideoPath('milk-tea.mp4'),
  labLoading: applicationVideoPath('lab-loading.mp4'),
  screwDriving: applicationVideoPath('screw-driving.mp4'),
  hospitalRecover: applicationVideoPath('hospital-recover.mp4'),
} as const;

/** Hub card poster frames (extracted from `masters/` at mid-timeline). Prefer WebP in UI. */
export const APPLICATION_HUB_CARD_IMAGES = {
  retailService: applicationCardPath('retail-service.webp'),
  manufacturing: applicationCardPath('manufacturing.webp'),
  medicalLab: applicationCardPath('medical-lab.webp'),
  education: applicationCardPath('education.webp'),
} as const;

/** Story act-three stills (extracted from domain masters). */
export const APPLICATION_SCENARIO_IMAGES = {
  medicalLabSample: applicationCardPath('medical-lab-scenario-sample.webp'),
  medicalLabBench: applicationCardPath('medical-lab-scenario-bench.webp'),
  retailDispense: applicationCardPath('retail-service-scenario-dispense.webp'),
  retailService: applicationCardPath('retail-service-scenario-service.webp'),
  educationLab: applicationCardPath('education-scenario-lab.webp'),
  educationTeam: applicationCardPath('education-scenario-team.webp'),
} as const;

/** Master → card frame mapping (for re-export). */
export const APPLICATION_HUB_CARD_SOURCES = {
  retailService: { master: 'milk-tea.mov', startSec: 2.8 },
  manufacturing: { master: 'welding.mov', startSec: 2.5 },
  medicalLab: { master: 'lab-loading.mov', startSec: 4.0 },
  education: { master: 'hospital-recover.mov', startSec: 3.2 },
} as const;

/** Original .mov masters (for re-export / future edits). */
export const APPLICATION_MASTERS = {
  welding: applicationMasterPath('welding.mov'),
  milkTea: applicationMasterPath('milk-tea.mov'),
  labLoading: applicationMasterPath('lab-loading.mov'),
  screwDriving: applicationMasterPath('screw-driving.mov'),
  hospitalRecover: applicationMasterPath('hospital-recover.mov'),
} as const;
