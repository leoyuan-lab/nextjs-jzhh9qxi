import { ApplicationRouteShell } from '@/components/applications/ApplicationRouteShell';
import { MedicalLabApplicationClient } from '@/components/applications/MedicalLabApplicationClient';

export default function MedicalLabPage() {
  return (
    <ApplicationRouteShell>
      <MedicalLabApplicationClient />
    </ApplicationRouteShell>
  );
}
