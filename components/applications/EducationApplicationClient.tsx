'use client';

import { ApplicationImmersiveClient } from '@/components/applications/ApplicationImmersiveClient';
import { EDUCATION_IMMERSIVE_CONFIG } from '@/lib/application-immersive-config';

export function EducationApplicationClient() {
  return <ApplicationImmersiveClient config={EDUCATION_IMMERSIVE_CONFIG} />;
}
