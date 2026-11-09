"use client";

import { useState, useEffect, useRef } from "react";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import {
  Image, Mic, FileText, File, X,
  Play, Pause, Download, Plus,
} from "lucide-react";

export interface Attachment {
  id: string;
  file_name: string;
  file_url: string;
  file_type: string;
  file_size: number;
  mime_type: string;
  created_at: string;
}

interface AttachmentsProps {
  parentType: string;
  parentId: string | null;
  compact?: boolean;
}

function formatSize(bytes: number) {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

function AudioPlayer({ url, name }: { url: string; name: string }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);

  function toggle() {
    if (!audioRef.current) return;
    if (playing) { audioRef.current.pause(); } else { audioRef.current.play(); }
    setPlaying(!playing);
  }

  return (
    <div className="flex items-center gap-2">
      <audio ref={audioRef} src={url} onEnded={() => setPlaying(false)} />
      <button onClick={toggle} className="flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
        {playing ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5 ml-0.5" />}
      </button>
      <span className="truncate text-xs text-muted-foreground">{name}</span>
    </div>
  );
}

export function Attachments({ parentType, parentId, compact }: AttachmentsProps) {
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (parentId && !parentId.startsWith("local-")) fetchAttachments();
  }, [parentId]);

  async function fetchAttachments() {
    if (!parentId) return;
    try {
      const data = await api.get<{ attachments: Attachment[] }>(
        `/attachments?parentType=${parentType}&parentId=${parentId}`
      );
      setAttachments(data.attachments);
    } catch {}
  }

  async function handleUpload(files: FileList | null) {
    if (!files || !parentId) return;
    setUploading(true);

    for (const file of Array.from(files)) {
      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("parentType", parentType);
        formData.append("parentId", parentId);

        const token = localStorage.getItem("token");
        const res = await fetch("/api/upload", {
          method: "POST",
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          body: formData,
        });

        if (res.ok) {
          const data = await res.json();
          setAttachments((prev) => [data.attachment, ...prev]);
        }
      } catch {}
    }

    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
  }

  async function handleDelete(id: string) {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
    try { await api.delete(`/attachments/${id}`); } catch {}
  }

  if (!parentId) return null;

  const isLocal = parentId.startsWith("local-");

  const images = attachments.filter((a) => a.file_type === "image");
  const audios = attachments.filter((a) => a.file_type === "audio");
  const pdfs = attachments.filter((a) => a.file_type === "pdf");
  const others = attachments.filter((a) => a.file_type === "other");

  return (
    <div className={cn("space-y-3", compact && "space-y-2")}>
      <input
        ref={fileRef}
        type="file"
        multiple
        accept="image/*,audio/*,.pdf,.doc,.docx,.txt,.csv,.xlsx"
        onChange={(e) => handleUpload(e.target.files)}
        className="hidden"
      />

      <div className="flex items-center gap-1.5">
        <button
          onClick={() => { if (fileRef.current) { fileRef.current.accept = "image/*"; fileRef.current.click(); } }}
          disabled={isLocal || uploading}
          className="inline-flex h-8 items-center gap-1 rounded-full border bg-background px-3 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-40 dark:bg-input/30"
        >
          <Image className="h-3.5 w-3.5" /> Photo
        </button>
        <button
          onClick={() => { if (fileRef.current) { fileRef.current.accept = "audio/*"; fileRef.current.click(); } }}
          disabled={isLocal || uploading}
          className="inline-flex h-8 items-center gap-1 rounded-full border bg-background px-3 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-40 dark:bg-input/30"
        >
          <Mic className="h-3.5 w-3.5" /> Audio
        </button>
        <button
          onClick={() => { if (fileRef.current) { fileRef.current.accept = ".pdf"; fileRef.current.click(); } }}
          disabled={isLocal || uploading}
          className="inline-flex h-8 items-center gap-1 rounded-full border bg-background px-3 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-40 dark:bg-input/30"
        >
          <FileText className="h-3.5 w-3.5" /> PDF
        </button>
        <button
          onClick={() => { if (fileRef.current) { fileRef.current.accept = "*"; fileRef.current.click(); } }}
          disabled={isLocal || uploading}
          className="inline-flex h-8 items-center gap-1 rounded-full border bg-background px-3 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-40 dark:bg-input/30"
        >
          <Plus className="h-3.5 w-3.5" /> File
        </button>
      </div>

      {uploading && (
        <div className="mono-label flex items-center gap-2">
          <div className="size-3.5 animate-spin rounded-full border-2 border-muted border-t-foreground" />
          Uploading…
        </div>
      )}

      {isLocal && attachments.length === 0 && (
        <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Save this item to the cloud first to add attachments</p>
      )}

      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {images.map((a) => (
            <div key={a.id} className="group relative aspect-square overflow-hidden rounded-lg border">
              <img src={a.file_url} alt={a.file_name} className="h-full w-full object-cover" />
              <button
                onClick={() => handleDelete(a.id)}
                className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {audios.map((a) => (
        <div key={a.id} className="flex items-center justify-between rounded-lg border p-2">
          <AudioPlayer url={a.file_url} name={a.file_name} />
          <div className="flex items-center gap-1">
            <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">{formatSize(a.file_size)}</span>
            <button onClick={() => handleDelete(a.id)} className="text-muted-foreground hover:text-destructive">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      ))}

      {[...pdfs, ...others].map((a) => (
        <div key={a.id} className="flex items-center gap-2 rounded-lg border p-2">
          {a.file_type === "pdf" ? (
            <FileText className="h-5 w-5 shrink-0 text-muted-foreground" />
          ) : (
            <File className="h-5 w-5 shrink-0 text-muted-foreground" />
          )}
          <div className="flex-1 min-w-0">
            <p className="truncate text-xs font-medium">{a.file_name}</p>
            <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">{formatSize(a.file_size)}</p>
          </div>
          <a href={a.file_url} target="_blank" rel="noopener" className="text-foreground hover:opacity-70">
            <Download className="h-4 w-4" />
          </a>
          <button onClick={() => handleDelete(a.id)} className="text-muted-foreground hover:text-destructive">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}
