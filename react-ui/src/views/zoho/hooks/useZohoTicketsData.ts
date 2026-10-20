import { useState, useEffect, useMemo } from 'react';
import { frappeApi } from '../../../api/frappe';
import {
  Ticket,
  CustomerRecord,
  AccountRecord,
  AgentStat,
  TeamStat,
  QueueFilter,
} from '../types';
import { DEFAULT_B2B_TICKETS } from '../constants';

export const useZohoTicketsData = (
  selectedDepartment: string,
  selectedAgentFilter: string | null,
  selectedTeamFilter: string | null,
  selectedTagFilter: string | null,
  queueFilter: QueueFilter,
  filterStatus: string,
  filterPriority: string,
  filterCategory: string,
  searchQuery: string
) => {
  const [tickets, setTickets] = useState<Ticket[]>(DEFAULT_B2B_TICKETS);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [customContacts, setCustomContacts] = useState<CustomerRecord[]>([]);

  const fetchTickets = async () => {
    try {
      setRefreshing(true);
      setError(null);
      const res = await frappeApi.getDocTypeList('Complaint', 200);
      const rawData = res.data || [];

      const formatted: Ticket[] = rawData.map((d: any, idx: number) => {
        const numPart = d.name.replace(/[^0-9]/g, '');
        const displayId = numPart ? `#${numPart.slice(-3) || (100 + idx)}` : `#${100 + idx}`;
        return {
          name: d.name,
          displayId,
          title: d.title || 'Untitled Ticket',
          complaint_category: d.complaint_category || 'B2C',
          complaint_type: d.complaint_type || 'Technical Issue',
          priority: d.priority || 'Medium',
          status: d.status || 'Open',
          sla_deadline: d.sla_deadline,
          customer_name: d.customer_name || d.contact_person || 'Customer',
          company_name: d.company_name || 'Individual',
          contact_person: d.contact_person || d.customer_name,
          email: d.email || d.contact_email || 'support@client.com',
          contact_email: d.contact_email || d.email,
          phone: d.phone || d.contact_phone || '8347913451',
          contact_phone: d.contact_phone || d.phone,
          creation: d.creation || d.date,
          modified: d.modified || d.creation || '2026-10-05 12:31:00',
          date: d.date || d.creation,
          assigned_to: d.assigned_to || 'Sumit Singh',
          source: d.source || 'Phone',
          description: d.description || 'The customer called to state that their order has not arrived yet.',
          internal_notes: d.internal_notes || '',
          resolution_note: d.resolution_note || '',
        };
      });

      if (formatted.length > 0) {
        setTickets(formatted);
      } else {
        setTickets(DEFAULT_B2B_TICKETS);
      }
    } catch (err: any) {
      console.warn('Could not fetch tickets from backend, preserving default B2B dataset:', err);
      setTickets((prev) => (prev.length > 0 ? prev : DEFAULT_B2B_TICKETS));
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const filteredTickets = useMemo(() => {
    return tickets.filter((t) => {
      if (selectedDepartment === 'Enterprise Support (B2B)' && t.complaint_category !== 'B2B') return false;
      if (selectedDepartment === 'Hardware & IoT Telemetry' && t.complaint_type !== 'Technical Issue' && !t.title.toLowerCase().includes('sensor')) return false;
      if (selectedDepartment === 'Logistics & Fulfilment' && t.complaint_type !== 'Delivery Issue' && !t.title.toLowerCase().includes('delivery')) return false;
      if (selectedDepartment === 'Customer Care (B2C)' && t.complaint_category !== 'B2C') return false;

      if (selectedAgentFilter) {
        if (selectedAgentFilter === 'Unassigned') {
          if (t.assigned_to) return false;
        } else if (!t.assigned_to || !t.assigned_to.toLowerCase().includes(selectedAgentFilter.toLowerCase())) {
          return false;
        }
      }

      if (selectedTeamFilter) {
        if (selectedTeamFilter === 'team-t1' && t.complaint_category !== 'B2C') return false;
        if (selectedTeamFilter === 'team-iot' && !t.title.toLowerCase().includes('sensor') && !t.title.toLowerCase().includes('gateway')) return false;
        if (selectedTeamFilter === 'team-logistics' && !t.title.toLowerCase().includes('delivery')) return false;
        if (selectedTeamFilter === 'team-enterprise' && t.complaint_category !== 'B2B') return false;
      }

      if (selectedTagFilter) {
        const matchesTag =
          t.title.toLowerCase().includes(selectedTagFilter.toLowerCase()) ||
          t.complaint_category.toLowerCase() === selectedTagFilter.toLowerCase() ||
          t.priority.toLowerCase() === selectedTagFilter.toLowerCase();
        if (!matchesTag) return false;
      }

      if (queueFilter === 'open' && t.status !== 'Open' && t.status !== 'In Review') return false;
      if (queueFilter === 'overdue' && t.status !== 'Escalated') return false;
      if (queueFilter === 'b2b' && t.complaint_category !== 'B2B') return false;
      if (queueFilter === 'b2c' && t.complaint_category !== 'B2C') return false;
      if (queueFilter === 'closed' && t.status !== 'Closed' && t.status !== 'Resolved') return false;

      if (filterStatus !== 'All' && t.status !== filterStatus) return false;
      if (filterPriority !== 'All' && t.priority !== filterPriority) return false;
      if (filterCategory !== 'All' && t.complaint_category !== filterCategory) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches =
          t.displayId.toLowerCase().includes(q) ||
          t.name.toLowerCase().includes(q) ||
          t.title.toLowerCase().includes(q) ||
          (t.customer_name && t.customer_name.toLowerCase().includes(q)) ||
          (t.company_name && t.company_name.toLowerCase().includes(q)) ||
          (t.email && t.email.toLowerCase().includes(q));
        if (!matches) return false;
      }
      return true;
    });
  }, [tickets, selectedDepartment, selectedAgentFilter, selectedTeamFilter, selectedTagFilter, queueFilter, filterStatus, filterPriority, filterCategory, searchQuery]);

  const agentStats: AgentStat[] = useMemo(() => {
    const sumitTickets = tickets.filter((t) => !t.assigned_to || t.assigned_to.toLowerCase().includes('sumit'));
    const siaTickets = tickets.filter((t) => t.assigned_to && t.assigned_to.toLowerCase().includes('sia'));
    const unassignedTickets = tickets.filter((t) => !t.assigned_to);
    return [
      { id: 'agent-sumit', name: 'Sumit Singh (You)', role: 'Tier 2 Lead Support Engineer', avatar: 'S', status: 'Online', openCount: sumitTickets.filter((t) => t.status !== 'Closed' && t.status !== 'Resolved').length || 1, totalCount: sumitTickets.length || 2, sla: '98.5%', filterValue: 'Sumit' },
      { id: 'agent-sia', name: 'Sia Kureel / Field Ops', role: 'Customer Success Specialist', avatar: 'SK', status: 'Active', openCount: siaTickets.filter((t) => t.status !== 'Closed').length || 1, totalCount: siaTickets.length || 1, sla: '96.0%', filterValue: 'Sia' },
      { id: 'agent-unassigned', name: 'Support Desk (Unassigned)', role: 'Triage Queue', avatar: '?', status: 'Pending', openCount: unassignedTickets.length, totalCount: unassignedTickets.length, sla: 'Needs Triage', filterValue: 'Unassigned' },
    ];
  }, [tickets]);

  const teamStats: TeamStat[] = useMemo(() => {
    return [
      { id: 'team-t1', name: 'Tier 1 Customer Support', dept: 'Customer Services', badge: 'B2C Squad', lead: 'Sumit Singh', members: 5, openCount: tickets.filter((t) => t.complaint_category === 'B2C' || t.complaint_type === 'Delivery Issue').length || 1, slaRate: '99.1%', avgResponse: '18 mins' },
      { id: 'team-iot', name: 'Hardware Diagnostics & IoT Engineering', dept: 'Sensor & Telemetry', badge: 'Engineering', lead: 'Field Systems Lead', members: 3, openCount: tickets.filter((t) => t.complaint_type === 'Technical Issue' || t.title.toLowerCase().includes('sensor')).length || 1, slaRate: '95.4%', avgResponse: '42 mins' },
      { id: 'team-logistics', name: 'Logistics & Fulfilment Team', dept: 'Delivery Operations', badge: 'Operations', lead: 'Logistics Supervisor', members: 4, openCount: tickets.filter((t) => t.complaint_type === 'Delivery Issue' || t.title.toLowerCase().includes('delivery')).length || 1, slaRate: '92.0%', avgResponse: '25 mins' },
      { id: 'team-enterprise', name: 'Enterprise Account Management', dept: 'B2B Client Services', badge: 'VIP B2B', lead: 'Key Account Exec', members: 2, openCount: tickets.filter((t) => t.complaint_category === 'B2B').length || 1, slaRate: '100%', avgResponse: '12 mins' },
    ];
  }, [tickets]);

  const allCustomers: CustomerRecord[] = useMemo(() => {
    const map = new Map<string, CustomerRecord>();
    tickets.forEach((t) => {
      const key = (t.customer_name || 'Customer').toLowerCase().trim();
      if (!map.has(key)) {
        map.set(key, {
          id: `cust-${key.replace(/\s+/g, '-')}`,
          name: t.customer_name || 'Customer',
          company: t.company_name || 'Individual',
          email: t.email || 'customer@client.com',
          phone: t.phone || '-',
          category: (t.complaint_category as any) || 'B2C',
          tickets: [],
          openTicketsCount: 0,
        });
      }
      const rec = map.get(key)!;
      rec.tickets.push(t);
      if (t.status !== 'Closed' && t.status !== 'Resolved') {
        rec.openTicketsCount += 1;
      }
    });
    customContacts.forEach((c) => {
      if (!map.has(c.name.toLowerCase().trim())) {
        map.set(c.name.toLowerCase().trim(), c);
      }
    });
    return Array.from(map.values());
  }, [tickets, customContacts]);

  const allAccounts: AccountRecord[] = useMemo(() => {
    const map = new Map<string, AccountRecord>();
    tickets.forEach((t) => {
      const comp = (t.company_name || 'Individual').trim();
      if (!map.has(comp)) {
        map.set(comp, {
          id: `acc-${comp.toLowerCase().replace(/\s+/g, '-')}`,
          name: comp,
          category: (t.complaint_category as any) || 'B2B',
          contacts: [],
          tickets: [],
          openTicketsCount: 0,
        });
      }
      const acc = map.get(comp)!;
      acc.tickets.push(t);
      if (t.customer_name && !acc.contacts.includes(t.customer_name)) {
        acc.contacts.push(t.customer_name);
      }
      if (t.status !== 'Closed' && t.status !== 'Resolved') {
        acc.openTicketsCount += 1;
      }
    });
    return Array.from(map.values());
  }, [tickets]);

  return {
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
  };
};

export default useZohoTicketsData;
