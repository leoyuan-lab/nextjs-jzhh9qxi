import { ApplicationRouteShell } from '@/components/applications/ApplicationRouteShell';
import { RetailServiceApplicationClient } from '@/components/applications/RetailServiceApplicationClient';

export default function RetailServicePage() {
  return (
    <ApplicationRouteShell>
      <RetailServiceApplicationClient />
    </ApplicationRouteShell>
  );
}
