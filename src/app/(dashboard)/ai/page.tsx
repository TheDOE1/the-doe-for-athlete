"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  RESEARCH_ARTICLES,
  ARTICLE_TAGS,
  type ResearchArticle,
  type ArticleTag,
} from "@/lib/data/research-articles";
import {
  processMessage,
  generateConversationTitle,
  type AISource,
} from "@/lib/ai/chat";
import { SUGGESTED_QUESTIONS } from "@/lib/ai/prompts";
import {
  Brain,
  Send,
  Plus,
  MessageSquare,
  BookOpen,
  AlertTriangle,
  ExternalLink,
  Search,
  ChevronRight,
  Sparkles,
  Clock,
  User,
  Trash2,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: AISource[];
  showDisclaimer?: boolean;
  timestamp: Date;
}

interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
}

// ─── Markdown Renderer ────────────────────────────────────────────────────────

function renderLine(line: string, key: number) {
  // Heading
  if (line.startsWith("**") && line.endsWith("**") && line.length > 4) {
    const text = line.slice(2, -2);
    return (
      <p key={key} className="font-bold text-white mt-3 mb-1">
        {text}
      </p>
    );
  }
  // H3-like bold prefix
  if (line.startsWith("**") && line.includes("**")) {
    const parts = line.split(/\*\*(.*?)\*\*/g);
    return (
      <p key={key} className="text-sm text-zinc-200 leading-relaxed">
        {parts.map((part, i) =>
          i % 2 === 1 ? (
            <strong key={i} className="text-white font-semibold">
              {part}
            </strong>
          ) : (
            part
          )
        )}
      </p>
    );
  }
  // HR
  if (line === "---") {
    return <hr key={key} className="border-zinc-700/50 my-3" />;
  }
  // Bullet
  if (line.startsWith("- ") || line.startsWith("✓ ") || line.startsWith("✗ ")) {
    const isGreen = line.startsWith("✓");
    const isRed = line.startsWith("✗");
    const text = line.slice(2);
    const parts = text.split(/\*\*(.*?)\*\*/g);
    return (
      <li
        key={key}
        className={cn(
          "flex items-start gap-1.5 text-sm leading-relaxed",
          isGreen ? "text-emerald-300" : isRed ? "text-red-300" : "text-zinc-300"
        )}
      >
        <span className="mt-0.5 shrink-0">
          {isGreen ? "✓" : isRed ? "✗" : "•"}
        </span>
        <span>
          {parts.map((p, i) =>
            i % 2 === 1 ? (
              <strong key={i} className="text-white font-semibold">
                {p}
              </strong>
            ) : (
              p
            )
          )}
        </span>
      </li>
    );
  }
  // Numbered list
  if (/^\d+\.\s/.test(line)) {
    const text = line.replace(/^\d+\.\s/, "");
    const parts = text.split(/\*\*(.*?)\*\*/g);
    return (
      <li key={key} className="text-sm text-zinc-300 leading-relaxed ml-4 list-decimal">
        {parts.map((p, i) =>
          i % 2 === 1 ? (
            <strong key={i} className="text-white font-semibold">
              {p}
            </strong>
          ) : (
            p
          )
        )}
      </li>
    );
  }
  // Table row
  if (line.startsWith("|") && line.endsWith("|")) {
    const cells = line
      .split("|")
      .slice(1, -1)
      .map((c) => c.trim());
    const isSeparator = cells.every((c) => /^[-:]+$/.test(c));
    if (isSeparator) return null;
    return (
      <tr key={key} className="border-b border-zinc-700/50">
        {cells.map((cell, i) => {
          const parts = cell.split(/\*\*(.*?)\*\*/g);
          return (
            <td
              key={i}
              className="px-3 py-1.5 text-xs text-zinc-300 first:text-zinc-200 first:font-medium"
            >
              {parts.map((p, j) =>
                j % 2 === 1 ? (
                  <strong key={j} className="text-white">
                    {p}
                  </strong>
                ) : (
                  p
                )
              )}
            </td>
          );
        })}
      </tr>
    );
  }
  // Quote / callout
  if (line.startsWith("> ")) {
    const text = line.slice(2);
    return (
      <blockquote
        key={key}
        className="border-l-2 border-violet-500/60 pl-3 text-xs text-zinc-400 italic my-1"
      >
        {text}
      </blockquote>
    );
  }
  // Empty line
  if (line.trim() === "") {
    return <div key={key} className="h-1" />;
  }
  // Regular paragraph
  const parts = line.split(/\*\*(.*?)\*\*/g);
  return (
    <p key={key} className="text-sm text-zinc-300 leading-relaxed">
      {parts.map((p, i) =>
        i % 2 === 1 ? (
          <strong key={i} className="text-white font-semibold">
            {p}
          </strong>
        ) : (
          p
        )
      )}
    </p>
  );
}

