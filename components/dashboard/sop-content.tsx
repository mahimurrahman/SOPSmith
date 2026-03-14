type SopContentProps = {
  content: string;
  title: string;
};

type SopSection = {
  body: string;
  heading: string;
};

function parseSopContent(content: string) {
  const lines = content.replace(/\r\n/g, "\n").trim().split("\n");
  const sections: SopSection[] = [];
  let heading = "";
  let bodyLines: string[] = [];
  let contentTitle = "";

  const flushSection = () => {
    if (!heading) {
      return;
    }

    sections.push({
      body: bodyLines.join("\n").trim(),
      heading,
    });

    bodyLines = [];
  };

  for (const line of lines) {
    if (line.startsWith("# ")) {
      contentTitle = line.slice(2).trim();
      continue;
    }

    if (line.startsWith("## ")) {
      flushSection();
      heading = line.slice(3).trim();
      continue;
    }

    bodyLines.push(line);
  }

  flushSection();

  return {
    contentTitle,
    sections,
  };
}

export function SopContent({ content, title }: SopContentProps) {
  const parsed = parseSopContent(content);

  return (
    <article className="space-y-8">
      {parsed.contentTitle && parsed.contentTitle !== title ? (
        <section className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
            Generated title
          </p>
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">
            {parsed.contentTitle}
          </h2>
        </section>
      ) : null}

      {parsed.sections.map((section) => (
        <section key={section.heading} className="space-y-3 border-t border-border/80 pt-6 first:border-t-0 first:pt-0">
          <h3 className="text-lg font-semibold tracking-tight text-foreground">{section.heading}</h3>
          <div className="whitespace-pre-wrap text-[15px] leading-8 text-foreground/92 sm:text-base">
            {section.body}
          </div>
        </section>
      ))}
    </article>
  );
}
