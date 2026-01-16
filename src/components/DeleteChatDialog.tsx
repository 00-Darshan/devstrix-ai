import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';

interface DeleteChatDialogProps {
  isOpen: boolean;
  conversationTitle?: string;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
}

export const DeleteChatDialog = ({ isOpen, conversationTitle, onClose, onConfirm }: DeleteChatDialogProps) => {
  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog onClose={onClose} className="relative z-50">
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 flex items-center justify-center px-4">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-150"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Dialog.Panel className="w-full max-w-md rounded-3xl border border-white/10 bg-white/90 p-6 shadow-2xl backdrop-blur-lg dark:bg-neutral-900/95">
              <Dialog.Title className="text-lg font-semibold text-slate-900 dark:text-white">
                Delete chat?
              </Dialog.Title>
              <Dialog.Description className="mt-3 text-sm text-slate-600 dark:text-slate-300">
                This will delete <span className="font-semibold">{conversationTitle ?? 'this chat'}</span>. Visit settings to delete any memories saved during this chat.
              </Dialog.Description>

              <div className="mt-6 flex gap-2">
                <button
                  onClick={onClose}
                  className="flex-1 rounded-2xl border border-slate-200 bg-white py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    await onConfirm();
                    onClose();
                  }}
                  className="flex-1 rounded-2xl bg-rose-600 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-500"
                >
                  Delete
                </button>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
};
