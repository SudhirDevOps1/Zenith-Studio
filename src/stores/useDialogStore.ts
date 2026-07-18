import { create } from 'zustand';
import { DialogType } from '../components/ui/AppDialog';

interface DialogConfig {
  type: DialogType;
  title: string;
  message?: string;
  defaultValue?: string;
  placeholder?: string;
  confirmText?: string;
  cancelText?: string;
}

interface DialogState extends DialogConfig {
  isOpen: boolean;
  resolve: ((value: string | null) => void) | null;

  // Actions
  openDialog: (config: DialogConfig) => Promise<string | null>;
  closeDialog: () => void;
  confirm: (value?: string) => void;
  cancel: () => void;
}

export const useDialogStore = create<DialogState>((set, get) => ({
  isOpen: false,
  type: 'input',
  title: '',
  message: '',
  defaultValue: '',
  placeholder: '',
  confirmText: 'OK',
  cancelText: 'Cancel',
  resolve: null,

  openDialog: (config) => {
    return new Promise((resolve) => {
      set({
        isOpen: true,
        ...config,
        resolve,
      });
    });
  },

  closeDialog: () => {
    set({ isOpen: false, resolve: null });
  },

  confirm: (value) => {
    const { resolve } = get();
    if (resolve) resolve(value || null);
    set({ isOpen: false, resolve: null });
  },

  cancel: () => {
    const { resolve } = get();
    if (resolve) resolve(null);
    set({ isOpen: false, resolve: null });
  },
}));
