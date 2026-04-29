import type { StructuredSop } from "@/lib/sops";

export type SopHealthIssue = {
  code: string;
  label: string;
  penalty: number;
};

export function calculateSopHealth(sop: {
  created_at?: string;
  structured_data: StructuredSop;
}) {
  const issues: SopHealthIssue[] = [];
  const data = sop.structured_data;

  if (!/Owner:\s*\S+/i.test(data.purpose)) {
    issues.push({ code: "missing_owner", label: "Owner is missing from the purpose section.", penalty: 15 });
  }
  if (data.steps.length < 3) {
    issues.push({ code: "thin_steps", label: "The SOP needs at least three actionable steps.", penalty: 20 });
  }
  if (data.quality_checks.length === 0) {
    issues.push({ code: "missing_quality_checks", label: "Quality checks are missing.", penalty: 15 });
  }
  if (data.checklist.length === 0) {
    issues.push({ code: "missing_checklist", label: "Completion checklist is missing.", penalty: 15 });
  }
  if (data.tools.length === 0 || data.inputs.length === 0) {
    issues.push({ code: "missing_tools_inputs", label: "Tools or inputs are missing.", penalty: 15 });
  }

  if (sop.created_at) {
    const ageMs = Date.now() - new Date(sop.created_at).getTime();
    if (ageMs > 30 * 24 * 60 * 60 * 1000) {
      issues.push({ code: "stale", label: "This SOP has not been audited in 30 days.", penalty: 10 });
    }
  }

  return {
    issues,
    score: Math.max(0, 100 - issues.reduce((total, issue) => total + issue.penalty, 0)),
  };
}
