import { PageHeader } from "@/components/layout/page-header";
import { Placeholder } from "@/components/layout/placeholder";

export default function LivePage() {
  return (
    <div>
      <PageHeader
        title="Live Games"
        subtitle="Real-time live monitoring of games currently in progress"
      />
      <Placeholder
        phase="3C"
        description="Live grid visualizer, interactive force win/loss overrides, and real-time step tracking will be implemented in Phase 3C."
      />
    </div>
  );
}
