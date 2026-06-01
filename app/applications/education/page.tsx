import { ApplicationRouteShell } from '@/components/applications/ApplicationRouteShell';
import { EducationApplicationClient } from '@/components/applications/EducationApplicationClient';

export default function EducationPage() {
  return (
    <ApplicationRouteShell>
      <EducationApplicationClient />
    </ApplicationRouteShell>
  );
}
