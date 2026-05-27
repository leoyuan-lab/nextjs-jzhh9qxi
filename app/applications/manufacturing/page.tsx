import { ApplicationRouteShell } from '@/components/applications/ApplicationRouteShell';
import { ManufacturingApplicationClient } from '@/components/applications/ManufacturingApplicationClient';

export default function ManufacturingPage() {
  return (
    <ApplicationRouteShell>
      <ManufacturingApplicationClient />
    </ApplicationRouteShell>
  );
}
