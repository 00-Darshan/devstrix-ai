import { Fragment } from 'react';
import { Listbox, Transition } from '@headlessui/react';
import { Check, ChevronsUpDown } from 'lucide-react';
import clsx from 'clsx';
import type { AIModel } from '../types';

interface ModelSelectorProps {
  selectedModel?: AIModel;
  models: AIModel[];
  onChange: (model: AIModel) => void;
  label?: string;
  compact?: boolean;
  disabled?: boolean;
}

export const ModelSelector = ({
  selectedModel,
  models,
  onChange,
  label = 'Model',
  compact = false,
  disabled = false,
}: ModelSelectorProps) => {
  if (!selectedModel || models.length === 0) {
    return (
      <div className={clsx('rounded-xl border px-3 py-2 text-sm text-[color:var(--text-muted)] border-amber-200 bg-amber-50')}>
        No models available.
      </div>
    );
  }

  return (
    <Listbox value={selectedModel} onChange={onChange} disabled={disabled}>
      {({ open }) => (
        <div className={clsx('relative', compact ? 'w-full' : 'min-w-[220px]')}>
          <Listbox.Button
            className={clsx(
              'w-full rounded-lg border border-[color:var(--border)] bg-white px-3 py-2 text-left text-sm font-medium text-[color:var(--text-primary)] shadow-sm transition hover:bg-[color:var(--surface-contrast)] focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:bg-neutral-800 dark:hover:bg-neutral-700',
              disabled && 'opacity-60 cursor-not-allowed',
              compact ? 'flex items-center justify-between gap-2 text-xs py-1.5' : 'text-sm'
            )}
          >
            <span className="flex flex-col truncate">
              {!compact && <span className="text-xs font-normal text-[color:var(--text-muted)]">{label}</span>}
              <span className="truncate">{selectedModel.name}</span>
            </span>
            <ChevronsUpDown size={14} className="text-[color:var(--text-muted)]" aria-hidden />
          </Listbox.Button>

          <Transition
            as={Fragment}
            show={open}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Listbox.Options className="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-xl border border-[color:var(--border)] bg-white p-1 text-sm shadow-xl focus:outline-none dark:bg-neutral-900">
              {models.map((model) => (
                <Listbox.Option
                  key={model.id}
                  value={model}
                  className={({ active }) =>
                    clsx(
                      'flex cursor-pointer items-start gap-2 rounded-lg px-2 py-2 transition',
                      active ? 'bg-blue-50 text-blue-900 dark:bg-blue-900/40 dark:text-blue-100' : 'text-[color:var(--text-primary)]'
                    )
                  }
                >
                  {({ selected }) => (
                    <>
                      <div className="flex-1">
                        <p className="font-semibold">{model.name}</p>
                        <p className="text-xs text-[color:var(--text-muted)] truncate">{model.description}</p>
                      </div>
                      {selected && <Check size={14} className="text-blue-500 mt-0.5" />}
                    </>
                  )}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </Transition>
        </div>
      )}
    </Listbox>
  );
};
