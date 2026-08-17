import { create } from 'zustand';
import { useToastStore } from './useToastStore';
import { isElectron } from '../utils/fileUtils';

export const CURRENT_VERSION = '1.0.2';
const REPO_RELEASES_API = 'https://api.github.com/repos/SudhirDevOps1/CodeStudio/releases/latest';
const REPO_RELEASES_PAGE = 'https://github.com/SudhirDevOps1/CodeStudio/releases/latest';

interface UpdateStoreState {
  currentVersion: string;
  latestVersion: string | null;
  releaseTitle: string | null;
  releaseNotes: string | null;
  downloadUrl: string | null;
  publishedAt: string | null;
  hasUpdate: boolean;
  isChecking: boolean;
  isModalOpen: boolean;

  checkForUpdates: (manual?: boolean) => Promise<void>;
  openUpdateModal: () => void;
  closeUpdateModal: () => void;
  performUpdate: () => void;
}

function compareVersions(v1: string, v2: string): number {
  const cleanV1 = v1.replace(/^v/, '').split('.').map(n => parseInt(n, 10) || 0);
  const cleanV2 = v2.replace(/^v/, '').split('.').map(n => parseInt(n, 10) || 0);

  for (let i = 0; i < Math.max(cleanV1.length, cleanV2.length); i++) {
    const num1 = cleanV1[i] || 0;
    const num2 = cleanV2[i] || 0;
    if (num1 > num2) return 1;
    if (num1 < num2) return -1;
  }
  return 0;
}

export const useUpdateStore = create<UpdateStoreState>((set, get) => ({
  currentVersion: CURRENT_VERSION,
  latestVersion: null,
  releaseTitle: null,
  releaseNotes: null,
  downloadUrl: null,
  publishedAt: null,
  hasUpdate: false,
  isChecking: false,
  isModalOpen: false,

  openUpdateModal: () => set({ isModalOpen: true }),
  closeUpdateModal: () => set({ isModalOpen: false }),

  checkForUpdates: async (manual = false) => {
    const { addToast } = useToastStore.getState();
    if (get().isChecking) return;

    set({ isChecking: true });

    try {
      const response = await fetch(REPO_RELEASES_API, {
        headers: {
          Accept: 'application/vnd.github.v3+json',
        },
      });

      if (!response.ok) {
        throw new Error(`GitHub API error (${response.status})`);
      }

      const release = await response.json();
      const rawTag = release.tag_name || '';
      const cleanLatest = rawTag.replace(/^v/, '');
      const hasNewerVersion = compareVersions(cleanLatest, CURRENT_VERSION) > 0;

      // Look for .exe asset for Windows Desktop
      let downloadLink = release.html_url || REPO_RELEASES_PAGE;
      if (Array.isArray(release.assets) && release.assets.length > 0) {
        const exeAsset = release.assets.find(
          (a: any) => typeof a.name === 'string' && (a.name.endsWith('.exe') || a.name.includes('setup'))
        );
        if (exeAsset?.browser_download_url) {
          downloadLink = exeAsset.browser_download_url;
        }
      }

      set({
        latestVersion: cleanLatest,
        releaseTitle: release.name || `Release ${rawTag}`,
        releaseNotes: release.body || 'No release notes provided.',
        downloadUrl: downloadLink,
        publishedAt: release.published_at ? new Date(release.published_at).toLocaleDateString() : null,
        hasUpdate: hasNewerVersion,
      });

      if (hasNewerVersion) {
        set({ isModalOpen: true });
        addToast({
          type: 'info',
          title: '🎉 New Version Available',
          message: `CodeStudio v${cleanLatest} is ready to install!`,
        });
      } else if (manual) {
        addToast({
          type: 'success',
          title: 'CodeStudio is Up to Date',
          message: `You are running the latest version (v${CURRENT_VERSION}).`,
        });
      }
    } catch {
      if (manual) {
        addToast({
          type: 'warning',
          title: 'Update Check Failed',
          message: 'Could not reach GitHub Releases API. Please check your internet connection.',
        });
      }
    } finally {
      set({ isChecking: false });
    }
  },

  performUpdate: () => {
    const { downloadUrl } = get();
    const targetUrl = downloadUrl || REPO_RELEASES_PAGE;

    if (isElectron() && (window as any).electronAPI?.openExternal) {
      (window as any).electronAPI.openExternal(targetUrl);
    } else {
      window.open(targetUrl, '_blank', 'noopener,noreferrer');
    }

    set({ isModalOpen: false });
  },
}));
