import React from 'react';
import { Mail, Lock, CheckCircle2 } from 'lucide-react';
import { Ticket, ParsedTimelineEntry } from '../types';
import { formatZohoDate, getRelativeTime } from '../constants';

export interface ConversationFeedProps {
  activeTicket?: Ticket;
  timelineEntries: ParsedTimelineEntry[];
  csatRating: any;
  setCsatRating: (rating: any) => void;
  replySuccessMessage?: string | null;
}

export const ConversationFeed: React.FC<ConversationFeedProps> = ({
  activeTicket,
  timelineEntries,
  csatRating,
  setCsatRating,
  replySuccessMessage,
}) => {
  if (!activeTicket) return null;

  return (
    <div className="flex-1 overflow-y-auto px-6 py-4 bg-white divide-y divide-gray-100">
      {/* Customer Inquiry (Opening Thread Message) */}
      <div className="pb-5">
        <div className="flex items-start justify-between mb-1.5">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xs shadow-2xs relative shrink-0">
              <span>{activeTicket.customer_name?.slice(0, 2).toUpperCase() || 'CU'}</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 ring-1 ring-white absolute -bottom-0.5 -right-0.5"></span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-[13px] text-gray-900">
                {activeTicket.customer_name}
              </span>
              <span className="text-xs text-gray-400 font-normal">
                {formatZohoDate(activeTicket.creation)} ({getRelativeTime(activeTicket.creation)})
              </span>
            </div>
          </div>
          <Mail className="w-3.5 h-3.5 text-gray-400 hover:text-blue-600 cursor-pointer" />
        </div>

        {/* Customer Inquiry Body */}
        <div className="pl-9.5 text-[13px] text-gray-800 leading-normal whitespace-pre-wrap font-normal">
          {activeTicket.description}
        </div>
      </div>

      {/* Agent Replies & Timeline Entries */}
      {timelineEntries.map((entry) => {
        if (entry.kind === 'email_reply') {
          return (
            <div key={entry.id} className="py-5">
              {/* Agent Header Line */}
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-[#4f6bf5] text-white font-bold flex items-center justify-center text-xs shadow-2xs relative shrink-0">
                    <span>{entry.sender?.charAt(0).toUpperCase() || 'S'}</span>
                    <span className="w-2 h-2 rounded-full bg-blue-300 ring-1 ring-white absolute -top-0.5 -left-0.5"></span>
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-bold text-[13px] text-gray-900">
                      {entry.sender}
                    </span>
                    <span className="text-xs text-gray-500 font-normal">
                      {entry.time} ( responded in 3 hours )
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-gray-400 hover:text-blue-600 cursor-pointer" />
                </div>
              </div>

              {/* Email Body */}
              {entry.body && (
                <div className="pl-9.5 text-[13px] text-gray-800 leading-normal whitespace-pre-line font-normal mb-2.5">
                  {entry.body}
                </div>
              )}

              {/* CSAT Customer Satisfaction Prompt */}
              <div className="pl-9.5 my-2">
                <p className="text-[13px] text-blue-600 font-normal mb-2">
                  How would you rate our customer service?
                </p>
                <div className="flex items-center gap-2.5">
                  <button
                    onClick={() => setCsatRating('Good')}
                    className={`px-3 py-1 bg-white border rounded-full text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                      csatRating === 'Good'
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <span className="text-sm">😃</span>
                    <span>Good</span>
                  </button>
                  <button
                    onClick={() => setCsatRating('Bad')}
                    className={`px-3 py-1 bg-white border rounded-full text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                      csatRating === 'Bad'
                        ? 'border-rose-500 bg-rose-50 text-rose-700'
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <span className="text-sm">😡</span>
                    <span>Bad</span>
                  </button>
                  {csatRating && (
                    <span className="text-emerald-700 text-xs font-semibold ml-1">
                      ✓ Rating recorded ({csatRating})
                    </span>
                  )}
                </div>
              </div>

              {/* Quoted Customer Inquiry Block */}
              <div className="pl-9.5 pt-2 text-[11px] text-gray-400 font-normal">
                <span>
                  ---- on {formatZohoDate(activeTicket.creation)} "{activeTicket.customer_name || 'Customer'}" &lt;{activeTicket.email || 'customer@client.com'}&gt; wrote ----
                </span>
                <div className="mt-1">
                  <span className="inline-block px-1.5 py-0.5 border border-gray-200 rounded text-[10px] text-gray-400 cursor-pointer hover:bg-gray-50">
                    ...
                  </span>
                </div>
              </div>
            </div>
          );
        } else {
          {/* Private Team Note */}
          return (
            <div key={entry.id} className="py-4">
              <div className="bg-amber-50/70 border border-amber-200/90 rounded-lg p-3.5">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2 text-amber-900 font-semibold text-xs">
                    <Lock className="w-3 h-3 text-amber-700" />
                    <span>Private Team Note</span>
                    <span className="text-amber-700/60 font-normal text-[11px]">· Internal only</span>
                  </div>
                  <span className="text-[11px] text-amber-700/75">{entry.time}</span>
                </div>
                <div className="text-xs text-amber-900 whitespace-pre-wrap leading-relaxed pl-5 font-normal">
                  {entry.body}
                </div>
              </div>
            </div>
          );
        }
      })}

      {/* If no responses yet, show default agent acknowledgement */}
      {timelineEntries.length === 0 && (
        <div className="py-5">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-[#4f6bf5] text-white font-bold flex items-center justify-center text-xs shadow-2xs relative shrink-0">
                <span>{activeTicket.assigned_to?.charAt(0).toUpperCase() || 'S'}</span>
                <span className="w-2 h-2 rounded-full bg-blue-300 ring-1 ring-white absolute -top-0.5 -left-0.5"></span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-[13px] text-gray-900">
                  {activeTicket.assigned_to || 'Sumit Singh'}
                </span>
                <span className="text-xs text-gray-500 font-normal">
                  {formatZohoDate(activeTicket.modified)} ( responded in 1 day )
                </span>
              </div>
            </div>
            <Mail className="w-3.5 h-3.5 text-gray-400 hover:text-blue-600 cursor-pointer" />
          </div>

          <div className="pl-9.5 my-2">
            <p className="text-[13px] text-blue-600 font-normal mb-2">
              How would you rate our customer service?
            </p>
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => setCsatRating('Good')}
                className={`px-3 py-1 bg-white border rounded-full text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                  csatRating === 'Good'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span className="text-sm">😃</span>
                <span>Good</span>
              </button>
              <button
                onClick={() => setCsatRating('Bad')}
                className={`px-3 py-1 bg-white border rounded-full text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                  csatRating === 'Bad'
                    ? 'border-rose-500 bg-rose-50 text-rose-700'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span className="text-sm">😡</span>
                <span>Bad</span>
              </button>
            </div>
          </div>

          <div className="pl-9.5 pt-2 text-[11px] text-gray-400 font-normal">
            <span>
              ---- on {formatZohoDate(activeTicket.creation)} "{activeTicket.customer_name || 'Customer'}" &lt;{activeTicket.email || 'customer@client.com'}&gt; wrote ----
            </span>
            <div className="mt-1">
              <span className="inline-block px-1.5 py-0.5 border border-gray-200 rounded text-[10px] text-gray-400 cursor-pointer hover:bg-gray-50">
                ...
              </span>
            </div>
          </div>
        </div>
      )}

      {replySuccessMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded text-xs flex items-center gap-2 font-medium my-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{replySuccessMessage}</span>
        </div>
      )}
    </div>
  );
};
