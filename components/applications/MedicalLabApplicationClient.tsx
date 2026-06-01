'use client';

import { ApplicationImmersiveClient } from '@/components/applications/ApplicationImmersiveClient';
import { MEDICAL_LAB_IMMERSIVE_CONFIG } from '@/lib/application-immersive-config';

export function MedicalLabApplicationClient() {
  return <ApplicationImmersiveClient config={MEDICAL_LAB_IMMERSIVE_CONFIG} />;
}
