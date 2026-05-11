'use client';

import React, { useState } from 'react';
import Cropper, { type Area } from 'react-easy-crop';
import { Camera, Loader2, ZoomIn, ZoomOut } from 'lucide-react';
import { createCroppedAvatarBlob } from '@/lib/avatar';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';

interface AvatarCropModalProps {
  isOpen: boolean;
  imageUrl: string | null;
  isSubmitting?: boolean;
  onClose: () => void;
  onConfirm: (croppedBlob: Blob) => Promise<void>;
}

const DEFAULT_CROP = { x: 0, y: 0 };

export function AvatarCropModal({
  isOpen,
  imageUrl,
  isSubmitting = false,
  onClose,
  onConfirm,
}: AvatarCropModalProps) {
  const [crop, setCrop] = useState(DEFAULT_CROP);
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [lastImageUrl, setLastImageUrl] = useState<string | null>(imageUrl);

  if (imageUrl !== lastImageUrl) {
    setLastImageUrl(imageUrl);
    setCrop(DEFAULT_CROP);
    setZoom(1);
    setCroppedAreaPixels(null);
  }

  async function handleConfirm() {
    if (!imageUrl || !croppedAreaPixels) {
      return;
    }

    const croppedBlob = await createCroppedAvatarBlob(imageUrl, croppedAreaPixels);
    await onConfirm(croppedBlob);
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={isSubmitting ? () => {} : onClose}
      title="Ajustar foto de perfil"
      description="Posicione a imagem e ajuste o zoom antes de confirmar."
      className="sm:max-w-2xl"
      bodyClassName="space-y-5"
      footer={
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button type="button" onClick={handleConfirm} disabled={!imageUrl || isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Salvando foto...
              </>
            ) : (
              <>
                <Camera className="h-4 w-4" />
                Confirmar foto
              </>
            )}
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="relative h-[320px] overflow-hidden rounded-2xl bg-slate-950 sm:h-[420px]">
          {imageUrl && (
            <Cropper
              image={imageUrl}
              crop={crop}
              zoom={zoom}
              aspect={1}
              cropShape="round"
              showGrid={false}
              zoomWithScroll
              minZoom={1}
              maxZoom={3}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={(_, areaPixels) => setCroppedAreaPixels(areaPixels)}
            />
          )}
        </div>

        <div className="rounded-2xl border border-border/70 bg-muted/40 px-4 py-3">
          <div className="mb-2 flex items-center justify-between text-sm font-medium text-foreground">
            <span>Zoom</span>
            <span>{Math.round(zoom * 100)}%</span>
          </div>
          <div className="flex items-center gap-3">
            <ZoomOut className="h-4 w-4 text-muted-foreground" />
            <input
              type="range"
              min={1}
              max={3}
              step={0.01}
              value={zoom}
              onChange={(event) => setZoom(Number(event.target.value))}
              className="h-2 w-full cursor-pointer accent-primary"
              aria-label="Ajustar zoom da foto"
              disabled={isSubmitting}
            />
            <ZoomIn className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>
      </div>
    </Modal>
  );
}
