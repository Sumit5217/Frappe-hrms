import React from 'react';
import { Lock, Paperclip, X, Send } from 'lucide-react';
import { Ticket } from '../types';

export interface ConversationComposerProps {
  activeTicket?: Ticket;
  composerMode: 'public' | 'internal';
  setComposerMode: (mode: 'public' | 'internal') => void;
  composerText: string;
  setComposerText: (text: string) => void;
  composerAttachedFiles: string[];
  setComposerAttachedFiles: React.Dispatch<React.SetStateAction<string[]>>;
  composerTextareaRef: any;
  fileInputRef: any;
  setIsCannedModalOpen: (open: boolean) => void;
  sendingReply: boolean;
  handleSendComposerAction: (closeAfter: boolean) => void;
}

export const ConversationComposer: React.FC<ConversationComposerProps> = ({
  activeTicket,
  composerMode,
  setComposerMode,
  composerText,
  setComposerText,
  composerAttachedFiles,
  setComposerAttachedFiles,
  composerTextareaRef,
  fileInputRef,
  setIsCannedModalOpen,
  sendingReply,
  handleSendComposerAction,
}) => {
  if (!activeTicket) return null;

  return (
    <div className="p-3.5 border-t border-[#E2E8F0] bg-white shrink-0">
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setComposerMode('public')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              composerMode === 'public'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            ✉ Public Reply
          </button>
          <button
            onClick={() => setComposerMode('internal')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
              composerMode === 'internal'
                ? 'bg-amber-600 text-white shadow-2xs'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Private Team Note</span>
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={() =>
              setComposerText(
                `Hello ${activeTicket.customer_name},\n\nWe have verified and resolved your request. Please test and confirm.\n\nBest regards,\nNimble Vision Support`
              )
            }
            className="px-2.5 py-1 rounded-md border border-gray-200 text-gray-700 hover:bg-gray-50 text-xs font-medium"
          >
            ✓ Resolved
          </button>
          <button
            onClick={() =>
              setComposerText(
                `Hello ${activeTicket.customer_name},\n\nOur field engineer is currently investigating your telemetry feed.\n\nBest regards,\nNimble Vision Support`
              )
            }
            className="px-2.5 py-1 rounded-md border border-gray-200 text-gray-700 hover:bg-gray-50 text-xs font-medium"
          >
            ⚙ Working
          </button>
        </div>
      </div>

      {/* Display attached file chips in composer if any */}
      {composerAttachedFiles.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {composerAttachedFiles.map((fn, idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-800 rounded-md text-xs font-medium border border-blue-200"
            >
              <Paperclip className="w-3 h-3" />
              <span>{fn}</span>
              <X
                className="w-3 h-3 cursor-pointer hover:text-rose-600"
                onClick={() =>
                  setComposerAttachedFiles((prev) => prev.filter((_, i) => i !== idx))
                }
              />
            </span>
          ))}
        </div>
      )}

      <div className="relative">
        <textarea
          ref={composerTextareaRef}
          value={composerText}
          onChange={(e) => setComposerText(e.target.value)}
          placeholder={
            composerMode === 'public'
              ? `Type email reply to ${activeTicket.email}...`
              : 'Write private internal note (visible to team only)...'
          }
          rows={3}
          className={`w-full p-3 rounded-lg border text-sm outline-none transition-all leading-relaxed ${
            composerMode === 'internal'
              ? 'border-amber-300 bg-amber-50/20 focus:border-amber-500'
              : 'border-gray-300 focus:border-blue-500'
          }`}
        ></textarea>
      </div>

      <div className="flex items-center justify-between mt-2.5">
        <div className="flex items-center gap-3.5 text-sm text-gray-600">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 hover:text-gray-900 font-medium"
          >
            <Paperclip className="w-4 h-4" />
            <span>Attach</span>
          </button>
          <button
            onClick={() => setIsCannedModalOpen(true)}
            className="hover:text-gray-900 flex items-center gap-1.5 font-medium"
          >
            <span>⚡</span>
            <span>Canned Snippet</span>
          </button>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            disabled={sendingReply || !composerText.trim()}
            onClick={() => handleSendComposerAction(false)}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg font-bold text-sm flex items-center gap-2 shadow-sm"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send</span>
          </button>
          <button
            disabled={sendingReply || !composerText.trim()}
            onClick={() => handleSendComposerAction(true)}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-lg font-bold text-sm"
          >
            Send & Close
          </button>
        </div>
      </div>
    </div>
  );
};
