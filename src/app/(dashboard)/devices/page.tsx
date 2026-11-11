import { PageHeader } from "@/components/layout/page-header";
import { Placeholder } from "@/components/layout/placeholder";

export default function DevicesPage() {
  return (
    <div>
      <PageHeader
        title="Connected Devices"
        subtitle="Manage and monitor patched client emulator instances and physical hardware"
      />
      <Placeholder
        phase="3B"
        description="Device fleet management, block/allow controls, and per-device balance overrides will be implemented in Phase 3B."
      />
    </div>
  );
}
