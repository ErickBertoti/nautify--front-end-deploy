import { createClient } from '@/utils/supabase/client';

export const STORAGE_BUCKET = 'nautify_bucket';
const PUBLIC_PATH_PREFIX = `/storage/v1/object/public/${STORAGE_BUCKET}/`;

export interface UploadResult {
  url: string;
  path: string;
}

export async function uploadFile(
  folder: string,
  file: File,
): Promise<UploadResult> {
  const ext = file.name.split('.').pop();
  const path = `${folder}/${crypto.randomUUID()}.${ext}`;

  return uploadFileAtPath(path, file);
}

export async function uploadFileAtPath(
  path: string,
  file: File | Blob,
  options?: { contentType?: string },
): Promise<UploadResult> {
  const supabase = createClient();
  const contentType = options?.contentType ?? (file instanceof File ? file.type : undefined);

  const { error } = await supabase.storage.from(STORAGE_BUCKET).upload(path, file, {
    contentType,
  });
  if (error) throw new Error(error.message);

  const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);
  return { url: data.publicUrl, path };
}

export function getStoragePathFromPublicUrl(publicUrl: string): string | null {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!supabaseUrl) {
    return null;
  }

  try {
    const storageUrl = new URL(publicUrl);
    const expectedOrigin = new URL(supabaseUrl).origin;

    if (storageUrl.origin !== expectedOrigin) {
      return null;
    }

    if (!storageUrl.pathname.startsWith(PUBLIC_PATH_PREFIX)) {
      return null;
    }

    return decodeURIComponent(storageUrl.pathname.slice(PUBLIC_PATH_PREFIX.length));
  } catch {
    return null;
  }
}

export async function deleteFile(path: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.storage.from(STORAGE_BUCKET).remove([path]);
  if (error) throw new Error(error.message);
}