function MarkdownContent({ content }: { content: string }) {
  const lines = content.split("\n");

  // Detect table blocks
  const rendered: React.ReactNode[] = [];
  let tableRows: React.ReactNode[] = [];
  let inTable = false;

  lines.forEach((line, i) => {
    const isTableRow = line.startsWith("|") && line.endsWith("|");

    if (isTableRow) {
      const cells = line
        .split("|")
        .slice(1, -1)
        .map((c) => c.trim());
      const isSeparator = cells.every((c) => /^[-:]+$/.test(c));

      if (!inTable) {
        inTable = true;
        // First row is header
        tableRows = [
          <tr key={`h-${i}`} className="border-b border-zinc-600/50">
            {cells.map((cell, j) => (
              <th
                key={j}
                className="px-3 py-2 text-left text-xs font-semibold text-zinc-200"
              >
                {cell}
              </th>
            ))}
          </tr>,
        ];
      } else if (!isSeparator) {
        const parts_row = cells.map((cell, j) => {
          const ps = cell.split(/\*\*(.*?)\*\*/g);
          return (
            <td key={j} className="px-3 py-1.5 text-xs text-zinc-300">
              {ps.map((p, k) =>
                k % 2 === 1 ? (
                  <strong key={k} className="text-white">
                    {p}
                  </strong>
                ) : (
                  p
                )
              )}
            </td>
          );
        });
        tableRows.push(
          <tr key={`r-${i}`} className="border-b border-zinc-700/30">
            {parts_row}
          </tr>
        );
      }
    } else {
      if (inTable) {
        rendered.push(
          <div key={`table-${i}`} className="overflow-x-auto my-3 rounded-lg border border-zinc-700/50">
            <table className="w-full text-left">{tableRows}</table>
          </div>
        );
        tableRows = [];
        inTable = false;
      }

      // Check if we're inside a list block
      const isList =
        line.startsWith("- ") ||
        line.startsWith("✓ ") ||
        line.startsWith("✗ ") ||
        /^\d+\.\s/.test(line);

      if (isList) {
        const renderedLine = renderLine(line, i);
        if (renderedLine) {
          rendered.push(
            <ul key={`ul-${i}`} className="space-y-1 my-1 ml-1">
              {renderedLine}
            </ul>
          );
        }
      } else {
        const renderedLine = renderLine(line, i);
        if (renderedLine) rendered.push(renderedLine);
      }
    }
  });

  if (inTable && tableRows.length > 0) {
    rendered.push(
      <div key="table-end" className="overflow-x-auto my-3 rounded-lg border border-zinc-700/50">
        <table className="w-full text-left">{tableRows}</table>
      </div>
    );
  }

  return <div className="space-y-0.5">{rendered}</div>;
}

// ─── Typing Indicator ─────────────────────────────────────────────────────────

function TypingIndicator() {
  return (
    <div className="flex items-start gap-3 px-4 py-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-violet-900/50 border border-violet-700/50">
        <Brain className="h-4 w-4 text-violet-400" />
      </div>
      <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-sm bg-zinc-800/80 border border-violet-900/30 px-4 py-3">
        <span className="h-2 w-2 rounded-full bg-violet-400 animate-bounce [animation-delay:0ms]" />
        <span className="h-2 w-2 rounded-full bg-violet-400 animate-bounce [animation-delay:150ms]" />
        <span className="h-2 w-2 rounded-full bg-violet-400 animate-bounce [animation-delay:300ms]" />
      </div>
    </div>
  );
}

