import { PageHeader } from "@/components/layout/page-header";
import { Placeholder } from "@/components/layout/placeholder";

export default function ConfigPage() {
  return (
    <div>
      <PageHeader
        title="Global Configuration"
        subtitle="Manage dynamic game parameters, difficulty profiles, and payment numbers"
      />
      <Placeholder
        phase="3B"
        description="Dynamic settings editor, payment wallet numbers manager, and grid presets will be implemented in Phase 3B."
      />
    </div>
  );
}
