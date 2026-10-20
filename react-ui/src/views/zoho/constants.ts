import { Ticket, ParsedTimelineEntry } from './types';

export const parseTicketTimeline = (
  internalNotes: string | undefined,
  defaultAgent: string
): ParsedTimelineEntry[] => {
  if (!internalNotes || !internalNotes.trim()) return [];

  const list: ParsedTimelineEntry[] = [];
  const trimmed = internalNotes.trim();

  // If there is preamble text before the first square bracket block
  const firstBracketIdx = trimmed.indexOf('[');
  if (firstBracketIdx > 0) {
    const preamble = trimmed.substring(0, firstBracketIdx).trim();
    if (preamble) {
      list.push({
        id: `timeline-preamble-${Date.now()}`,
        kind: 'internal_note',
        sender: defaultAgent || 'Sumit Singh',
        time: 'Internal Note',
        body: preamble,
        isReplyAll: false,
      });
    }
  }

  // Regex matches [Timestamp - Tag to recipient (CC: cc)]: Body
  const blockRegex = /\[([^\]]+)\]:\s*([\s\S]*?)(?=(?:\[[^\]]+\]:|$))/g;
  let match;

  while ((match = blockRegex.exec(trimmed)) !== null) {
    const rawHeader = match[1].trim();
    const rawBody = match[2].trim();

    const isEmail = /Reply All|1-Click Reply|Email Dispatched|Public Reply/i.test(rawHeader);
    const isReplyAll = /Reply All/i.test(rawHeader);

    const parts = rawHeader.split(' - ');
    const timeStr = parts[0]?.trim() || rawHeader;
    const descStr = parts.slice(1).join(' - ');

    const toMatch = descStr.match(/to\s+([^\s\(\)]+@[^\s\(\)]+)/i);
    const ccMatch = descStr.match(/\(CC:\s*([^\)]+)\)/i);

    list.push({
      id: `timeline-${list.length}-${Date.now()}`,
      kind: isEmail ? 'email_reply' : 'internal_note',
      sender: defaultAgent || 'Sumit Singh',
      time: timeStr,
      recipient: toMatch ? toMatch[1].trim() : undefined,
      cc: ccMatch ? ccMatch[1].trim() : undefined,
      body: rawBody,
      isReplyAll: isReplyAll,
    });
  }

  // Fallback for legacy text without brackets
  if (list.length === 0 && trimmed) {
    list.push({
      id: `timeline-legacy-${Date.now()}`,
      kind: 'internal_note',
      sender: defaultAgent || 'Sumit Singh',
      time: 'Internal Note',
      body: trimmed,
      isReplyAll: false,
    });
  }

  return list;
};

