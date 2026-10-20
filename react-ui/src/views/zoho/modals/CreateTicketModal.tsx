import React, { useState } from 'react';
import { X } from 'lucide-react';
import { frappeApi } from '../../../api/frappe';

export interface CreateTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export const CreateTicketModal: React.FC<CreateTicketModalProps> = ({ isOpen, onClose, onCreated }) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('B2C');
  const [complaintType, setComplaintType] = useState('Technical Issue');
  const [priority, setPriority] = useState('Medium');
  const [customerName, setCustomerName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return alert('Please enter a ticket title');
    setSaving(true);
    try {
      const payload = {
        title: title.trim(),
        complaint_category: category,
        complaint_type: complaintType,
        priority,
        status: 'Open',
        source: 'Web Form',
        customer_name: customerName.trim(),
        company_name: companyName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        description: description.trim(),
      };
      await frappeApi.createDocTypeRecord('Complaint', payload);
      onCreated();
    } catch (err: any) {
      alert(`Error creating ticket: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 cursor-pointer"
    >
      <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden border border-gray-200 text-xs cursor-default">
        <div className="px-5 py-3.5 bg-[#1A2232] text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm">Create New Ticket</span>
          </div>
          <X className="w-4 h-4 cursor-pointer text-gray-300 hover:text-white" onClick={onClose} />
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-3.5 max-h-[80vh] overflow-y-auto">
          <div>
            <label className="font-bold text-gray-700 block mb-1">Subject / Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Delayed delivery or Sensor calibration"
              className="w-full p-2 border border-gray-300 rounded text-xs outline-none focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="font-bold text-gray-700 block mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded text-xs"
              >
                <option value="B2C">B2C Customer</option>
                <option value="B2B">B2B Company</option>
                <option value="Internal">Internal</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-gray-700 block mb-1">Type</label>
              <select
                value={complaintType}
                onChange={(e) => setComplaintType(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded text-xs"
              >
                <option value="Technical Issue">Technical Issue</option>
                <option value="Billing Issue">Billing Issue</option>
                <option value="Service Complaint">Service Complaint</option>
                <option value="Delivery Issue">Delivery Issue</option>
                <option value="Quality Issue">Quality Issue</option>
              </select>
            </div>

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
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-gray-700 block mb-1">Contact Name</label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="e.g. Sia kureel"
                className="w-full p-2 border border-gray-300 rounded text-xs"
              />
            </div>
            <div>
              <label className="font-bold text-gray-700 block mb-1">Account Name</label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g. sia or Apex Water"
                className="w-full p-2 border border-gray-300 rounded text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-gray-700 block mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="customer@domain.com"
                className="w-full p-2 border border-gray-300 rounded text-xs"
              />
            </div>
            <div>
              <label className="font-bold text-gray-700 block mb-1">Phone</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="8347913451"
                className="w-full p-2 border border-gray-300 rounded text-xs"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-gray-700 block mb-1">Description</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detailed description of customer complaint..."
              className="w-full p-2 border border-gray-300 rounded text-xs"
            ></textarea>
          </div>

          <div className="pt-3 border-t border-gray-200 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 font-semibold text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-bold text-xs flex items-center gap-1.5 shadow-sm"
            >
              {saving ? 'Creating...' : 'Create Ticket'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