// ─── Message Bubble ───────────────────────────────────────────────────────────

function UserBubble({ message }: { message: Message }) {
  return (
    <div className="flex items-start justify-end gap-3 px-4 py-2">
      <div className="max-w-[75%] space-y-1">
        <div className="rounded-2xl rounded-tr-sm bg-indigo-600 px-4 py-3 text-sm text-white shadow-lg shadow-indigo-900/30">
          {message.content}
        </div>
        <p className="text-right text-[10px] text-zinc-600">
          {message.timestamp.toLocaleTimeString("fr-FR", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-700 border border-zinc-600">
        <User className="h-4 w-4 text-zinc-300" />
      </div>
    </div>
  );
}

function AssistantBubble({ message }: { message: Message }) {
  const [expandedSource, setExpandedSource] = useState<number | null>(null);

  return (
    <div className="flex items-start gap-3 px-4 py-2">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-violet-900/50 border border-violet-700/50 shadow-lg shadow-violet-900/20">
        <Brain className="h-4 w-4 text-violet-400" />
      </div>
      <div className="max-w-[85%] space-y-2">
        {/* Disclaimer */}
        {message.showDisclaimer && (
          <div className="flex items-start gap-2 rounded-lg border border-amber-700/40 bg-amber-950/20 px-3 py-2">
            <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-amber-400 mt-0.5" />
            <p className="text-[11px] text-amber-200/80">
              Information à titre éducatif uniquement. Toute décision clinique doit être prise avec un médecin du sport ou kinésithérapeute certifié.
            </p>
          </div>
        )}

        {/* Message content */}
        <div className="rounded-2xl rounded-tl-sm border border-violet-900/30 bg-zinc-800/80 px-4 py-3 shadow-lg shadow-black/20">
          <MarkdownContent content={message.content} />
        </div>

        {/* Sources */}
        {message.sources && message.sources.length > 0 && (
          <div className="space-y-1.5">
            <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-600">
              Références scientifiques
            </p>
            <div className="flex flex-wrap gap-1.5">
              {message.sources.map((source, i) => (
                <button
                  key={i}
                  onClick={() => setExpandedSource(expandedSource === i ? null : i)}
                  className={cn(
                    "flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] transition-all",
                    expandedSource === i
                      ? "border-violet-600 bg-violet-900/30 text-violet-200"
                      : "border-zinc-700 text-zinc-500 hover:border-zinc-600 hover:text-zinc-400"
                  )}
                >
                  <BookOpen className="h-2.5 w-2.5" />
                  {source.authors.split(",")[0]} {source.year}
                </button>
              ))}
            </div>

            {expandedSource !== null && message.sources[expandedSource] && (
              <div className="rounded-lg border border-violet-900/30 bg-zinc-900 p-3 text-[11px] space-y-1">
                <p className="font-medium text-zinc-200 leading-snug">
                  {message.sources[expandedSource]!.title}
                </p>
                <p className="text-zinc-500">
                  {message.sources[expandedSource]!.authors}
                </p>
                <p className="text-violet-400">
                  {message.sources[expandedSource]!.journal} · {message.sources[expandedSource]!.year}
                </p>
                {message.sources[expandedSource]!.doi && (
                  <a
                    href={`https://doi.org/${message.sources[expandedSource]!.doi}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    <ExternalLink className="h-2.5 w-2.5" />
                    DOI: {message.sources[expandedSource]!.doi}
                  </a>
                )}
              </div>
            )}
          </div>
        )}

        <p className="text-[10px] text-zinc-600">
          {message.timestamp.toLocaleTimeString("fr-FR", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>
    </div>
  );
}

// ─── Conversation Sidebar ─────────────────────────────────────────────────────

function ConversationSidebar({
  conversations,
  activeId,
  onSelect,
  onNew,
  onDelete,
}: {
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="flex h-full flex-col border-r border-zinc-800/70 bg-zinc-950/50">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-800/70 px-4 py-4">
        <div className="flex items-center gap-2">
          <Brain className="h-4 w-4 text-violet-400" />
          <span className="text-sm font-semibold text-white">Conversations</span>
        </div>
        <button
          onClick={onNew}
          className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-700 hover:bg-violet-600 transition-colors"
          title="Nouvelle conversation"
        >
          <Plus className="h-3.5 w-3.5 text-white" />
        </button>
      </div>

      {/* Conversations list */}
      <div className="flex-1 overflow-y-auto py-2">
        {conversations.length === 0 ? (
          <div className="px-4 py-6 text-center">
            <MessageSquare className="mx-auto h-8 w-8 text-zinc-700 mb-2" />
            <p className="text-xs text-zinc-600">Aucune conversation</p>
            <p className="text-[11px] text-zinc-700 mt-1">Posez une question pour commencer</p>
          </div>
        ) : (
          conversations.map((conv) => (
            <div
              key={conv.id}
              className={cn(
                "group relative mx-2 mb-0.5 cursor-pointer rounded-lg px-3 py-2.5 transition-all",
                activeId === conv.id
                  ? "bg-violet-900/30 border border-violet-800/40"
                  : "hover:bg-zinc-800/50"
              )}
              onClick={() => onSelect(conv.id)}
            >
              <p className={cn(
                "truncate text-sm font-medium",
                activeId === conv.id ? "text-violet-200" : "text-zinc-300"
              )}>
                {conv.title}
              </p>
              <div className="flex items-center gap-1 mt-0.5">
                <Clock className="h-2.5 w-2.5 text-zinc-600" />
                <p className="text-[10px] text-zinc-600">
                  {conv.createdAt.toLocaleDateString("fr-FR", {
                    day: "2-digit",
                    month: "short",
                  })}
                </p>
                <span className="text-[10px] text-zinc-700">
                  · {conv.messages.length} msg
                </span>
              </div>

              {/* Delete button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(conv.id);
                }}
                className="absolute right-2 top-2.5 hidden rounded p-1 text-zinc-600 hover:bg-red-900/30 hover:text-red-400 group-hover:flex transition-colors"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-zinc-800/70 px-4 py-3">
        <p className="text-[10px] text-zinc-700">
          The Doe For Athlete · Phase 6
        </p>
      </div>
    </div>
  );
}

// ─── Empty Chat State ─────────────────────────────────────────────────────────

function EmptyChatState({ onSuggestion }: { onSuggestion: (q: string) => void }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-12">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-900/50 to-indigo-900/50 border border-violet-700/30 shadow-xl shadow-violet-900/20">
        <Brain className="h-8 w-8 text-violet-400" />
      </div>
      <h3 className="mb-1 text-lg font-bold text-white">Assistant Coach IA</h3>
      <p className="mb-6 max-w-sm text-center text-sm text-zinc-500">
        Posez une question sur la prévention, la réathlétisation, la nutrition ou la performance. Chaque réponse est basée sur des données scientifiques.
      </p>

      <div className="grid w-full max-w-lg gap-2 sm:grid-cols-2">
        {SUGGESTED_QUESTIONS.map((q) => (
          <button
            key={q.id}
            onClick={() => onSuggestion(q.text)}
            className="group flex items-start gap-3 rounded-xl border border-zinc-800 bg-zinc-900/50 p-3 text-left transition-all hover:border-violet-700/50 hover:bg-violet-950/20"
          >
            <span className="text-xl leading-none">{q.icon}</span>
            <div>
              <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-600 group-hover:text-violet-500 transition-colors">
                {q.category}
              </p>
              <p className="mt-0.5 text-xs text-zinc-400 leading-relaxed group-hover:text-zinc-300 transition-colors">
                {q.text}
              </p>
            </div>
            <ChevronRight className="ml-auto h-3.5 w-3.5 shrink-0 text-zinc-700 group-hover:text-violet-500 transition-colors mt-0.5" />
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Article Card ─────────────────────────────────────────────────────────────

const TAG_GRADIENTS: Record<ArticleTag, string> = {
  prévention: "from-orange-950/40 to-zinc-900 border-orange-800/30",
  performance: "from-blue-950/40 to-zinc-900 border-blue-800/30",
  récupération: "from-emerald-950/40 to-zinc-900 border-emerald-800/30",
  nutrition: "from-amber-950/40 to-zinc-900 border-amber-800/30",
  femmes: "from-pink-950/40 to-zinc-900 border-pink-800/30",
};

function ArticleCard({ article }: { article: ResearchArticle }) {
  const [expanded, setExpanded] = useState(false);
  const primaryTag = article.tags[0] ?? "performance";
  const gradient = TAG_GRADIENTS[primaryTag] ?? TAG_GRADIENTS.performance;

  return (
    <div
      className={cn(
        "group relative flex flex-col rounded-xl border bg-gradient-to-br p-4 transition-all hover:shadow-lg hover:shadow-black/30 cursor-pointer",
        gradient
      )}
      onClick={() => setExpanded((v) => !v)}
    >
      {/* Header */}
      <div className="mb-3 flex items-start justify-between gap-2">
        <div className="flex flex-wrap gap-1">
          {article.tags.map((tag) => {
            const tagInfo = ARTICLE_TAGS.find((t) => t.id === tag);
            return (
              <span
                key={tag}
                className={cn(
                  "rounded-full border px-2 py-0.5 text-[10px] font-medium",
                  tagInfo?.color ?? "bg-zinc-800 text-zinc-400 border-zinc-700"
                )}
              >
                {tagInfo?.label ?? tag}
              </span>
            );
          })}
        </div>
        {article.isNew && (
          <Badge className="shrink-0 bg-violet-700 text-white text-[10px] px-2 py-0.5 flex items-center gap-1">
            <Sparkles className="h-2.5 w-2.5" />
            Nouveau
          </Badge>
        )}
      </div>

      {/* Title */}
      <h3 className="mb-2 text-sm font-semibold text-white leading-snug line-clamp-2 group-hover:line-clamp-none transition-all">
        {article.title}
      </h3>

      {/* Authors + journal */}
      <p className="text-[11px] text-zinc-500 mb-0.5">
        {article.authors.slice(0, 3).join(", ")}
        {article.authors.length > 3 && " et al."}
      </p>
      <p className="text-[11px] text-zinc-600">
        <span className="italic">{article.journal}</span> · {article.year}
      </p>

      {/* Abstract */}
      <div
        className={cn(
          "mt-3 overflow-hidden transition-all duration-300",
          expanded ? "max-h-[500px]" : "max-h-0"
        )}
      >
        <div className="border-t border-zinc-700/50 pt-3">
          <p className="text-xs text-zinc-400 leading-relaxed">{article.abstract}</p>
          {article.doi && (
            <a
              href={`https://doi.org/${article.doi}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="mt-2 inline-flex items-center gap-1 text-[11px] text-blue-400 hover:text-blue-300 transition-colors"
            >
              <ExternalLink className="h-2.5 w-2.5" />
              {article.doi}
            </a>
          )}
        </div>
      </div>

      {/* Expand hint */}
      <div className="mt-2 flex items-center gap-1 text-[10px] text-zinc-600 group-hover:text-zinc-500 transition-colors">
        <ChevronRight
          className={cn(
            "h-3 w-3 transition-transform",
            expanded ? "rotate-90" : ""
          )}
        />
        {expanded ? "Réduire" : "Voir le résumé"}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AIPage() {
  const [activeTab, setActiveTab] = useState<"chat" | "research">("chat");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [selectedTag, setSelectedTag] = useState<ArticleTag | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversations, isTyping]);

  const activeConversation = conversations.find((c) => c.id === activeConvId) ?? null;

  const handleNewConversation = useCallback(() => {
    setActiveConvId(null);
    setInputValue("");
    textareaRef.current?.focus();
  }, []);

  const handleSelectConversation = useCallback((id: string) => {
    setActiveConvId(id);
  }, []);

  const handleDeleteConversation = useCallback(
    (id: string) => {
      setConversations((prev) => prev.filter((c) => c.id !== id));
      if (activeConvId === id) setActiveConvId(null);
    },
    [activeConvId]
  );

  const handleSend = useCallback(
    async (overrideMessage?: string) => {
      const text = (overrideMessage ?? inputValue).trim();
      if (!text || isTyping) return;

      setInputValue("");

      // Create user message
      const userMessage: Message = {
        id: crypto.randomUUID(),
        role: "user",
        content: text,
        timestamp: new Date(),
      };

      let convId = activeConvId;

      // Create new conversation if needed
      if (!convId) {
        const title = generateConversationTitle(text);
        const newConv: Conversation = {
          id: crypto.randomUUID(),
          title,
          messages: [userMessage],
          createdAt: new Date(),
        };
        setConversations((prev) => [newConv, ...prev]);
        setActiveConvId(newConv.id);
        convId = newConv.id;
      } else {
        setConversations((prev) =>
          prev.map((c) =>
            c.id === convId
              ? { ...c, messages: [...c.messages, userMessage] }
              : c
          )
        );
      }

      // Show typing indicator
      setIsTyping(true);

      // Simulate response delay
      const delay = 1200 + Math.random() * 800;
      setTimeout(() => {
        const aiResp = processMessage(text);
        const assistantMessage: Message = {
          id: crypto.randomUUID(),
          role: "assistant",
          content: aiResp.content,
          sources: aiResp.sources,
          showDisclaimer: aiResp.showDisclaimer,
          timestamp: new Date(),
        };

        setConversations((prev) =>
          prev.map((c) =>
            c.id === convId
              ? { ...c, messages: [...c.messages, assistantMessage] }
              : c
          )
        );
        setIsTyping(false);
      }, delay);
    },
    [inputValue, isTyping, activeConvId]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  };

  // Filtered articles
  const filteredArticles = (() => {
    let articles = RESEARCH_ARTICLES;
    if (selectedTag) {
      articles = articles.filter((a) => a.tags.includes(selectedTag));
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      articles = articles.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.abstract.toLowerCase().includes(q) ||
          a.authors.some((au) => au.toLowerCase().includes(q))
      );
    }
    return articles;
  })();

  return (
    <div className="flex h-[calc(100vh-3rem)] flex-col space-y-0 -m-6">
      {/* ── Medical Disclaimer Banner ── */}
      <div className="flex items-center gap-2 border-b border-amber-900/30 bg-amber-950/20 px-6 py-2 shrink-0">
        <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-amber-400" />
        <p className="text-[11px] text-amber-200/80">
          <strong className="text-amber-300">Avertissement médical :</strong>{" "}
          Les informations fournies sont à titre éducatif uniquement et ne remplacent pas un avis médical professionnel. Consultez toujours un médecin du sport ou kinésithérapeute avant d&apos;appliquer un protocole clinique.
        </p>
      </div>

      {/* ── Header ── */}
      <div className="flex items-center justify-between border-b border-zinc-800/70 bg-zinc-950/80 px-6 py-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-700 to-indigo-700 shadow-lg shadow-violet-900/30">
            <Brain className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">Science & IA</h1>
            <p className="text-xs text-zinc-500">Assistant Coach · Recherches Scientifiques</p>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex rounded-xl bg-zinc-900 p-1">
          <button
            onClick={() => setActiveTab("chat")}
            className={cn(
              "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all",
              activeTab === "chat"
                ? "bg-violet-700 text-white shadow-sm"
                : "text-zinc-400 hover:text-white"
            )}
          >
            <Brain className="h-4 w-4" />
            Assistant Coach
          </button>
          <button
            onClick={() => setActiveTab("research")}
            className={cn(
              "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all",
              activeTab === "research"
                ? "bg-violet-700 text-white shadow-sm"
                : "text-zinc-400 hover:text-white"
            )}
          >
            <BookOpen className="h-4 w-4" />
            Recherches ({RESEARCH_ARTICLES.length})
          </button>
        </div>
      </div>

      {/* ── Chat Tab ── */}
      {activeTab === "chat" && (
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <div className="w-56 shrink-0">
            <ConversationSidebar
              conversations={conversations}
              activeId={activeConvId}
              onSelect={handleSelectConversation}
              onNew={handleNewConversation}
              onDelete={handleDeleteConversation}
            />
          </div>

          {/* Chat area */}
          <div className="flex flex-1 flex-col overflow-hidden bg-zinc-950">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto py-4">
              {!activeConversation || activeConversation.messages.length === 0 ? (
                <EmptyChatState onSuggestion={(q) => void handleSend(q)} />
              ) : (
                <>
                  {activeConversation.messages.map((msg) =>
                    msg.role === "user" ? (
                      <UserBubble key={msg.id} message={msg} />
                    ) : (
                      <AssistantBubble key={msg.id} message={msg} />
                    )
                  )}
                  {isTyping && <TypingIndicator />}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Input area */}
            <div className="shrink-0 border-t border-zinc-800/70 bg-zinc-950/90 p-4">
              <div className="flex items-end gap-3 rounded-2xl border border-zinc-700/70 bg-zinc-900 px-4 py-3 focus-within:border-violet-600/60 transition-colors">
                <textarea
                  ref={textareaRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ex : Mon ailier a une déchirure ischio grade 2 depuis 3 semaines, il a peur de sprinter..."
                  rows={2}
                  className="flex-1 resize-none bg-transparent text-sm text-white placeholder-zinc-600 focus:outline-none"
                  disabled={isTyping}
                />
                <button
                  onClick={() => void handleSend()}
                  disabled={!inputValue.trim() || isTyping}
                  className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-all",
                    inputValue.trim() && !isTyping
                      ? "bg-violet-600 hover:bg-violet-500 shadow-lg shadow-violet-900/40 text-white"
                      : "bg-zinc-800 text-zinc-600"
                  )}
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
              <p className="mt-2 text-center text-[10px] text-zinc-700">
                Appuyez sur Entrée pour envoyer · Shift+Entrée pour nouvelle ligne
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Research Tab ── */}
      {activeTab === "research" && (
        <div className="flex flex-1 flex-col overflow-hidden bg-zinc-950">
          {/* Filters */}
          <div className="shrink-0 border-b border-zinc-800/70 px-6 py-4 space-y-3">
            {/* Search */}
            <div className="flex items-center gap-2 rounded-xl border border-zinc-700/70 bg-zinc-900 px-4 py-2.5 focus-within:border-violet-600/60 transition-colors max-w-lg">
              <Search className="h-4 w-4 shrink-0 text-zinc-600" />
              <input
                type="text"
                placeholder="Rechercher un auteur, un concept..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent text-sm text-white placeholder-zinc-600 focus:outline-none"
              />
            </div>

            {/* Tag filters */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedTag(null)}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs font-medium transition-all",
                  selectedTag === null
                    ? "border-violet-600 bg-violet-900/40 text-violet-200"
                    : "border-zinc-700 text-zinc-500 hover:border-zinc-600 hover:text-zinc-400"
                )}
              >
                Tous ({RESEARCH_ARTICLES.length})
              </button>
              {ARTICLE_TAGS.map((tag) => {
                const count = RESEARCH_ARTICLES.filter((a) =>
                  a.tags.includes(tag.id)
                ).length;
                return (
                  <button
                    key={tag.id}
                    onClick={() =>
                      setSelectedTag((t) => (t === tag.id ? null : tag.id))
                    }
                    className={cn(
                      "rounded-full border px-3 py-1 text-xs font-medium transition-all",
                      selectedTag === tag.id
                        ? tag.color
                        : "border-zinc-700 text-zinc-500 hover:border-zinc-600 hover:text-zinc-400"
                    )}
                  >
                    {tag.label} ({count})
                  </button>
                );
              })}
            </div>
          </div>

          {/* Articles grid */}
          <div className="flex-1 overflow-y-auto p-6">
            {filteredArticles.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <BookOpen className="h-10 w-10 text-zinc-700 mb-3" />
                <p className="text-zinc-500">Aucun article trouvé</p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedTag(null);
                    setSearchQuery("");
                  }}
                  className="mt-3 text-zinc-500 hover:text-white"
                >
                  Réinitialiser les filtres
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {filteredArticles.map((article) => (
                  <ArticleCard key={article.id} article={article} />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
