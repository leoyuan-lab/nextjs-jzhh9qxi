'use client';

import { ApplicationImmersiveClient } from '@/components/applications/ApplicationImmersiveClient';
import { MANUFACTURING_IMMERSIVE_CONFIG } from '@/lib/application-immersive-config';

export function ManufacturingApplicationClient() {
  return <ApplicationImmersiveClient config={MANUFACTURING_IMMERSIVE_CONFIG} />;
}
