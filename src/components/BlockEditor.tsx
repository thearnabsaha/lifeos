"use client";

import { useState, useRef, useEffect, useCallback, KeyboardEvent } from "react";
import { cn } from "@/lib/utils";
import { Type, Heading1, Heading2, Heading3, List, CheckSquare } from "lucide-react";

export type BlockType = "text" | "h1" | "h2" | "h3" | "bullet" | "todo";

export interface Block {
  id: string;
  type: BlockType;
  content: string;
  checked?: boolean;
}

interface BlockEditorProps {
  blocks: Block[];
  onChange: (blocks: Block[]) => void;
}

const SLASH_ITEMS: { type: BlockType; label: string; icon: React.ElementType; desc: string }[] = [
  { type: "text", label: "Text", icon: Type, desc: "Plain text" },
  { type: "h1", label: "Heading 1", icon: Heading1, desc: "Large heading" },
  { type: "h2", label: "Heading 2", icon: Heading2, desc: "Medium heading" },
  { type: "h3", label: "Heading 3", icon: Heading3, desc: "Small heading" },
  { type: "bullet", label: "Bullet List", icon: List, desc: "Bullet point" },
  { type: "todo", label: "To-do", icon: CheckSquare, desc: "Checkbox item" },
];

let nextId = 1;
function genBlockId() {
  return "b-" + Date.now() + "-" + (nextId++);
}

export function blocksToText(blocks: Block[]): string {
  return blocks.map((b) => {
    const prefix = b.type === "h1" ? "# " : b.type === "h2" ? "## " : b.type === "h3" ? "### " :
      b.type === "bullet" ? "- " : b.type === "todo" ? (b.checked ? "- [x] " : "- [ ] ") : "";
    return prefix + b.content;
  }).join("\n");
}

export function textToBlocks(text: string): Block[] {
  if (!text.trim()) return [{ id: genBlockId(), type: "text", content: "" }];
  return text.split("\n").map((line) => {
    if (line.startsWith("### ")) return { id: genBlockId(), type: "h3" as BlockType, content: line.slice(4) };
    if (line.startsWith("## ")) return { id: genBlockId(), type: "h2" as BlockType, content: line.slice(3) };
    if (line.startsWith("# ")) return { id: genBlockId(), type: "h1" as BlockType, content: line.slice(2) };
    if (line.startsWith("- [x] ")) return { id: genBlockId(), type: "todo" as BlockType, content: line.slice(6), checked: true };
    if (line.startsWith("- [ ] ")) return { id: genBlockId(), type: "todo" as BlockType, content: line.slice(6), checked: false };
    if (line.startsWith("- ")) return { id: genBlockId(), type: "bullet" as BlockType, content: line.slice(2) };
    return { id: genBlockId(), type: "text" as BlockType, content: line };
  });
}

