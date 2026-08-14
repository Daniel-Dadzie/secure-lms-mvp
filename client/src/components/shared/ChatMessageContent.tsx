import { Fragment, type ReactNode } from "react";

interface ChatMessageContentProps {
  content: string;
  variant?: "assistant" | "user" | "error";
}

const INLINE_MARKDOWN_PATTERN =
  /(\*\*(.+?)\*\*|\*(.+?)\*|\[(.+?)\]\((https?:\/\/[^\s)]+)\))/g;

function renderInlineMarkdown(text: string, variant: ChatMessageContentProps["variant"]): ReactNode[] {
  const nodes: ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  const linkClassName =
    variant === "user"
      ? "underline underline-offset-2 hover:text-white/90"
      : variant === "error"
        ? "underline underline-offset-2 hover:text-red-800"
        : "font-medium text-[#0A4A3A] underline underline-offset-2 hover:text-[#12503F]";

  INLINE_MARKDOWN_PATTERN.lastIndex = 0;

  while ((match = INLINE_MARKDOWN_PATTERN.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }

    if (match[2]) {
      nodes.push(
        <strong key={`${match.index}-bold`} className="font-semibold">
          {match[2]}
        </strong>
      );
    } else if (match[3]) {
      nodes.push(
        <em key={`${match.index}-italic`} className="italic">
          {match[3]}
        </em>
      );
    } else if (match[4] && match[5]) {
      nodes.push(
        <a
          key={`${match.index}-link`}
          href={match[5]}
          className={linkClassName}
          target="_blank"
          rel="noopener noreferrer"
        >
          {match[4]}
        </a>
      );
    }

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return nodes.length > 0 ? nodes : [text];
}

function renderBlock(line: string, variant: ChatMessageContentProps["variant"]): ReactNode {
  const bulletMatch = line.match(/^[-*]\s+(.*)$/);
  if (bulletMatch) {
    return (
      <li className="ml-4 list-disc marker:text-slate-500">
        {renderInlineMarkdown(bulletMatch[1], variant)}
      </li>
    );
  }

  const numberedMatch = line.match(/^\d+\.\s+(.*)$/);
  if (numberedMatch) {
    return (
      <li className="ml-4 list-decimal marker:text-slate-500">
        {renderInlineMarkdown(numberedMatch[1], variant)}
      </li>
    );
  }

  return (
    <p className="whitespace-pre-wrap">
      {renderInlineMarkdown(line, variant)}
    </p>
  );
}

export function ChatMessageContent({
  content,
  variant = "assistant",
}: ChatMessageContentProps) {
  const lines = content.split("\n").filter((line, index, allLines) => {
    return line.length > 0 || (index > 0 && index < allLines.length - 1);
  });

  const blocks: ReactNode[] = [];
  let listItems: ReactNode[] = [];
  let listType: "ul" | "ol" | null = null;

  function flushList() {
    if (listItems.length === 0 || !listType) return;

    blocks.push(
      listType === "ul" ? (
        <ul key={`list-${blocks.length}`} className="my-1 space-y-1">
          {listItems}
        </ul>
      ) : (
        <ol key={`list-${blocks.length}`} className="my-1 space-y-1">
          {listItems}
        </ol>
      )
    );

    listItems = [];
    listType = null;
  }

  for (const line of lines) {
    const trimmed = line.trim();

    if (/^[-*]\s+/.test(trimmed)) {
      if (listType === "ol") flushList();
      listType = "ul";
      listItems.push(renderBlock(trimmed, variant));
      continue;
    }

    if (/^\d+\.\s+/.test(trimmed)) {
      if (listType === "ul") flushList();
      listType = "ol";
      listItems.push(renderBlock(trimmed, variant));
      continue;
    }

    flushList();
    blocks.push(
      <Fragment key={`block-${blocks.length}`}>
        {renderBlock(trimmed, variant)}
      </Fragment>
    );
  }

  flushList();

  return <div className="space-y-1.5">{blocks}</div>;
}
