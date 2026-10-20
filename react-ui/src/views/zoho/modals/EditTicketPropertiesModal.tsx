import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Ticket } from '../types';
import { frappeApi } from '../../../api/frappe';

export interface EditTicketPropertiesModalProps {
  ticket: Ticket;
  isOpen: boolean;
  onClose: () => void;
  onUpdated: (props: Partial<Ticket>) => void;
}

export const EditTicketPropertiesModal: React.FC<EditTicketPropertiesModalProps> = ({
  ticket,
  isOpen,
  onClose,
  onUpdated,
}) => {
  const [customerName, setCustomerName] = useState(ticket.customer_name || '');
  const [companyName, setCompanyName] = useState(ticket.company_name || '');
  const [email, setEmail] = useState(ticket.email || '');
  const [phone, setPhone] = useState(ticket.phone || '');
  const [priority, setPriority] = useState(ticket.priority);
  const [category, setCategory] = useState(ticket.complaint_category);
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        customer_name: customerName.trim(),
        company_name: companyName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        priority,
        complaint_category: category,
      };
      await frappeApi.updateDocRecord('Complaint', ticket.name, payload);
      onUpdated(payload);
    } catch (err: any) {
      alert(`Error updating ticket properties: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 cursor-pointer"
    >
      <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-xl shadow-2xl max-w-md w-full border border-gray-200 overflow-hidden text-xs cursor-default">
        <div className="p-4 bg-[#1A2232] text-white flex items-center justify-between font-bold">
          <span>Edit Properties ({ticket.displayId})</span>
          <X className="w-4 h-4 cursor-pointer" onClick={onClose} />
        </div>
        <form onSubmit={handleSave} className="p-4 space-y-3">
          <div>
            <label className="font-bold text-gray-700 block mb-1">Contact Name</label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded text-xs"
            />
          </div>
          <div>
            <label className="font-bold text-gray-700 block mb-1">Account / Company</label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded text-xs"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="font-bold text-gray-700 block mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded text-xs"
              />
            </div>
            <div>
              <label className="font-bold text-gray-700 block mb-1">Phone</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded text-xs"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="font-bold text-gray-700 block mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded text-xs"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>
            <div>
              <label className="font-bold text-gray-700 block mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded text-xs"
              >
                <option value="B2C">B2C</option>
                <option value="B2B">B2B</option>
                <option value="Internal">Internal</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t">
            <button type="button" onClick={onClose} className="px-3 py-1.5 border rounded text-gray-700">
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-1.5 bg-blue-600 text-white rounded font-bold hover:bg-blue-700"
            >
              {saving ? 'Saving...' : 'Save Properties'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
