'use client';

import type { Area } from 'react-easy-crop';

const AVATAR_OUTPUT_SIZE = 512;

export const AVATAR_MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;
export const AVATAR_ACCEPTED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;
export const AVATAR_ACCEPT_ATTRIBUTE = AVATAR_ACCEPTED_MIME_TYPES.join(',');

export function validateAvatarFile(file: File): string | null {
  if (!AVATAR_ACCEPTED_MIME_TYPES.includes(file.type as (typeof AVATAR_ACCEPTED_MIME_TYPES)[number])) {
    return 'Selecione uma imagem JPG, PNG ou WEBP.';
  }

  if (file.size > AVATAR_MAX_FILE_SIZE_BYTES) {
    return 'A foto deve ter no maximo 5 MB.';
  }

  return null;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();

    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Nao foi possivel carregar a imagem selecionada.'));
    image.src = src;
  });
}

export async function createCroppedAvatarBlob(
  imageSrc: string,
  croppedAreaPixels: Area,
): Promise<Blob> {
  const image = await loadImage(imageSrc);
  const canvas = document.createElement('canvas');

  canvas.width = AVATAR_OUTPUT_SIZE;
  canvas.height = AVATAR_OUTPUT_SIZE;

  const context = canvas.getContext('2d');
  if (!context) {
    throw new Error('Nao foi possivel preparar a imagem recortada.');
  }

  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = 'high';
  context.drawImage(
    image,
    croppedAreaPixels.x,
    croppedAreaPixels.y,
    croppedAreaPixels.width,
    croppedAreaPixels.height,
    0,
    0,
    AVATAR_OUTPUT_SIZE,
    AVATAR_OUTPUT_SIZE,
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Nao foi possivel gerar a foto de perfil.'));
          return;
        }

        resolve(blob);
      },
      'image/jpeg',
      0.92,
    );
  });
}
