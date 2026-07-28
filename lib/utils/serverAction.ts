export type SafeResult<T> = 
  | { success: true; data: T }
  | { success: false; error: string };

/**
 * Wraps a Server Action promise to ensure errors are returned safely 
 * rather than thrown (which causes Next.js to mask them in production).
 */
export async function safeAction<T>(promise: Promise<T>): Promise<SafeResult<T>> {
  try {
    const data = await promise;
    return { success: true, data };
  } catch (error: any) {
    console.error('[safeAction error]:', error);
    // Extract meaningful error message
    const message = error?.message || (typeof error === 'string' ? error : 'An unexpected server error occurred.');
    return { success: false, error: message };
  }
}
