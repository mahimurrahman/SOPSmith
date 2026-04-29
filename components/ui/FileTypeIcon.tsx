import { getAttachmentKind } from "@/lib/attachments/shared";
import { cn } from "@/lib/cn";

type FileTypeIconProps = {
  fileName: string;
  fileType: string;
  className?: string;
};

export function FileTypeIcon({ className, fileName, fileType }: FileTypeIconProps) {
  const kind = getAttachmentKind(fileType, fileName);
  const label = kind === "pdf" ? "PDF" : kind === "doc" ? "DOC" : "TXT";

  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-xs font-black tracking-[0.2em]",
        kind === "pdf" && "bg-rose-500/14 text-rose-200",
        kind === "doc" && "bg-sky-500/14 text-sky-100",
        kind === "text" && "bg-emerald-500/14 text-emerald-100",
        className,
      )}
    >
      {label}
    </span>
  );
}
