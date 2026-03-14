import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

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
    <article className="space-y-16">
      {parsed.contentTitle && parsed.contentTitle !== title ? (
        <section>
          <h2 className="text-xs font-bold uppercase tracking-[0.25em] text-primary mb-6 flex items-center gap-2">
            <span className="w-8 h-[1px] bg-primary/30"></span> Generated Title
          </h2>
          <p className="text-xl leading-relaxed text-slate-700 dark:text-slate-300 font-medium font-display">
            {parsed.contentTitle}
          </p>
        </section>
      ) : null}

      {parsed.sections.map((section) => (
        <section key={section.heading}>
          <h2 className="text-xs font-bold uppercase tracking-[0.25em] text-primary mb-6 flex items-center gap-2">
            <span className="w-8 h-[1px] bg-primary/30"></span> {section.heading}
          </h2>
          <div className="prose-custom">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                ul: ({ node, ...props }) => <ul className="list-disc pl-5 mt-4 mb-6 space-y-2 marker:text-primary" {...props} />,
                ol: ({ node, ...props }) => <ol className="list-decimal pl-5 mt-4 mb-6 space-y-2 marker:text-primary font-medium" {...props} />,
                li: ({ node, ...props }) => <li className="pl-1.5 text-[15px] text-slate-600 dark:text-slate-300 leading-relaxed" {...props} />,
                p: ({ node, ...props }) => <p className="mb-5 text-[15px] text-slate-600 dark:text-slate-400 leading-relaxed" {...props} />,
                h3: ({ node, ...props }) => <h3 className="text-lg font-bold mt-8 mb-4 text-slate-900 dark:text-white font-display tracking-tight" {...props} />,
                h4: ({ node, ...props }) => <h4 className="text-base font-bold mt-6 mb-3 text-slate-900 dark:text-white font-display" {...props} />,
                strong: ({ node, ...props }) => <strong className="font-bold text-slate-900 dark:text-white" {...props} />,
                a: ({ node, ...props }) => <a className="text-primary hover:underline font-medium hover:text-primary/80 transition-colors cursor-pointer" {...props} />,
                blockquote: ({ node, ...props }) => <blockquote className="border-l-4 border-primary/40 bg-primary/5 pl-5 pr-4 py-3 my-6 rounded-r-xl italic text-slate-700 dark:text-slate-300" {...props} />,
                code(props: any) {
                  const { children, className, node, ...rest } = props;
                  const match = /language-(\w+)/.exec(className || '');
                  const isInline = !match && !className;
                  return isInline ? (
                    <code className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-md text-[13px] text-primary font-mono font-medium" {...rest}>
                      {children}
                    </code>
                  ) : (
                    <code className="block w-full bg-slate-100 dark:bg-slate-900 p-5 rounded-2xl text-[13px] font-mono my-6 overflow-x-auto text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800/80 shadow-inner" {...rest}>
                      {children}
                    </code>
                  );
                }
              }}
            >
              {section.body}
            </ReactMarkdown>
          </div>
        </section>
      ))}
    </article>
  );
}
