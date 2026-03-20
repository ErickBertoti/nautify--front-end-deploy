import { createClient } from '@/utils/supabase/client';

const BUCKET = 'nautify_bucket';

interface UploadResult {
  url: string;
  path: string;
}

export async function uploadFile(
  folder: string,
  file: File,
): Promise<UploadResult> {
  const supabase = createClient();
  const ext = file.name.split('.').pop();
  const path = `${folder}/${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage.from(BUCKET).upload(path, file);
  if (error) throw new Error(error.message);

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return { url: data.publicUrl, path };
}

export async function deleteFile(path: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.storage.from(BUCKET).remove([path]);
  if (error) throw new Error(error.message);
}