export const DEFAULT_B2B_TICKETS: Ticket[] = [
  {
    name: 'CMP-2026-00007',
    displayId: '#102',
    title: 'High Pressure Sensor Drift - Unit #4B',
    complaint_category: 'B2B',
    complaint_type: 'Technical Issue',
    priority: 'High',
    status: 'Open',
    sla_deadline: '2026-10-06 18:00:00',
    customer_name: 'David Chen',
    company_name: 'Apex Water Utilities Corp',
    contact_person: 'David Chen (VP Operations)',
    email: 'd.chen@apexwater.org',
    contact_email: 'd.chen@apexwater.org',
    phone: '+1 (555) 234-8901',
    contact_phone: '+1 (555) 234-8901',
    creation: '2026-10-06 08:30:00',
    modified: '2026-10-06 12:45:00',
    date: '2026-10-06',
    assigned_to: 'Sumit Singh',
    source: 'Email',
    description: 'Unit #4B telemetry pipeline is reporting intermittent pressure spikes up to 14.8 bar, exceeding the safety threshold calibration by 18%. Requesting urgent diagnostic dispatch or remote recalibration firmware patch.',
    internal_notes: 'Verified SCADA logs. Sensor serial SN-8841-B has not received firmware patch 2.4.1.',
    resolution_note: '',
  },
  {
    name: 'CMP-2026-00008',
    displayId: '#103',
    title: 'Modbus Gateway RTU Cyclic Packet Loss',
    complaint_category: 'B2B',
    complaint_type: 'Technical Issue',
    priority: 'Critical',
    status: 'Escalated',
    sla_deadline: '2026-10-06 15:30:00',
    customer_name: 'Rajesh Sharma',
    company_name: 'Metro Infrastructure & Smart City Ltd',
    contact_person: 'Rajesh Sharma (Chief Systems Engineer)',
    email: 'r.sharma@metroinfrasolutions.in',
    contact_email: 'r.sharma@metroinfrasolutions.in',
    phone: '+91 98201 44512',
    contact_phone: '+91 98201 44512',
    creation: '2026-10-06 09:15:00',
    modified: '2026-10-06 12:15:00',
    date: '2026-10-06',
    assigned_to: 'Sumit Singh',
    source: 'Phone',
    description: 'Substation SCADA telemetry gateway reporting 34% packet loss during peak telemetry cycle. Alarm notifications fail to route to centralized dashboard.',
    internal_notes: 'Priority escalation triggered. Network NOC team notified.',
    resolution_note: '',
  },
  {
    name: 'CMP-2026-00009',
    displayId: '#104',
    title: 'Preventative AMC Calibration & Firmware 2.4.1',
    complaint_category: 'B2B',
    complaint_type: 'AMC Service Request',
    priority: 'Medium',
    status: 'In Review',
    sla_deadline: '2026-10-07 14:00:00',
    customer_name: 'Vikram Joshi',
    company_name: 'Tata Steel Utilities & Services',
    contact_person: 'Vikram Joshi (Plant Maintenance Head)',
    email: 'v.joshi@tatasteelutilities.com',
    contact_email: 'v.joshi@tatasteelutilities.com',
    phone: '+91 98310 98765',
    contact_phone: '+91 98310 98765',
    creation: '2026-10-06 10:00:00',
    modified: '2026-10-06 11:20:00',
    date: '2026-10-06',
    assigned_to: 'Sumit Singh',
    source: 'Web Portal',
    description: 'Annual Maintenance Contract routine sensor recalibration due for Plant Line 3. Require scheduling site technician visit and offline firmware 2.4.1 flashing.',
    internal_notes: 'AMC agreement active through December 2027.',
    resolution_note: '',
  },
  {
    name: 'CMP-2026-00010',
    displayId: '#105',
    title: 'Enterprise Multi-Site Billing Discrepancy Q3',
    complaint_category: 'B2B',
    complaint_type: 'Billing & Enterprise Account',
    priority: 'Low',
    status: 'Open',
    sla_deadline: '2026-10-08 17:00:00',
    customer_name: 'Anita Desai',
    company_name: 'L&T Heavy Engineering Plant 2',
    contact_person: 'Anita Desai (Procurement Manager)',
    email: 'anita.desai@larsentoubro-eng.com',
    contact_email: 'anita.desai@larsentoubro-eng.com',
    phone: '+91 98112 33490',
    contact_phone: '+91 98112 33490',
    creation: '2026-10-06 11:00:00',
    modified: '2026-10-06 11:00:00',
    date: '2026-10-06',
    assigned_to: 'Sumit Singh',
    source: 'Email',
    description: 'Quarterly enterprise maintenance invoice #INV-88912 reflects 15 units instead of contracted 12 units for Hazira industrial complex.',
    internal_notes: 'Accounts department verification pending.',
    resolution_note: '',
  },
  {
    name: 'CMP-2026-00001',
    displayId: '#101',
    title: 'Delayed delivery',
    complaint_category: 'B2C',
    complaint_type: 'Delivery Issue',
    priority: 'Medium',
    status: 'Open',
    sla_deadline: '2026-10-06 12:31:00',
    customer_name: 'Sia kureel',
    company_name: 'Direct Customer',
    contact_person: 'Sia kureel',
    email: 'customer@example.com',
    contact_email: 'customer@example.com',
    phone: '8347913451',
    contact_phone: '8347913451',
    creation: '2026-10-05 12:31:00',
    modified: '2026-10-05 12:31:00',
    date: '2026-10-05',
    assigned_to: 'Sumit Singh',
    source: 'Phone',
    description: 'The customer called to state that their order has not arrived yet.',
    internal_notes: 'Carrier tracking updated.',
    resolution_note: '',
  }
];

export const ZOHO_STATUS_OPTIONS = [
  { value: 'Open', label: 'Open', dotColor: 'bg-black' },
  { value: 'On Hold', label: 'On Hold', dotColor: 'bg-[#F97316]' },
  { value: 'In Review', label: 'In Review', dotColor: 'bg-[#F59E0B]' },
  { value: 'Escalated', label: 'Escalated', dotColor: 'bg-black' },
  { value: 'Resolved', label: 'Resolved', dotColor: 'bg-[#2563EB]' },
  { value: 'Closed', label: 'Closed', dotColor: 'bg-[#16A34A]' },
];

export const getStatusBadge = (status: string) => {
  switch (status) {
    case 'Open':
      return 'text-blue-700 bg-blue-50 border border-blue-200 hover:bg-blue-100';
    case 'On Hold':
      return 'text-orange-700 bg-orange-50 border border-orange-200 hover:bg-orange-100';
    case 'In Review':
      return 'text-amber-700 bg-amber-50 border border-amber-200 hover:bg-amber-100';
    case 'Escalated':
      return 'text-rose-700 bg-rose-50 border border-rose-200 hover:bg-rose-100';
    case 'Resolved':
      return 'text-emerald-700 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100';
    case 'Closed':
      return 'text-green-700 bg-green-50 border border-green-200 hover:bg-green-100';
    default:
      return 'text-gray-700 bg-gray-50 border border-gray-200';
  }
};

export const formatTimer = (sec: number) => {
  const hrs = Math.floor(sec / 3600);
  const mins = Math.floor((sec % 3600) / 60);
  const secs = sec % 60;
  return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export const formatZohoDate = (dateStr?: string) => {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return dateStr;
  }
};

export const getRelativeTime = (dateStr?: string) => {
  if (!dateStr) return 'Recently';
  try {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHrs <= 0) return 'Just now';
    if (diffHrs === 1) return '1 hour ago';
    if (diffHrs < 24) return `${diffHrs} hours ago`;
    const diffDays = Math.floor(diffHrs / 24);
    return `${diffDays} days ago`;
  } catch {
    return '23 hours ago';
  }
};