function BlockLine({
  block, index, onChange, onKeyDown, onFocus, inputRef,
}: {
  block: Block;
  index: number;
  onChange: (idx: number, data: Partial<Block>) => void;
  onKeyDown: (idx: number, e: KeyboardEvent<HTMLInputElement>) => void;
  onFocus: (idx: number) => void;
  inputRef: (el: HTMLInputElement | null) => void;
}) {
  const cls = block.type === "h1"
    ? "text-2xl font-bold text-zinc-900 dark:text-white"
    : block.type === "h2"
    ? "text-xl font-semibold text-zinc-900 dark:text-white"
    : block.type === "h3"
    ? "text-lg font-semibold text-zinc-800 dark:text-zinc-100"
    : "text-sm text-zinc-700 dark:text-zinc-300";

  const placeholder = block.type === "h1" ? "Heading 1"
    : block.type === "h2" ? "Heading 2"
    : block.type === "h3" ? "Heading 3"
    : block.type === "bullet" ? "List item"
    : block.type === "todo" ? "To-do"
    : "Type / for commands...";

  return (
    <div className="group flex items-start gap-1.5 py-0.5">
      {block.type === "bullet" && (
        <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-zinc-400 dark:bg-zinc-500" />
      )}
      {block.type === "todo" && (
        <button
          onClick={() => onChange(index, { checked: !block.checked })}
          className={cn(
            "mt-[3px] flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded border-[1.5px] transition-all",
            block.checked
              ? "border-accent bg-accent"
              : "border-zinc-300 dark:border-zinc-600 hover:border-accent"
          )}
        >
          {block.checked && (
            <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </button>
      )}
      <input
        ref={inputRef}
        value={block.content}
        onChange={(e) => onChange(index, { content: e.target.value })}
        onKeyDown={(e) => onKeyDown(index, e)}
        onFocus={() => onFocus(index)}
        placeholder={placeholder}
        className={cn(
          "w-full bg-transparent outline-none leading-relaxed",
          "placeholder:text-zinc-300 dark:placeholder:text-zinc-600",
          cls,
          block.type === "todo" && block.checked && "line-through text-zinc-400 dark:text-zinc-500"
        )}
      />
    </div>
  );
}

export function BlockEditor({ blocks, onChange }: BlockEditorProps) {
  const [showSlash, setShowSlash] = useState(false);
  const [slashIdx, setSlashIdx] = useState(-1);
  const [slashFilter, setSlashFilter] = useState("");
  const [focusIdx, setFocusIdx] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const menuRef = useRef<HTMLDivElement>(null);

  const focusBlock = useCallback((idx: number) => {
    setTimeout(() => {
      const el = inputRefs.current[idx];
      if (el) { el.focus(); el.setSelectionRange(el.value.length, el.value.length); }
    }, 0);
  }, []);

  function handleChange(idx: number, data: Partial<Block>) {
    const next = blocks.map((b, i) => i === idx ? { ...b, ...data } : b);

    if (data.content !== undefined) {
      const val = data.content;
      if (val === "/" && blocks[idx].content === "") {
        setShowSlash(true);
        setSlashIdx(idx);
        setSlashFilter("");
        next[idx] = { ...next[idx], content: "" };
        onChange(next);
        return;
      }
      if (showSlash && slashIdx === idx) {
        if (val.startsWith("/")) {
          setSlashFilter(val.slice(1));
        } else {
          setShowSlash(false);
        }
      }
    }

    onChange(next);
  }

  function pickSlashItem(type: BlockType) {
    const next = [...blocks];
    next[slashIdx] = { ...next[slashIdx], type, content: "", checked: type === "todo" ? false : undefined };
    onChange(next);
    setShowSlash(false);
    focusBlock(slashIdx);
  }

  function handleKeyDown(idx: number, e: KeyboardEvent<HTMLInputElement>) {
    if (showSlash && e.key === "Escape") {
      e.preventDefault();
      setShowSlash(false);
      return;
    }

    if (e.key === "Enter") {
      e.preventDefault();
      if (showSlash) {
        const filtered = SLASH_ITEMS.filter((i) =>
          i.label.toLowerCase().includes(slashFilter.toLowerCase())
        );
        if (filtered.length > 0) {
          pickSlashItem(filtered[0].type);
          return;
        }
      }
      const inheritType = blocks[idx].type === "bullet" ? "bullet" : blocks[idx].type === "todo" ? "todo" : "text";
      if ((inheritType === "bullet" || inheritType === "todo") && !blocks[idx].content.trim()) {
        const next = [...blocks];
        next[idx] = { ...next[idx], type: "text", content: "", checked: undefined };
        onChange(next);
        return;
      }
      const newBlock: Block = { id: genBlockId(), type: inheritType, content: "", checked: inheritType === "todo" ? false : undefined };
      const next = [...blocks];
      next.splice(idx + 1, 0, newBlock);
      onChange(next);
      focusBlock(idx + 1);
      return;
    }

    if (e.key === "Backspace" && blocks[idx].content === "" && blocks.length > 1) {
      e.preventDefault();
      if (blocks[idx].type !== "text") {
        const next = [...blocks];
        next[idx] = { ...next[idx], type: "text", checked: undefined };
        onChange(next);
        return;
      }
      const next = blocks.filter((_, i) => i !== idx);
      onChange(next);
      focusBlock(Math.max(0, idx - 1));
      return;
    }

    if (e.key === "ArrowUp" && idx > 0) {
      focusBlock(idx - 1);
    }
    if (e.key === "ArrowDown" && idx < blocks.length - 1) {
      focusBlock(idx + 1);
    }
  }

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowSlash(false);
      }
    }
    if (showSlash) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showSlash]);

  const filteredSlash = SLASH_ITEMS.filter((i) =>
    i.label.toLowerCase().includes(slashFilter.toLowerCase())
  );

  return (
    <div className="relative">
      <div className="space-y-0">
        {blocks.map((block, idx) => (
          <BlockLine
            key={block.id}
            block={block}
            index={idx}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onFocus={setFocusIdx}
            inputRef={(el) => { inputRefs.current[idx] = el; }}
          />
        ))}
      </div>

      {showSlash && filteredSlash.length > 0 && (
        <div
          ref={menuRef}
          className="absolute left-0 z-50 mt-1 w-56 overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-lg dark:border-zinc-700 dark:bg-zinc-900 animate-fade-in"
          style={{ top: `${(slashIdx + 1) * 32}px` }}
        >
          <p className="px-3 pt-2 pb-1 text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Blocks</p>
          {filteredSlash.map(({ type, label, icon: Icon, desc }) => (
            <button
              key={type}
              onClick={() => pickSlashItem(type)}
              className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800">
                <Icon className="h-4 w-4 text-zinc-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-900 dark:text-white">{label}</p>
                <p className="text-[10px] text-zinc-400">{desc}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
