'use client';

import { WindowManagerProvider } from '@/contexts/WindowManagerContext';
import DesktopEnvironment from '@/components/DesktopEnvironment';
import DesktopIcons from '@/components/DesktopIcons';
import WindowContainer from '@/components/WindowContainer';

export default function Home() {
  return (
    <WindowManagerProvider>
      <DesktopEnvironment>
        <DesktopIcons />
        <WindowContainer />
      </DesktopEnvironment>
    </WindowManagerProvider>
  );
}
