import { PageHeader } from "@/components/layout/page-header";
import { Placeholder } from "@/components/layout/placeholder";

export default function SessionsPage() {
  return (
    <div>
      <PageHeader
        title="Game Sessions"
        subtitle="Historical audit trail of all game rounds, bet placements, and cashouts"
      />
      <Placeholder
        phase="3C"
        description="Searchable session logs, detailed step-by-step action replays, and grid inspections will be implemented in Phase 3C."
      />
    </div>
  );
}
