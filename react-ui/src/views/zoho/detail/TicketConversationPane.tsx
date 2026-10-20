import React from 'react';
import {
  Headphones,
  Mail,
  Play,
  Pause,
  Info,
  ChevronDown,
  MessageSquare,
  MoreHorizontal,
  Printer,
  Copy,
  Trash2,
  Send,
  Share2,
  ExternalLink,
} from 'lucide-react';
import { Ticket, TimeEntry, AttachmentItem, ActivityEvent } from '../types';
import { formatTimer, formatZohoDate } from '../constants';
import { ConversationFeed } from './ConversationFeed';
import { ConversationComposer } from './ConversationComposer';
import { TicketResolutionTab } from './TicketResolutionTab';
import { TicketTimeTab } from './TicketTimeTab';
import { TicketAttachmentsTab } from './TicketAttachmentsTab';
import { TicketActivityTab } from './TicketActivityTab';

interface TicketConversationPaneProps {
  activeTicket?: Ticket;
  timerSeconds: number;
  isTimerRunning: boolean;
  setIsTimerRunning: React.Dispatch<React.SetStateAction<boolean>>;
  isPropertiesPaneOpen: boolean;
  setIsPropertiesPaneOpen: React.Dispatch<React.SetStateAction<boolean>>;
  handleOpenReplyAll: () => void;
  isReplyAllDropdownOpen: boolean;
  setIsReplyAllDropdownOpen: React.Dispatch<React.SetStateAction<boolean>>;
  replyAllRef: any;
  handleQuickAutoReplyAll: () => void;
  activeTab: 'conversations' | 'resolution' | 'time' | 'attachment' | 'activity';
  setActiveTab: (tab: 'conversations' | 'resolution' | 'time' | 'attachment' | 'activity') => void;
  conversationCount: number;
  timelineEntries: any[];
  csatRating: 'Good' | 'Bad' | null;
  setCsatRating: (val: 'Good' | 'Bad' | null) => void;
  composerMode: 'public' | 'internal';
  setComposerMode: (mode: 'public' | 'internal') => void;
  composerText: string;
  setComposerText: React.Dispatch<React.SetStateAction<string>>;
  composerAttachedFiles: string[];
  setComposerAttachedFiles: React.Dispatch<React.SetStateAction<string[]>>;
  composerTextareaRef: any;
  fileInputRef: any;
  isCannedModalOpen: boolean;
  setIsCannedModalOpen: (val: boolean) => void;
  sendingReply: boolean;
  handleSendComposerAction: (closeAfterSend: boolean) => void;
  rootCause: string;
  setRootCause: (val: string) => void;
  resolutionText: string;
  setResolutionText: (val: string) => void;
  resolutionSuccessMessage: string;
  savingResolution: boolean;
  handleSaveResolution: () => void;
  handleCommitTimerToLog: () => void;
  newLogHours: string;
  setNewLogHours: (val: string) => void;
  newLogActivity: string;
  setNewLogActivity: (val: string) => void;
  newLogBillable: boolean;
  setNewLogBillable: (val: boolean) => void;
  handleAddTimeEntry: (e: React.FormEvent) => void;
  timeEntries: TimeEntry[];
  attachments: AttachmentItem[];
  setAttachments: React.Dispatch<React.SetStateAction<AttachmentItem[]>>;
  activityLogs: ActivityEvent[];
  setIsMacroModalOpen: (val: boolean) => void;
  setIsRemoteAssistModalOpen: (val: boolean) => void;
  handleStatusChange: (ticketId: string, newStatus: any) => void;
  isTicketMoreMenuOpen: boolean;
  setIsTicketMoreMenuOpen: (val: boolean) => void;
  ticketMoreMenuRef: any;
  handleDeleteCurrentTicket: () => void;
}

