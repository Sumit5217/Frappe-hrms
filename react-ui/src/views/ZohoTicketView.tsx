import React, { useState } from 'react';
import {
  Ticket,
  ViewMode,
  ZohoTicketViewProps,
  CustomerRecord,
} from './zoho/types';
import { parseTicketTimeline } from './zoho/constants';
import { useZohoTickets } from './zoho/hooks/useZohoTickets';
import { frappeApi } from '../api/frappe';

// Re-export parseTicketTimeline for backward compatibility
export { parseTicketTimeline };
export type { ZohoTicketViewProps };

// Layout & Navigation Components
import { ZohoTopBar } from './zoho/components/ZohoTopBar';
import { ZohoLeftRail } from './zoho/components/ZohoLeftRail';
import { ZohoSubHeader } from './zoho/components/ZohoSubHeader';

// View Modes
import { ZohoTableView } from './zoho/components/views/ZohoTableView';
import { ZohoClassicView } from './zoho/components/views/ZohoClassicView';
import { ZohoCompactView } from './zoho/components/views/ZohoCompactView';
import { ZohoKanbanViews } from './zoho/components/views/ZohoKanbanViews';

// 3-Pane Detail Components
import { TicketQueueStrip } from './zoho/detail/TicketQueueStrip';
import { TicketPropertiesPane } from './zoho/detail/TicketPropertiesPane';
import { TicketConversationPane } from './zoho/detail/TicketConversationPane';

// Drawers
import { KnowledgeBaseDrawer } from './zoho/drawers/KnowledgeBaseDrawer';
import { CustomersDirectoryDrawer } from './zoho/drawers/CustomersDirectoryDrawer';
import { FilterDrawer } from './zoho/drawers/FilterDrawer';
import { AgentQueueDrawer } from './zoho/drawers/AgentQueueDrawer';
import { TeamQueueDrawer } from './zoho/drawers/TeamQueueDrawer';
import { TeamFeedsDrawer } from './zoho/drawers/TeamFeedsDrawer';
import { TicketTagsDrawer } from './zoho/drawers/TicketTagsDrawer';

// Modals
import { CreateTicketModal } from './zoho/modals/CreateTicketModal';
import { EditTicketPropertiesModal } from './zoho/modals/EditTicketPropertiesModal';
import { NewContactModal } from './zoho/modals/NewContactModal';
import { ReplyAllModal } from './zoho/modals/ReplyAllModal';
import { MacroSelectorModal } from './zoho/modals/MacroSelectorModal';
import { RemoteAssistModal } from './zoho/modals/RemoteAssistModal';
import { CannedSnippetModal } from './zoho/modals/CannedSnippetModal';

