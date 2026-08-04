'use server';

import { revalidateSettings } from '@/lib/revalidate';
import { safeAction } from '@/lib/utils/serverAction';

export const purgeAllCache = async () => {
  return safeAction(
    (async () => {
      // revalidateSettings triggers:
      // 1. revalidateTag('settings')
      // 2. revalidatePath('/', 'layout')
      // 3. purgeCloudflareEverything()
      await revalidateSettings();
      return { success: true };
    })()
  );
};
