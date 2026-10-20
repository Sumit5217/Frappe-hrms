export interface Ticket {
  name: string;
  displayId: string;
  title: string;
  complaint_category: string; // 'B2B' | 'B2C' | 'Internal'
  complaint_type: string;
  priority: string; // 'Low' | 'Medium' | 'High' | 'Critical'
  status: string; // 'Open' | 'In Review' | 'Escalated' | 'Resolved' | 'Closed'
  sla_deadline?: string;
  customer_name?: string;
  company_name?: string;
  contact_person?: string;
  email?: string;
  contact_email?: string;
  phone?: string;
  contact_phone?: string;
  creation?: string;
  modified?: string;
  date?: string;
  assigned_to?: string;
  source?: string;
  description?: string;
  internal_notes?: string;
  resolution_note?: string;
}

export interface TimeEntry {
  id: string;
  agent: string;
  hours: number;
  date: string;
  activity: string;
  billable: boolean;
}

export interface AttachmentItem {
  id: string;
  name: string;
  size: string;
  uploadedAt: string;
  fileUrl?: string;
}

export interface ActivityEvent {
  id: string;
  action: string;
  user: string;
  timestamp: string;
  detail: string;
}

export interface ZohoNotification {
  id: string;
  ticketId: string;
  ticketName: string;
  title: string;
  message: string;
  time: string;
  type: 'sla' | 'reply' | 'assignment' | 'system';
  read: boolean;
}

export type ViewMode = 'table' | 'classic' | 'compact' | 'status' | 'handshake' | 'countdown' | 'priority';
export type QueueFilter = 'all' | 'open' | 'overdue' | 'b2b' | 'b2c' | 'closed';

// Timeline & Conversation Model
export interface ParsedTimelineEntry {
  id: string;
  kind: 'email_reply' | 'internal_note';
  sender: string;
  time: string;
  recipient?: string;
  cc?: string;
  body: string;
  isReplyAll?: boolean;
}

export interface CustomerRecord {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  category: 'B2B' | 'B2C' | 'Internal';
  tickets: Ticket[];
  openTicketsCount: number;
}

export interface AccountRecord {
  id: string;
  name: string;
  category: 'B2B' | 'B2C' | 'Internal';
  contacts: string[];
  tickets: Ticket[];
  openTicketsCount: number;
}

export interface ZohoTicketViewProps {
  onBackToDashboard?: () => void;
  onToggleHRSidebar?: () => void;
  isHRSidebarOpen?: boolean;
}

export interface AgentStat {
  id: string;
  name: string;
  role: string;
  avatar: string;
  status: string;
  openCount: number;
  totalCount: number;
  sla: string;
  filterValue: string;
}

export interface TeamStat {
  id: string;
  name: string;
  dept: string;
  badge: string;
  iconBg?: string;
  icon?: React.ReactNode;
  openCount: number;
  slaRate: string;
  avgResponse: string;
  lead: string;
  members: number;
}
