'use client';

import { ApplicationImmersiveClient } from '@/components/applications/ApplicationImmersiveClient';
import { RETAIL_SERVICE_IMMERSIVE_CONFIG } from '@/lib/application-immersive-config';

export function RetailServiceApplicationClient() {
  return <ApplicationImmersiveClient config={RETAIL_SERVICE_IMMERSIVE_CONFIG} />;
}