export const ZohoTicketView: React.FC<ZohoTicketViewProps> = ({
  onBackToDashboard,
  onToggleHRSidebar,
  isHRSidebarOpen = false,
}) => {
  const {
    tickets,
    setTickets,
    refreshing,
    error,
    fetchTickets,
    selectedDepartment,
    setSelectedDepartment,
    notifications,
    selectedAgentFilter,
    setSelectedAgentFilter,
    selectedTeamFilter,
    setSelectedTeamFilter,
    selectedTagFilter,
    setSelectedTagFilter,
    queueFilter,
    setQueueFilter,
    selectedTicketId,
    setSelectedTicketId,
    searchQuery,
    setSearchQuery,
    filterPriority,
    setFilterPriority,
    filterStatus,
    setFilterStatus,
    filterCategory,
    setFilterCategory,
    selectedRowIds,
    setSelectedRowIds,
    activeTab,
    setActiveTab,
    composerMode,
    setComposerMode,
    composerText,
    setComposerText,
    sendingReply,
    timerSeconds,
    isTimerRunning,
    setIsTimerRunning,
    isPropertiesPaneOpen,
    setIsPropertiesPaneOpen,
    isReplyAllDropdownOpen,
    setIsReplyAllDropdownOpen,
    isTicketMoreMenuOpen,
    setIsTicketMoreMenuOpen,
    csatRating,
    setCsatRating,
    resolutionText,
    setResolutionText,
    rootCause,
    setRootCause,
    savingResolution,
    resolutionSuccessMessage,
    timeEntries,
    setAttachments,
    newLogHours,
    setNewLogHours,
    newLogActivity,
    setNewLogActivity,
    newLogBillable,
    setNewLogBillable,
    attachments,
    composerAttachedFiles,
    setComposerAttachedFiles,
    setCustomContacts,
    fileInputRef,
    composerTextareaRef,
    replyAllRef,
    ticketMoreMenuRef,
    filteredTickets,
    activeTicket,
    timelineEntries,
    conversationCount,
    activityLogs,
    agentStats,
    teamStats,
    allCustomers,
    allAccounts,
    handleStatusChange,
    handleBulkStatusChange,
    handleBulkDelete,
    handleDeleteCurrentTicket,
    handleSaveResolution,
    handleAddTimeEntry,
    handleCommitTimerToLog,
    handleFileUpload,
    handleSendComposerAction,
    handleQuickAutoReplyAll,
    handleApplyMacro,
  } = useZohoTickets();

  // Drawers & Modals Visibility
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [isAgentQueueDrawerOpen, setIsAgentQueueDrawerOpen] = useState(false);
  const [isTeamQueueDrawerOpen, setIsTeamQueueDrawerOpen] = useState(false);
  const [isTeamFeedsDrawerOpen, setIsTeamFeedsDrawerOpen] = useState(false);
  const [isTagsDrawerOpen, setIsTagsDrawerOpen] = useState(false);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [isKnowledgeDrawerOpen, setIsKnowledgeDrawerOpen] = useState(false);
  const [isCustomersDrawerOpen, setIsCustomersDrawerOpen] = useState(false);
  const [isNewContactModalOpen, setIsNewContactModalOpen] = useState(false);
  const [isNewTicketModalOpen, setIsNewTicketModalOpen] = useState(false);
  const [isReplyAllModalOpen, setIsReplyAllModalOpen] = useState(false);
  const [isMacroModalOpen, setIsMacroModalOpen] = useState(false);
  const [isRemoteAssistModalOpen, setIsRemoteAssistModalOpen] = useState(false);
  const [isEditPropertiesModalOpen, setIsEditPropertiesModalOpen] = useState(false);
  const [isCannedModalOpen, setIsCannedModalOpen] = useState(false);

  return (
    <div className="flex flex-col h-screen w-full bg-[#F8FAFC] text-[#1E293B] font-sans overflow-hidden select-none">
      <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />

      {/* Top Application Bar */}
      <ZohoTopBar
        onBackToDashboard={onBackToDashboard}
        onToggleHRSidebar={onToggleHRSidebar}
        isHRSidebarOpen={isHRSidebarOpen}
        tickets={tickets}
        viewMode={viewMode}
        setViewMode={setViewMode}
        setSelectedTicketId={setSelectedTicketId}
        isCustomersDrawerOpen={isCustomersDrawerOpen}
        setIsCustomersDrawerOpen={setIsCustomersDrawerOpen}
        isKnowledgeDrawerOpen={isKnowledgeDrawerOpen}
        setIsKnowledgeDrawerOpen={setIsKnowledgeDrawerOpen}
        setIsFilterDrawerOpen={setIsFilterDrawerOpen}
        setIsNewTicketModalOpen={setIsNewTicketModalOpen}
        setIsNewContactModalOpen={setIsNewContactModalOpen}
        setIsAgentQueueDrawerOpen={setIsAgentQueueDrawerOpen}
        selectedDepartment={selectedDepartment}
        setSelectedDepartment={setSelectedDepartment}
        notifications={notifications}
        agentStats={agentStats}
      />

      {/* Main Split Layout */}
      <div className="flex-1 flex overflow-hidden">
        <ZohoLeftRail
          selectedTicketId={selectedTicketId}
          setSelectedTicketId={setSelectedTicketId}
          viewMode={viewMode}
          setViewMode={setViewMode}
          selectedAgentFilter={selectedAgentFilter}
          selectedTeamFilter={selectedTeamFilter}
          selectedTagFilter={selectedTagFilter}
          setIsTeamFeedsDrawerOpen={setIsTeamFeedsDrawerOpen}
          setIsAgentQueueDrawerOpen={setIsAgentQueueDrawerOpen}
          setIsTeamQueueDrawerOpen={setIsTeamQueueDrawerOpen}
          setIsTagsDrawerOpen={setIsTagsDrawerOpen}
          onBackToDashboard={onBackToDashboard}
        />

        {/* Center Workspace */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-white">
          {!selectedTicketId ? (
            <>
              <ZohoSubHeader
                tickets={tickets}
                filteredTickets={filteredTickets}
                queueFilter={queueFilter}
                setQueueFilter={setQueueFilter}
                selectedAgentFilter={selectedAgentFilter}
                setSelectedAgentFilter={setSelectedAgentFilter}
                selectedTeamFilter={selectedTeamFilter}
                setSelectedTeamFilter={setSelectedTeamFilter}
                selectedTagFilter={selectedTagFilter}
                setSelectedTagFilter={setSelectedTagFilter}
                selectedDepartment={selectedDepartment}
                setSelectedDepartment={setSelectedDepartment}
                viewMode={viewMode}
                setViewMode={setViewMode}
                setIsFilterDrawerOpen={setIsFilterDrawerOpen}
                setIsKnowledgeDrawerOpen={setIsKnowledgeDrawerOpen}
                setIsNewTicketModalOpen={setIsNewTicketModalOpen}
                fetchTickets={fetchTickets}
                refreshing={refreshing}
                selectedRowIds={selectedRowIds}
                setSelectedRowIds={setSelectedRowIds}
                handleBulkStatusChange={handleBulkStatusChange}
                handleBulkDelete={handleBulkDelete}
                error={error}
                setFilterStatus={setFilterStatus}
              />

              <div className="flex-1 overflow-auto bg-white">
                {viewMode === 'table' && (
                  <ZohoTableView
                    loading={refreshing}
                    filteredTickets={filteredTickets}
                    selectedRowIds={selectedRowIds}
                    isAllSelected={selectedRowIds.length > 0 && selectedRowIds.length === filteredTickets.length}
                    toggleSelectAll={() => setSelectedRowIds(selectedRowIds.length === filteredTickets.length ? [] : filteredTickets.map((t) => t.name))}
                    toggleSelectRow={(name: string) => setSelectedRowIds((prev) => (prev.includes(name) ? prev.filter((id) => id !== name) : [...prev, name]))}
                    setSelectedTicketId={setSelectedTicketId}
                    handleStatusChange={handleStatusChange}
                  />
                )}
                {viewMode === 'classic' && (
                  <ZohoClassicView
                    loading={refreshing}
                    filteredTickets={filteredTickets}
                    selectedRowIds={selectedRowIds}
                    isAllSelected={selectedRowIds.length > 0 && selectedRowIds.length === filteredTickets.length}
                    toggleSelectAll={() => setSelectedRowIds(selectedRowIds.length === filteredTickets.length ? [] : filteredTickets.map((t) => t.name))}
                    toggleSelectRow={(name: string) => setSelectedRowIds((prev) => (prev.includes(name) ? prev.filter((id) => id !== name) : [...prev, name]))}
                    setSelectedTicketId={setSelectedTicketId}
                    handleStatusChange={handleStatusChange}
                  />
                )}
                {viewMode === 'compact' && (
                  <ZohoCompactView
                    loading={refreshing}
                    filteredTickets={filteredTickets}
                    selectedRowIds={selectedRowIds}
                    isAllSelected={selectedRowIds.length > 0 && selectedRowIds.length === filteredTickets.length}
                    toggleSelectAll={() => setSelectedRowIds(selectedRowIds.length === filteredTickets.length ? [] : filteredTickets.map((t) => t.name))}
                    toggleSelectRow={(name: string) => setSelectedRowIds((prev) => (prev.includes(name) ? prev.filter((id) => id !== name) : [...prev, name]))}
                    setSelectedTicketId={setSelectedTicketId}
                    handleStatusChange={handleStatusChange}
                  />
                )}
                {(viewMode === 'status' || viewMode === 'handshake' || viewMode === 'countdown' || viewMode === 'priority') && (
                  <ZohoKanbanViews
                    filteredTickets={filteredTickets}
                    viewMode={viewMode}
                    setSelectedTicketId={setSelectedTicketId}
                  />
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex overflow-hidden">
              <TicketQueueStrip
                filteredTickets={filteredTickets}
                selectedTicketId={selectedTicketId}
                setSelectedTicketId={setSelectedTicketId}
                handleStatusChange={handleStatusChange}
                isPropertiesPaneOpen={isPropertiesPaneOpen}
                setIsPropertiesPaneOpen={setIsPropertiesPaneOpen}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
              />
              <TicketPropertiesPane
                ticket={activeTicket}
                isOpen={isPropertiesPaneOpen}
                onClose={() => setIsPropertiesPaneOpen(false)}
                onOpenEditModal={() => setIsEditPropertiesModalOpen(true)}
                handleStatusChange={handleStatusChange}
              />
              <TicketConversationPane
                activeTicket={activeTicket || undefined}
                timerSeconds={timerSeconds}
                isTimerRunning={isTimerRunning}
                setIsTimerRunning={setIsTimerRunning}
                isPropertiesPaneOpen={isPropertiesPaneOpen}
                setIsPropertiesPaneOpen={setIsPropertiesPaneOpen}
                handleOpenReplyAll={() => setIsReplyAllModalOpen(true)}
                isReplyAllDropdownOpen={isReplyAllDropdownOpen}
                setIsReplyAllDropdownOpen={setIsReplyAllDropdownOpen}
                replyAllRef={replyAllRef}
                handleQuickAutoReplyAll={handleQuickAutoReplyAll}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                conversationCount={conversationCount}
                timelineEntries={timelineEntries}
                csatRating={csatRating}
                setCsatRating={setCsatRating}
                composerMode={composerMode}
                setComposerMode={setComposerMode}
                composerText={composerText}
                setComposerText={setComposerText}
                composerAttachedFiles={composerAttachedFiles}
                setComposerAttachedFiles={setComposerAttachedFiles}
                composerTextareaRef={composerTextareaRef}
                fileInputRef={fileInputRef}
                isCannedModalOpen={isCannedModalOpen}
                setIsCannedModalOpen={setIsCannedModalOpen}
                sendingReply={sendingReply}
                handleSendComposerAction={handleSendComposerAction}
                rootCause={rootCause}
                setRootCause={setRootCause}
                resolutionText={resolutionText}
                setResolutionText={setResolutionText}
                resolutionSuccessMessage={resolutionSuccessMessage}
                savingResolution={savingResolution}
                handleSaveResolution={handleSaveResolution}
                handleCommitTimerToLog={handleCommitTimerToLog}
                newLogHours={newLogHours}
                setNewLogHours={setNewLogHours}
                newLogActivity={newLogActivity}
                setNewLogActivity={setNewLogActivity}
                newLogBillable={newLogBillable}
                setNewLogBillable={setNewLogBillable}
                handleAddTimeEntry={handleAddTimeEntry}
                timeEntries={timeEntries}
                attachments={attachments}
                setAttachments={setAttachments}
                activityLogs={activityLogs}
                setIsMacroModalOpen={setIsMacroModalOpen}
                setIsRemoteAssistModalOpen={setIsRemoteAssistModalOpen}
                handleStatusChange={handleStatusChange}
                isTicketMoreMenuOpen={isTicketMoreMenuOpen}
                setIsTicketMoreMenuOpen={setIsTicketMoreMenuOpen}
                ticketMoreMenuRef={ticketMoreMenuRef}
                handleDeleteCurrentTicket={handleDeleteCurrentTicket}
              />
            </div>
          )}
        </div>
      </div>

      {/* Drawers & Modals */}
      <KnowledgeBaseDrawer isOpen={isKnowledgeDrawerOpen} onClose={() => setIsKnowledgeDrawerOpen(false)} />
      <CustomersDirectoryDrawer
        isOpen={isCustomersDrawerOpen}
        onClose={() => setIsCustomersDrawerOpen(false)}
        allCustomers={allCustomers}
        allAccounts={allAccounts}
        onOpenNewContact={() => setIsNewContactModalOpen(true)}
        onOpenNewTicket={() => setIsNewTicketModalOpen(true)}
        onFilterDesk={(q: string) => { setSearchQuery(q); setIsCustomersDrawerOpen(false); }}
        onSelectTicket={(id: string) => { setSelectedTicketId(id); setIsCustomersDrawerOpen(false); }}
      />
      <FilterDrawer
        isOpen={isFilterDrawerOpen}
        onClose={() => setIsFilterDrawerOpen(false)}
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
        filterPriority={filterPriority}
        setFilterPriority={setFilterPriority}
        filterCategory={filterCategory}
        setFilterCategory={setFilterCategory}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />
      <AgentQueueDrawer
        isOpen={isAgentQueueDrawerOpen}
        onClose={() => setIsAgentQueueDrawerOpen(false)}
        agentStats={agentStats}
        selectedAgentFilter={selectedAgentFilter}
        setSelectedAgentFilter={setSelectedAgentFilter}
        setSelectedTicketId={setSelectedTicketId}
      />
      <TeamQueueDrawer
        isOpen={isTeamQueueDrawerOpen}
        onClose={() => setIsTeamQueueDrawerOpen(false)}
        teamStats={teamStats}
        selectedTeamFilter={selectedTeamFilter}
        setSelectedTeamFilter={setSelectedTeamFilter}
        setSelectedTicketId={setSelectedTicketId}
      />
      <TeamFeedsDrawer isOpen={isTeamFeedsDrawerOpen} onClose={() => setIsTeamFeedsDrawerOpen(false)} />
      <TicketTagsDrawer
        isOpen={isTagsDrawerOpen}
        onClose={() => setIsTagsDrawerOpen(false)}
        selectedTagFilter={selectedTagFilter}
        setSelectedTagFilter={setSelectedTagFilter}
        setSelectedTicketId={setSelectedTicketId}
      />
      <CreateTicketModal
        isOpen={isNewTicketModalOpen}
        onClose={() => setIsNewTicketModalOpen(false)}
        onCreated={() => { fetchTickets(); setIsNewTicketModalOpen(false); }}
      />
      {activeTicket && (
        <EditTicketPropertiesModal
          ticket={activeTicket}
          isOpen={isEditPropertiesModalOpen}
          onClose={() => setIsEditPropertiesModalOpen(false)}
          onUpdated={(props: Partial<Ticket>) => {
            setTickets((prev) => prev.map((t) => (t.name === activeTicket.name ? { ...t, ...props } : t)));
            setIsEditPropertiesModalOpen(false);
          }}
        />
      )}
      <NewContactModal
        isOpen={isNewContactModalOpen}
        onClose={() => setIsNewContactModalOpen(false)}
        onSave={(c: { name: string; company: string; email: string; phone: string; category: 'B2B' | 'B2C' | 'Internal' }) => {
          setCustomContacts((prev: CustomerRecord[]) => [...prev, { id: `custom-${Date.now()}`, ...c, tickets: [], openTicketsCount: 0 }]);
          alert(`Contact "${c.name}" saved!`);
        }}
      />
      {activeTicket && (
        <ReplyAllModal
          ticket={activeTicket}
          isOpen={isReplyAllModalOpen}
          onClose={() => setIsReplyAllModalOpen(false)}
          onSend={async (payload: { to: string; cc: string; subject: string; body: string; closeAfter: boolean }) => {
            try {
              const timeNow = new Date().toLocaleString();
              await frappeApi.sendComplaintEmail(activeTicket.name, payload.subject, payload.body, payload.to, 'support@nimblevision.io', 'support@nimblevision.io');
              const existing = activeTicket.internal_notes || '';
              const updated = `${existing ? existing + '\n' : ''}[${timeNow} - Reply All Dispatched to ${payload.to} (CC: ${payload.cc})]:\n${payload.body}`;
              await frappeApi.updateDocRecord('Complaint', activeTicket.name, {
                internal_notes: updated,
                status: payload.closeAfter ? 'Closed' : (activeTicket.status === 'Open' ? 'In Review' : activeTicket.status),
              });
              setTickets((prev) => prev.map((t) => (t.name === activeTicket.name ? { ...t, internal_notes: updated, status: payload.closeAfter ? 'Closed' : (t.status === 'Open' ? 'In Review' : t.status) } : t)));
              alert(`✓ Reply All dispatched to ${payload.to}!`);
            } catch (err: any) {
              alert(`Error dispatching reply: ${err.message}`);
            }
          }}
        />
      )}
      <MacroSelectorModal isOpen={isMacroModalOpen} onClose={() => setIsMacroModalOpen(false)} onApply={handleApplyMacro} />
      <RemoteAssistModal ticket={activeTicket} isOpen={isRemoteAssistModalOpen} onClose={() => setIsRemoteAssistModalOpen(false)} />
      <CannedSnippetModal
        ticket={activeTicket}
        isOpen={isCannedModalOpen}
        onClose={() => setIsCannedModalOpen(false)}
        onSelect={(snip: string) => {
          setComposerText(snip);
          setIsCannedModalOpen(false);
          composerTextareaRef.current?.focus();
        }}
      />
    </div>
  );
};

export default ZohoTicketView;
