// Lightweight, dependency-free markdown renderer for TrudyM outputs.
// Supports: headings, bold, italic, inline code, lists, blockquotes, paragraphs.

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function inline(s: string) {
  let out = escapeHtml(s);
  out = out.replace(/`([^`]+)`/g, '<code class="rounded bg-muted px-1 py-0.5 text-[0.85em]">$1</code>');
  out = out.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  out = out.replace(/\*([^*]+)\*/g, "<em>$1</em>");
  out = out.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    '<a href="$2" target="_blank" rel="noreferrer" class="text-primary underline underline-offset-2">$1</a>',
  );
  return out;
}

export function Markdown({ text }: { text: string }) {
  const lines = text.split(/\r?\n/);
  const blocks: string[] = [];
  let list: string[] | null = null;
  let para: string[] = [];

  const flushList = () => {
    if (list) {
      blocks.push(
        `<ul class="my-2 list-disc space-y-1 pl-5">${list.map((li) => `<li>${inline(li)}</li>`).join("")}</ul>`,
      );
      list = null;
    }
  };
  const flushPara = () => {
    if (para.length) {
      blocks.push(`<p class="my-2 leading-relaxed">${inline(para.join(" "))}</p>`);
      para = [];
    }
  };

  for (const raw of lines) {
    const line = raw.trimEnd();
    if (!line.trim()) {
      flushList();
      flushPara();
      continue;
    }
    const h = /^(#{1,4})\s+(.*)$/.exec(line);
    if (h) {
      flushList();
      flushPara();
      const level = h[1].length;
      const size = ["text-2xl", "text-xl", "text-lg", "text-base"][level - 1];
      blocks.push(
        `<h${level} class="mt-4 mb-2 ${size} font-semibold tracking-tight">${inline(h[2])}</h${level}>`,
      );
      continue;
    }
    const li = /^[-*]\s+(.*)$/.exec(line);
    if (li) {
      flushPara();
      list = list ?? [];
      list.push(li[1]);
      continue;
    }
    const bq = /^>\s+(.*)$/.exec(line);
    if (bq) {
      flushList();
      flushPara();
      blocks.push(
        `<blockquote class="my-2 border-l-2 border-primary/40 pl-3 text-muted-foreground">${inline(bq[1])}</blockquote>`,
      );
      continue;
    }
    flushList();
    para.push(line);
  }
  flushList();
  flushPara();

  return (
    <div
      className="text-sm text-foreground [&_h1]:text-foreground [&_h2]:text-foreground [&_h3]:text-foreground"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: blocks.join("") }}
    />
  );
}
