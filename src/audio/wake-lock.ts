import { dlog } from '@/ui/debug';

type WakeLockSentinel = {
  release(): Promise<void>;
  addEventListener(event: 'release', listener: () => void): void;
};

let wakeLock: WakeLockSentinel | null = null;

export async function acquireWakeLock(): Promise<void> {
  const nav = navigator as Navigator & {
    wakeLock?: { request(kind: 'screen'): Promise<WakeLockSentinel> };
  };
  if (!nav.wakeLock) return;
  if (wakeLock) return;
  try {
    wakeLock = await nav.wakeLock.request('screen');
    wakeLock.addEventListener('release', () => {
      dlog('wake lock released');
      wakeLock = null;
    });
    dlog('wake lock acquired');
  } catch (e) {
    dlog('wake lock err: ' + ((e as Error)?.message || e));
  }
}

export async function releaseWakeLock(): Promise<void> {
  try {
    await wakeLock?.release();
  } catch {
    /* ignore */
  }
  wakeLock = null;
}
