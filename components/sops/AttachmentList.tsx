import { AttachmentsSection } from "@/components/dashboard/attachments-section";
import type { SopFileSummary } from "@/lib/attachments/types";

type AttachmentListProps = {
  attachments: SopFileSummary[];
  sopId: string;
};

export function AttachmentList({ attachments, sopId }: AttachmentListProps) {
  return <AttachmentsSection attachments={attachments} sopId={sopId} />;
}