export const TicketConversationPane: React.FC<TicketConversationPaneProps> = ({
  activeTicket,
  timerSeconds,
  isTimerRunning,
  setIsTimerRunning,
  isPropertiesPaneOpen,
  setIsPropertiesPaneOpen,
  handleOpenReplyAll,
  isReplyAllDropdownOpen,
  setIsReplyAllDropdownOpen,
  replyAllRef,
  handleQuickAutoReplyAll,
  activeTab,
  setActiveTab,
  conversationCount,
  timelineEntries,
  csatRating,
  setCsatRating,
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
  rootCause,
  setRootCause,
  resolutionText,
  setResolutionText,
  resolutionSuccessMessage,
  savingResolution,
  handleSaveResolution,
  handleCommitTimerToLog,
  newLogHours,
  setNewLogHours,
  newLogActivity,
  setNewLogActivity,
  newLogBillable,
  setNewLogBillable,
  handleAddTimeEntry,
  timeEntries,
  attachments,
  setAttachments,
  activityLogs,
  setIsMacroModalOpen,
  setIsRemoteAssistModalOpen,
  handleStatusChange,
  isTicketMoreMenuOpen,
  setIsTicketMoreMenuOpen,
  ticketMoreMenuRef,
  handleDeleteCurrentTicket,
}) => {
  return (
    <div className="flex-1 flex flex-col min-w-0 bg-white">
      {/* Detail Pane Header (Screenshot exact match) */}
      <div className="h-14 px-4 border-b border-[#E2E8F0] flex items-center justify-between gap-3 bg-white shrink-0">
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <div className="w-7 h-7 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Headphones className="w-3.5 h-3.5" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="font-sans font-[450] text-[15px] text-[#1E293B] tracking-[-0.015em] leading-tight truncate antialiased">
              {activeTicket?.title}
            </h2>
            <div className="flex items-center gap-1.5 text-[11px] text-gray-500 mt-0.5 truncate">
              <span className="font-semibold text-gray-700 shrink-0">{activeTicket?.displayId}</span>
              <span>·</span>
              <span className="truncate">{activeTicket?.customer_name}</span>
              <span>·</span>
              <span className="shrink-0">🕒 {formatZohoDate(activeTicket?.modified)}</span>
              <span>·</span>
              <div className="inline-flex items-center gap-1 font-mono font-medium text-gray-700 bg-gray-100 px-1.5 py-0.5 rounded text-[10px] shrink-0">
                <button
                  onClick={() => setIsTimerRunning(!isTimerRunning)}
                  className="hover:text-blue-600 cursor-pointer"
                  title={isTimerRunning ? 'Pause Timer' : 'Start Timer'}
                >
                  {isTimerRunning ? <Pause className="w-2.5 h-2.5 text-blue-600" /> : <Play className="w-2.5 h-2.5" />}
                </button>
                <span>{formatTimer(timerSeconds)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions Header */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => setIsPropertiesPaneOpen(!isPropertiesPaneOpen)}
            className={`h-7 px-2 text-[11px] font-medium rounded border transition-colors flex items-center gap-1 cursor-pointer ${
              isPropertiesPaneOpen
                ? 'bg-blue-50 text-blue-700 border-blue-200'
                : 'bg-white hover:bg-gray-50 text-gray-600 border-gray-300'
            }`}
            title={isPropertiesPaneOpen ? 'Hide Ticket Properties' : 'Show Ticket Properties'}
          >
            <Info className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{isPropertiesPaneOpen ? 'Hide' : 'Properties'}</span>
          </button>

          {/* Reply All Action Split-Button */}
          <div className="relative inline-flex items-center shadow-2xs rounded" ref={replyAllRef}>
            <button
              onClick={handleOpenReplyAll}
              className="h-7 px-2.5 bg-[#1070e5] hover:bg-blue-600 text-white rounded-l text-[11px] font-medium flex items-center gap-1 transition-colors cursor-pointer"
              title="Click to Reply All"
            >
              <Mail className="w-3 h-3" />
              <span>Reply All</span>
            </button>
            <button
              onClick={() => setIsReplyAllDropdownOpen(!isReplyAllDropdownOpen)}
              className="h-7 px-1.5 bg-[#0e63cc] hover:bg-blue-700 text-white rounded-r text-[11px] flex items-center border-l border-blue-400 transition-colors cursor-pointer"
              title="More Reply Options"
            >
              <ChevronDown className="w-2.5 h-2.5 opacity-90" />
            </button>

            {isReplyAllDropdownOpen && (
              <div className="absolute right-0 top-8 w-60 bg-white rounded-xl shadow-2xl border border-gray-200 py-1.5 z-40 text-xs animate-fadeIn">
                <button
                  onClick={handleOpenReplyAll}
                  className="w-full text-left px-3 py-2 hover:bg-blue-50 flex items-center gap-2 font-medium text-gray-800 cursor-pointer"
                >
                  <Mail className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <div>
                    <div className="font-bold text-gray-900">Reply All (Dialog)</div>
                    <div className="text-[10px] text-gray-500">Edit, review & dispatch to all</div>
                  </div>
                </button>

                <button
                  onClick={handleQuickAutoReplyAll}
                  className="w-full text-left px-3 py-2 hover:bg-emerald-50 flex items-center gap-2 font-medium text-emerald-800 cursor-pointer border-t border-gray-100"
                >
                  <Send className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <div>
                    <div className="font-bold text-emerald-900">⚡ 1-Click Instant Reply</div>
                    <div className="text-[10px] text-emerald-600">Dispatches acknowledgment right now</div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setComposerMode('public');
                    setActiveTab('conversations');
                    setIsReplyAllDropdownOpen(false);
                    setTimeout(() => {
                      composerTextareaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      composerTextareaRef.current?.focus();
                    }, 100);
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-blue-50 flex items-center gap-2 font-medium text-gray-800 cursor-pointer border-t border-gray-100"
                >
                  <Share2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <div className="text-xs text-gray-700">Open Bottom Composer</div>
                </button>

                <button
                  onClick={() => {
                    setComposerMode('public');
                    setComposerText(`[FWD: ${activeTicket?.title}]\n\n--- Forwarded Message ---\n${activeTicket?.description}`);
                    setActiveTab('conversations');
                    setIsReplyAllDropdownOpen(false);
                    setTimeout(() => {
                      composerTextareaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      composerTextareaRef.current?.focus();
                    }, 100);
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-blue-50 flex items-center gap-2 font-medium text-gray-800 cursor-pointer border-t border-gray-100"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <div className="text-xs text-gray-700">Forward Ticket</div>
                </button>
              </div>
            )}
          </div>

          <button
            onClick={() => {
              setComposerMode('internal');
              setActiveTab('conversations');
              composerTextareaRef.current?.focus();
            }}
            className="h-7 w-7 rounded border border-gray-300 hover:bg-gray-50 text-gray-600 flex items-center justify-center cursor-pointer"
            title="Add Private Team Note"
          >
            <MessageSquare className="w-3.5 h-3.5" />
          </button>

          <div className="relative" ref={ticketMoreMenuRef}>
            <button
              onClick={() => setIsTicketMoreMenuOpen(!isTicketMoreMenuOpen)}
              className="h-7 w-7 rounded border border-gray-300 hover:bg-gray-50 text-gray-600 flex items-center justify-center cursor-pointer"
              title="More Actions"
            >
              <MoreHorizontal className="w-3.5 h-3.5" />
            </button>
            {isTicketMoreMenuOpen && (
              <div className="absolute right-0 top-8 w-44 bg-white rounded-lg shadow-xl border border-gray-200 py-1.5 z-40 text-xs">
                <button
                  onClick={() => {
                    window.print();
                    setIsTicketMoreMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-gray-50 flex items-center gap-2 font-medium"
                >
                  <Printer className="w-3.5 h-3.5 text-gray-500" />
                  <span>Print Ticket</span>
                </button>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    alert('Ticket link copied to clipboard!');
                    setIsTicketMoreMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-gray-50 flex items-center gap-2 font-medium"
                >
                  <Copy className="w-3.5 h-3.5 text-gray-500" />
                  <span>Copy Link</span>
                </button>
                <button
                  onClick={handleDeleteCurrentTicket}
                  className="w-full text-left px-3 py-2 hover:bg-rose-50 text-rose-600 flex items-center gap-2 font-medium"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Ticket</span>
                </button>
              </div>
            )}
          </div>

          <div
            className={`h-7 px-2.5 text-[10px] font-bold tracking-wider uppercase rounded flex items-center text-white ${
              activeTicket?.status === 'Closed' ? 'bg-emerald-600' : 'bg-blue-600'
            }`}
          >
            {activeTicket?.status || 'OPEN'}
          </div>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center gap-6 px-4 border-b border-[#E2E8F0] text-[11px] font-semibold text-gray-500 bg-[#FAFBFD] uppercase tracking-wider shrink-0">
        <button
          onClick={() => setActiveTab('conversations')}
          className={`py-2.5 border-b-2 font-bold transition-all ${
            activeTab === 'conversations' ? 'border-blue-600 text-blue-600' : 'border-transparent hover:text-gray-800'
          }`}
        >
          {conversationCount} CONVERSATION{conversationCount === 1 ? '' : 'S'} ▾
        </button>
        <button
          onClick={() => setActiveTab('resolution')}
          className={`py-2.5 border-b-2 transition-all ${
            activeTab === 'resolution' ? 'border-blue-600 text-blue-600 font-bold' : 'border-transparent hover:text-gray-800'
          }`}
        >
          RESOLUTION
        </button>
        <button
          onClick={() => setActiveTab('time')}
          className={`py-2.5 border-b-2 transition-all ${
            activeTab === 'time' ? 'border-blue-600 text-blue-600 font-bold' : 'border-transparent hover:text-gray-800'
          }`}
        >
          TIME ENTRY ({timeEntries.length})
        </button>
        <button
          onClick={() => setActiveTab('attachment')}
          className={`py-2.5 border-b-2 transition-all ${
            activeTab === 'attachment' ? 'border-blue-600 text-blue-600 font-bold' : 'border-transparent hover:text-gray-800'
          }`}
        >
          ATTACHMENT ({attachments.length})
        </button>
        <button
          onClick={() => setActiveTab('activity')}
          className={`py-2.5 border-b-2 transition-all ${
            activeTab === 'activity' ? 'border-blue-600 text-blue-600 font-bold' : 'border-transparent hover:text-gray-800'
          }`}
        >
          ACTIVITY
        </button>
      </div>

      {/* Tab 1: CONVERSATIONS */}
      {activeTab === 'conversations' && (
        <>
          <ConversationFeed
            activeTicket={activeTicket}
            timelineEntries={timelineEntries}
            csatRating={csatRating}
            setCsatRating={setCsatRating}
          />
          <ConversationComposer
            activeTicket={activeTicket}
            composerMode={composerMode}
            setComposerMode={setComposerMode}
            composerText={composerText}
            setComposerText={setComposerText}
            composerAttachedFiles={composerAttachedFiles}
            setComposerAttachedFiles={setComposerAttachedFiles}
            composerTextareaRef={composerTextareaRef}
            fileInputRef={fileInputRef}
            setIsCannedModalOpen={setIsCannedModalOpen}
            sendingReply={sendingReply}
            handleSendComposerAction={handleSendComposerAction}
          />
        </>
      )}

      {/* Tab 2: RESOLUTION TAB */}
      {activeTab === 'resolution' && (
        <TicketResolutionTab
          activeTicket={activeTicket}
          rootCause={rootCause}
          setRootCause={setRootCause}
          resolutionText={resolutionText}
          setResolutionText={setResolutionText}
          resolutionSuccessMessage={resolutionSuccessMessage}
          savingResolution={savingResolution}
          handleSaveResolution={handleSaveResolution}
        />
      )}

      {/* Tab 3: TIME ENTRY TAB */}
      {activeTab === 'time' && (
        <TicketTimeTab
          timerSeconds={timerSeconds}
          isTimerRunning={isTimerRunning}
          setIsTimerRunning={setIsTimerRunning}
          handleCommitTimerToLog={handleCommitTimerToLog}
          newLogHours={newLogHours}
          setNewLogHours={setNewLogHours}
          newLogActivity={newLogActivity}
          setNewLogActivity={setNewLogActivity}
          newLogBillable={newLogBillable}
          setNewLogBillable={setNewLogBillable}
          handleAddTimeEntry={handleAddTimeEntry}
          timeEntries={timeEntries}
        />
      )}

      {/* Tab 4: ATTACHMENTS TAB */}
      {activeTab === 'attachment' && (
        <TicketAttachmentsTab
          attachments={attachments}
          setAttachments={setAttachments}
          fileInputRef={fileInputRef}
        />
      )}

      {/* Tab 5: ACTIVITY TAB */}
      {activeTab === 'activity' && (
        <TicketActivityTab activityLogs={activityLogs} />
      )}

      {/* Bottom Sticky Footer */}
      <div className="h-9 px-4 border-t border-[#E2E8F0] bg-[#FAFBFD] flex items-center justify-between text-xs text-gray-600 shrink-0">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsMacroModalOpen(true)}
            className="flex items-center gap-1 hover:text-blue-600 font-medium cursor-pointer"
          >
            <span>🔗</span>
            <span>Apply Macro</span>
          </button>
          <button
            onClick={() => setIsRemoteAssistModalOpen(true)}
            className="flex items-center gap-1 hover:text-blue-600 font-medium cursor-pointer"
          >
            <span>🖥</span>
            <span>Remote Assist 🛈</span>
          </button>
        </div>

        <button
          onClick={() =>
            handleStatusChange(
              activeTicket!.name,
              activeTicket?.status === 'Closed' ? 'Open' : 'Closed'
            )
          }
          className="px-3.5 py-1 border border-blue-600 text-blue-600 rounded bg-white hover:bg-blue-50 text-xs font-medium cursor-pointer"
        >
          {activeTicket?.status === 'Closed' ? 'Reopen Ticket' : 'Close Ticket'}
        </button>
      </div>
    </div>
  );
};

export default TicketConversationPane;
