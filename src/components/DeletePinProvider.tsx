import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Trash2, X } from 'lucide-react';
import { Language } from '../types/manual';

// NOTE: this PIN lives in the front-end code, so it stops accidental deletes but is
// not real security (anyone who opens the browser dev tools can read it).
const DELETE_PIN = '0301';
const PIN_LENGTH = DELETE_PIN.length;

type ConfirmDelete = (message: string, lang: Language) => Promise<boolean>;

const DeletePinContext = createContext<ConfirmDelete>(async () => false);

/** Returns confirmDelete(message, lang): resolves true only after the correct PIN is typed. */
export const useDeletePin = (): ConfirmDelete => useContext(DeletePinContext);

interface PinRequest {
  message: string;
  lang: Language;
  resolve: (ok: boolean) => void;
}

export const DeletePinProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [request, setRequest] = useState<PinRequest | null>(null);
  const [digits, setDigits] = useState<string[]>(() => Array(PIN_LENGTH).fill(''));
  const [wrong, setWrong] = useState(false);
  const inputs = useRef<(HTMLInputElement | null)[]>([]);
  const requestRef = useRef<PinRequest | null>(null);
  requestRef.current = request;

  const confirmDelete = useCallback<ConfirmDelete>(
    (message, lang) =>
      new Promise<boolean>((resolve) => {
        // A new request while one is open cancels the old one.
        requestRef.current?.resolve(false);
        setDigits(Array(PIN_LENGTH).fill(''));
        setWrong(false);
        setRequest({ message, lang, resolve });
      }),
    []
  );

  const close = (ok: boolean) => {
    request?.resolve(ok);
    setRequest(null);
  };

  useEffect(() => {
    if (request) window.setTimeout(() => inputs.current[0]?.focus(), 30);
  }, [request]);

  useEffect(() => {
    if (!request) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        request.resolve(false);
        setRequest(null);
      }
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, [request]);

  const submit = (next: string[]) => {
    if (next.join('') === DELETE_PIN) {
      request?.resolve(true);
      setRequest(null);
    } else {
      setWrong(true);
      setDigits(Array(PIN_LENGTH).fill(''));
      window.setTimeout(() => inputs.current[0]?.focus(), 30);
    }
  };

  const setDigitAt = (index: number, value: string) => {
    const clean = value.replace(/\D/g, '');
    if (!clean) return;
    const next = [...digits];
    // Typing or pasting several digits fills the following slots too.
    clean.split('').slice(0, PIN_LENGTH - index).forEach((ch, i) => { next[index + i] = ch; });
    setDigits(next);
    setWrong(false);
    const nextFocus = Math.min(index + clean.length, PIN_LENGTH - 1);
    inputs.current[nextFocus]?.focus();
    if (next.every((d) => d !== '')) submit(next);
  };

  const onKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      const next = [...digits];
      if (next[index]) {
        next[index] = '';
        setDigits(next);
      } else if (index > 0) {
        next[index - 1] = '';
        setDigits(next);
        inputs.current[index - 1]?.focus();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < PIN_LENGTH - 1) {
      inputs.current[index + 1]?.focus();
    }
  };

  const ja = request?.lang === 'ja';

  return (
    <DeletePinContext.Provider value={confirmDelete}>
      {children}
      {request && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-stone-900/60 p-4 backdrop-blur-xs"
          onMouseDown={(e) => { if (e.target === e.currentTarget) close(false); }}
        >
          <div className="w-full max-w-sm rounded-2xl border border-stone-200 bg-white shadow-2xl">
            <div className="flex items-center justify-between rounded-t-2xl bg-red-600 px-5 py-3 text-white">
              <div className="flex items-center gap-2 text-sm font-bold">
                <Trash2 className="h-4 w-4" />
                {ja ? '削除の確認' : 'Confirm deletion'}
              </div>
              <button type="button" onClick={() => close(false)} className="rounded-lg p-1 hover:bg-white/20" aria-label="Close">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4 px-5 py-5">
              <p className="whitespace-pre-line text-sm text-stone-700">{request.message}</p>
              <p className="text-xs font-semibold text-stone-500">
                {ja ? '削除するには4桁の暗証番号を入力してください。' : 'Enter the 4-digit PIN to delete.'}
              </p>

              <div className="flex justify-center gap-3">
                {digits.map((d, i) => (
                  <input
                    key={i}
                    ref={(el) => { inputs.current[i] = el; }}
                    value={d}
                    type="password"
                    inputMode="numeric"
                    autoComplete="off"
                    maxLength={PIN_LENGTH}
                    onChange={(e) => setDigitAt(i, e.target.value)}
                    onKeyDown={(e) => onKeyDown(i, e)}
                    onFocus={(e) => e.target.select()}
                    className={`h-14 w-12 rounded-xl border-2 text-center text-2xl font-bold outline-none transition ${
                      wrong
                        ? 'border-red-500 bg-red-50 text-red-700'
                        : 'border-stone-300 bg-white text-stone-900 focus:border-orange-500'
                    }`}
                  />
                ))}
              </div>

              <div className="h-4 text-center text-xs font-semibold text-red-600">
                {wrong ? (ja ? '暗証番号が違います' : 'Wrong PIN') : ''}
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => close(false)}
                  className="rounded-lg border border-stone-300 bg-white px-4 py-1.5 text-xs font-semibold text-stone-700 hover:bg-stone-50"
                >
                  {ja ? 'キャンセル' : 'Cancel'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DeletePinContext.Provider>
  );
};
