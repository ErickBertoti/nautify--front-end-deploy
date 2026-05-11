'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Paperclip, Upload, X, Loader2, FileText, ExternalLink } from 'lucide-react';
import { uploadFile, deleteFile, getStoragePathFromPublicUrl } from '@/lib/storage';
import { attachmentService } from '@/services';
import { useToast } from '@/components/ui/Toast';
import { Button } from '@/components/ui/Button';
import { getErrorMessage } from '@/lib/errors';
import type { Attachment, AttachmentEntityType, AllowedAttachmentMime } from '@/types';

const ACCEPT = 'application/pdf,image/jpeg,image/png,image/webp';
const ALLOWED: AllowedAttachmentMime[] = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
const MAX_BYTES = 20 * 1024 * 1024; // matches bucket limit

interface Props {
  entityType: AttachmentEntityType;
  entityId: string;
  // Optional folder to namespace uploads inside the bucket (e.g. "expenses")
  storageFolder?: string;
  label?: string;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function IconForMime({ mime, className }: { mime: string; className?: string }) {
  if (mime.startsWith('image/')) {
    // Browsers handle <img> rendering; use ExternalLink/FileText for non-image
    return <FileText className={className} />;
  }
  return <FileText className={className} />;
}

export function AttachmentUploader({ entityType, entityId, storageFolder, label }: Props) {
  const toast = useToast();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [items, setItems] = useState<Attachment[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        const { data } = await attachmentService.list(entityType, entityId);
        if (!cancelled) setItems(data ?? []);
      } catch (err) {
        if (!cancelled) toast.error(getErrorMessage(err, 'Erro ao carregar anexos'));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    if (entityId) load();
    return () => { cancelled = true; };
  // toast is stable from context; entityType/entityId are the keys we care about
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entityType, entityId]);

  const handlePick = () => inputRef.current?.click();

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    for (const file of Array.from(files)) {
      if (!ALLOWED.includes(file.type as AllowedAttachmentMime)) {
        toast.warning(`Tipo nao suportado: ${file.name}`);
        continue;
      }
      if (file.size > MAX_BYTES) {
        toast.warning(`${file.name} excede 20MB`);
        continue;
      }
      try {
        setUploading(true);
        const folder = storageFolder ?? `${entityType}s/${entityId}`;
        const { url, path } = await uploadFile(folder, file);
        const { data } = await attachmentService.create({
          entityType,
          entityId,
          fileUrl: url,
          fileName: file.name,
          fileSize: file.size,
          mimeType: file.type as AllowedAttachmentMime,
          storagePath: path,
        });
        setItems((prev) => [data, ...prev]);
        toast.success('Anexo enviado');
      } catch (err) {
        toast.error(getErrorMessage(err, `Falha ao enviar ${file.name}`));
      } finally {
        setUploading(false);
      }
    }
    if (inputRef.current) inputRef.current.value = '';
  };

  const handleRemove = async (att: Attachment) => {
    if (!confirm(`Remover anexo "${att.fileName}"?`)) return;
    try {
      await attachmentService.delete(att.id);
      // Try to also clean the Storage file (best-effort; orphans wont break logic)
      const path = att.storagePath || getStoragePathFromPublicUrl(att.fileUrl);
      if (path) {
        try { await deleteFile(path); } catch { /* orphan tolerated */ }
      }
      setItems((prev) => prev.filter((x) => x.id !== att.id));
    } catch (err) {
      toast.error(getErrorMessage(err, 'Erro ao remover anexo'));
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Paperclip className="h-4 w-4 text-muted-foreground" />
          {label ?? 'Anexos'}
          <span className="text-xs text-muted-foreground">({items.length})</span>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handlePick}
          disabled={uploading || !entityId}
        >
          {uploading ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <Upload className="h-3.5 w-3.5 mr-1.5" />}
          Enviar
        </Button>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-16">
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        </div>
      ) : items.length === 0 ? (
        <p className="text-xs text-muted-foreground">Nenhum anexo. Aceita PDF, JPG, PNG, WEBP até 20MB.</p>
      ) : (
        <ul className="divide-y divide-border rounded-lg border border-border bg-muted/20">
          {items.map((att) => (
            <li key={att.id} className="flex items-center gap-3 px-3 py-2">
              <IconForMime mime={att.mimeType} className="h-4 w-4 text-muted-foreground shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{att.fileName}</p>
                <p className="text-[11px] text-muted-foreground">
                  {att.mimeType} · {formatSize(att.fileSize)}
                </p>
              </div>
              <a
                href={att.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground"
                title="Abrir"
              >
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
              <button
                type="button"
                onClick={() => handleRemove(att)}
                className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-red-600"
                title="Remover"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
