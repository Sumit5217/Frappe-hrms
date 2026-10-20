import { useState, useEffect, useMemo, useRef } from 'react';
import { frappeApi } from '../../../api/frappe';
import {
  TimeEntry,
  AttachmentItem,
  ZohoNotification,
  QueueFilter,
} from '../types';
import { parseTicketTimeline } from '../constants';
import { useZohoTicketsData } from './useZohoTicketsData';

export const useZohoTickets = () => {
  // --- Department & Notifications ---
  const [selectedDepartment, setSelectedDepartment] = useState('All Departments');
  const [notifications, setNotifications] = useState<ZohoNotification[]>([
    {
      id: 'notif-1',
      ticketId: '#102',
      ticketName: 'High Pressure Sensor Drift - Unit #4B',
      title: 'SLA Response Warning (B2B Enterprise)',
      message: 'Apex Water Utilities Corp ticket is approaching 4-hour SLA response window.',
      time: '12m ago',
      type: 'sla',
      read: false,
    },
    {
      id: 'notif-2',
      ticketId: '#103',
      ticketName: 'Modbus Gateway RTU Cyclic Packet Loss',
      title: 'Critical Incident Alert (Metro Infra)',
      message: 'Substation SCADA telemetry gateway reporting 34% packet loss during peak telemetry cycle.',
      time: '35m ago',
      type: 'sla',
      read: false,
    },
    {
      id: 'notif-3',
      ticketId: '#104',
      ticketName: 'Preventative AMC Calibration & Firmware 2.4.1',
      title: 'New B2B Ticket Assigned to You',
      message: 'Tata Steel Utilities ticket assigned to Sumit Singh in Enterprise Support department.',
      time: '2h ago',
      type: 'assignment',
      read: true,
    },
    {
      id: 'notif-4',
      ticketId: '#101',
      ticketName: 'Delayed delivery',
      title: 'Customer Response Received',
      message: 'Sia kureel: "The customer called to state that their order has not arrived yet"',
      time: '5h ago',
      type: 'reply',
      read: true,
    },
  ]);

  // --- Filters ---
  const [selectedAgentFilter, setSelectedAgentFilter] = useState<string | null>(null);
  const [selectedTeamFilter, setSelectedTeamFilter] = useState<string | null>(null);
  const [selectedTagFilter, setSelectedTagFilter] = useState<string | null>(null);
  const [queueFilter, setQueueFilter] = useState<QueueFilter>('all');
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterPriority, setFilterPriority] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterCategory, setFilterCategory] = useState('All');
  const [selectedRowIds, setSelectedRowIds] = useState<string[]>([]);

  // Use Data Hook
  const {
    tickets,
    setTickets,
    refreshing,
    error,
    fetchTickets,
    filteredTickets,
    agentStats,
    teamStats,
    allCustomers,
    allAccounts,
    customContacts,
    setCustomContacts,
  } = useZohoTicketsData(
    selectedDepartment,
    selectedAgentFilter,
    selectedTeamFilter,
    selectedTagFilter,
    queueFilter,
    filterStatus,
    filterPriority,
    filterCategory,
    searchQuery
  );

  // --- Detail Workspace State ---
  const [activeTab, setActiveTab] = useState<'conversations' | 'resolution' | 'time' | 'attachment' | 'activity'>('conversations');
  const [composerMode, setComposerMode] = useState<'public' | 'internal'>('public');
  const [composerText, setComposerText] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isPropertiesPaneOpen, setIsPropertiesPaneOpen] = useState(true);
  const [isReplyAllDropdownOpen, setIsReplyAllDropdownOpen] = useState(false);
  const [isTicketMoreMenuOpen, setIsTicketMoreMenuOpen] = useState(false);
  const [csatRating, setCsatRating] = useState<'Good' | 'Bad' | null>(null);

  const [resolutionText, setResolutionText] = useState('');
  const [rootCause, setRootCause] = useState('Sensor Drift / Hardware Calibration');
  const [savingResolution, setSavingResolution] = useState(false);
  const [resolutionSuccessMessage, setResolutionSuccessMessage] = useState('');

  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([
    { id: '1', agent: 'Sumit Singh', hours: 0.75, date: '2026-10-06', activity: 'Initial Diagnostic & Telemetry inspection', billable: true },
    { id: '2', agent: 'Support Desk', hours: 0.5, date: '2026-10-05', activity: 'Customer call and ticket triage', billable: true },
  ]);
  const [newLogHours, setNewLogHours] = useState('1');
  const [newLogActivity, setNewLogActivity] = useState('');
  const [newLogBillable, setNewLogBillable] = useState(true);

  const [attachments, setAttachments] = useState<AttachmentItem[]>([
    { id: 'att-1', name: 'telemetry_log_sensor4b.csv', size: '245 KB', uploadedAt: '05 Oct 01:15 PM' },
    { id: 'att-2', name: 'sensor_calibration_spec.pdf', size: '1.2 MB', uploadedAt: '05 Oct 02:30 PM' },
  ]);
  const [composerAttachedFiles, setComposerAttachedFiles] = useState<string[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const composerTextareaRef = useRef<HTMLTextAreaElement>(null);
  const replyAllRef = useRef<HTMLDivElement>(null);
  const ticketMoreMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const activeTicket = useMemo(() => {
    if (!selectedTicketId) return null;
    return tickets.find((t) => t.name === selectedTicketId) || null;
  }, [tickets, selectedTicketId]);

  useEffect(() => {
    if (activeTicket) {
      setResolutionText(activeTicket.resolution_note || '');
      setResolutionSuccessMessage('');
      setCsatRating(null);
    }
  }, [activeTicket]);

  const timelineEntries = useMemo(() => {
    return parseTicketTimeline(activeTicket?.internal_notes, activeTicket?.assigned_to || 'Sumit Singh');
  }, [activeTicket?.internal_notes, activeTicket?.assigned_to]);

  const conversationCount = useMemo(() => {
    return 1 + timelineEntries.filter((e) => e.kind === 'email_reply').length;
  }, [timelineEntries]);

  const activityLogs = useMemo(() => {
    if (!activeTicket) return [];
    return [
      { id: 'act-1', action: 'Ticket Created', user: activeTicket.customer_name || 'Customer', timestamp: activeTicket.creation || '', detail: `Channel: ${activeTicket.source || 'Phone'} | Category: ${activeTicket.complaint_category}` },
      { id: 'act-2', action: 'SLA Applied', user: 'SLA Engine', timestamp: activeTicket.creation || '', detail: `Deadline set to ${activeTicket.sla_deadline || '2 business days'}` },
      { id: 'act-3', action: 'Assigned to Agent', user: 'Triage System', timestamp: activeTicket.creation || '', detail: `Assigned handler: ${activeTicket.assigned_to || 'Sumit Singh'}` },
      { id: 'act-4', action: 'Status Updated', user: 'Support Desk', timestamp: activeTicket.modified || '', detail: `Current status is marked as ${activeTicket.status}` },
    ];
  }, [activeTicket]);

  const handleStatusChange = async (ticketName: string, newStatus: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      setTickets((prev) => prev.map((t) => (t.name === ticketName ? { ...t, status: newStatus } : t)));
      await frappeApi.updateDocRecord('Complaint', ticketName, { status: newStatus });
    } catch (err) {
      console.error('Failed to update ticket status:', err);
      fetchTickets();
    }
  };

  const handleBulkStatusChange = async (newStatus: string) => {
    if (selectedRowIds.length === 0) return;
    try {
      setTickets((prev) => prev.map((t) => (selectedRowIds.includes(t.name) ? { ...t, status: newStatus } : t)));
      await Promise.all(selectedRowIds.map((id) => frappeApi.updateDocRecord('Complaint', id, { status: newStatus })));
      setSelectedRowIds([]);
    } catch (err) {
      console.error('Bulk status update failed:', err);
      fetchTickets();
    }
  };

  const handleBulkDelete = async () => {
    if (selectedRowIds.length === 0) return;
    if (!window.confirm(`Delete ${selectedRowIds.length} tickets permanently?`)) return;
    try {
      await Promise.all(selectedRowIds.map((id) => frappeApi.deleteDocRecord('Complaint', id)));
      setTickets((prev) => prev.filter((t) => !selectedRowIds.includes(t.name)));
      setSelectedRowIds([]);
      if (selectedTicketId && selectedRowIds.includes(selectedTicketId)) {
        setSelectedTicketId(null);
      }
    } catch (err) {
      console.error('Bulk delete failed:', err);
      fetchTickets();
    }
  };

  const handleDeleteCurrentTicket = async () => {
    if (!activeTicket) return;
    if (!window.confirm(`Permanently delete ticket ${activeTicket.displayId} (${activeTicket.title})?`)) return;
    try {
      await frappeApi.deleteDocRecord('Complaint', activeTicket.name);
      setTickets((prev) => prev.filter((t) => t.name !== activeTicket.name));
      setSelectedTicketId(null);
      setIsTicketMoreMenuOpen(false);
    } catch (err: any) {
      alert(`Error deleting ticket: ${err.message}`);
    }
  };

  const handleSaveResolution = async () => {
    if (!activeTicket) return;
    setSavingResolution(true);
    try {
      await frappeApi.updateDocRecord('Complaint', activeTicket.name, { resolution_note: resolutionText, status: 'Resolved' });
      setTickets((prev) => prev.map((t) => (t.name === activeTicket.name ? { ...t, resolution_note: resolutionText, status: 'Resolved' } : t)));
      setResolutionSuccessMessage('Resolution saved & ticket marked as Resolved in Frappe!');
    } catch (err: any) {
      alert(`Error saving resolution: ${err.message}`);
    } finally {
      setSavingResolution(false);
    }
  };

  const handleAddTimeEntry = (e: React.FormEvent) => {
    e.preventDefault();
    const hrs = parseFloat(newLogHours);
    if (isNaN(hrs) || hrs <= 0) return alert('Please enter valid hours');
    const newEntry: TimeEntry = {
      id: String(Date.now()),
      agent: 'Sumit Singh',
      hours: hrs,
      date: new Date().toISOString().split('T')[0],
      activity: newLogActivity.trim() || 'Work on ticket diagnostics',
      billable: newLogBillable,
    };
    setTimeEntries((prev) => [newEntry, ...prev]);
    setNewLogActivity('');
    setNewLogHours('1');
    alert(`Logged ${hrs} hours to ticket ${activeTicket?.displayId}`);
  };

  const handleCommitTimerToLog = () => {
    if (timerSeconds <= 0) return alert('Timer is 00:00:00. Start timer first!');
    const hrs = parseFloat((timerSeconds / 3600).toFixed(2));
    const newEntry: TimeEntry = {
      id: String(Date.now()),
      agent: 'Sumit Singh',
      hours: hrs > 0 ? hrs : 0.05,
      date: new Date().toISOString().split('T')[0],
      activity: `Live support session (${timerSeconds}s)`,
      billable: true,
    };
    setTimeEntries((prev) => [newEntry, ...prev]);
    setIsTimerRunning(false);
    setTimerSeconds(0);
    alert(`Recorded time entry to ticket!`);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    const newAtt: AttachmentItem = {
      id: `att-${Date.now()}`,
      name: file.name,
      size: `${(file.size / 1024).toFixed(1)} KB`,
      uploadedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setAttachments((prev) => [newAtt, ...prev]);
    setComposerAttachedFiles((prev) => [...prev, file.name]);
    alert(`Attached "${file.name}" to ticket ${activeTicket?.displayId}`);
  };

  const handleSendComposerAction = async (closeAfter: boolean = false) => {
    if (!activeTicket || !composerText.trim()) return;
    setSendingReply(true);
    try {
      const timeNow = new Date().toLocaleString();
      if (composerMode === 'internal') {
        const existing = activeTicket.internal_notes || '';
        const updated = `${existing ? existing + '\n' : ''}[${timeNow} - Team Note]: ${composerText.trim()}`;
        await frappeApi.updateDocRecord('Complaint', activeTicket.name, {
          internal_notes: updated,
          status: closeAfter ? 'Closed' : activeTicket.status,
        });
        setTickets((prev) => prev.map((t) => (t.name === activeTicket.name ? { ...t, internal_notes: updated, status: closeAfter ? 'Closed' : t.status } : t)));
      } else {
        await frappeApi.sendComplaintEmail(activeTicket.name, `Re: [${activeTicket.displayId}] ${activeTicket.title}`, composerText.trim(), activeTicket.email, 'support@nimblevision.io', 'support@nimblevision.io');
        const existing = activeTicket.internal_notes || '';
        const updated = `${existing ? existing + '\n' : ''}[${timeNow} - Email Dispatched]: ${composerText.trim()}`;
        await frappeApi.updateDocRecord('Complaint', activeTicket.name, {
          internal_notes: updated,
          status: closeAfter ? 'Closed' : activeTicket.status,
        });
        setTickets((prev) => prev.map((t) => (t.name === activeTicket.name ? { ...t, internal_notes: updated, status: closeAfter ? 'Closed' : t.status } : t)));
      }
      setComposerText('');
      setComposerAttachedFiles([]);
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setSendingReply(false);
    }
  };

  const handleQuickAutoReplyAll = async () => {
    if (!activeTicket) return;
    const recipient = activeTicket.email || 'customer@client.com';
    const cannedGreeting = `Dear ${activeTicket.customer_name || 'Customer'},\n\nThank you for reaching out to Nimble Vision Support regarding "${activeTicket.title}".\n\nOur support desk has received your ticket and is actively investigating the issue.\n\nBest regards,\n${activeTicket.assigned_to || 'Sumit Singh'}\nNimble Vision Support Desk`;
    setSendingReply(true);
    setIsReplyAllDropdownOpen(false);
    try {
      const timeNow = new Date().toLocaleString();
      await frappeApi.sendComplaintEmail(activeTicket.name, `Re: [${activeTicket.displayId}] ${activeTicket.title}`, cannedGreeting, recipient, 'support@nimblevision.io', 'support@nimblevision.io');
      const existing = activeTicket.internal_notes || '';
      const updated = `${existing ? existing + '\n' : ''}[${timeNow} - 1-Click Reply All to ${recipient}]:\n${cannedGreeting}`;
      await frappeApi.updateDocRecord('Complaint', activeTicket.name, {
        internal_notes: updated,
        status: activeTicket.status === 'Open' ? 'In Review' : activeTicket.status,
      });
      setTickets((prev) => prev.map((t) => (t.name === activeTicket.name ? { ...t, internal_notes: updated, status: t.status === 'Open' ? 'In Review' : t.status } : t)));
      alert(`✓ 1-Click Reply All dispatched immediately to ${recipient}!`);
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setSendingReply(false);
    }
  };

  const handleApplyMacro = async (macroType: string) => {
    if (!activeTicket) return;
    try {
      if (macroType === 'escalate') {
        await handleStatusChange(activeTicket.name, 'Escalated');
        alert(`Macro Applied: Ticket ${activeTicket.displayId} escalated to Level 2!`);
      } else if (macroType === 'resolve') {
        await frappeApi.updateDocRecord('Complaint', activeTicket.name, { status: 'Resolved', resolution_note: 'Resolved using standard hardware calibration procedure.' });
        setTickets((prev) => prev.map((t) => (t.name === activeTicket.name ? { ...t, status: 'Resolved', resolution_note: 'Resolved using standard procedure.' } : t)));
        alert(`Macro Applied: Ticket ${activeTicket.displayId} resolved!`);
      } else if (macroType === 'close') {
        await handleStatusChange(activeTicket.name, 'Closed');
        alert(`Macro Applied: Ticket ${activeTicket.displayId} closed!`);
      }
    } catch (err: any) {
      alert(`Error applying macro: ${err.message}`);
    }
  };

  return {
    tickets,
    setTickets,
    refreshing,
    error,
    fetchTickets,
    selectedDepartment,
    setSelectedDepartment,
    notifications,
    setNotifications,
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
    setTimeEntries,
    newLogHours,
    setNewLogHours,
    newLogActivity,
    setNewLogActivity,
    newLogBillable,
    setNewLogBillable,
    attachments,
    setAttachments,
    composerAttachedFiles,
    setComposerAttachedFiles,
    customContacts,
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
  };
};

export default useZohoTickets;
