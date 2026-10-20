import React from 'react';
import { Paperclip, FileText, Download, Trash2 } from 'lucide-react';
import { AttachmentItem } from '../types';

export interface TicketAttachmentsTabProps {
  attachments: AttachmentItem[];
  setAttachments: React.Dispatch<React.SetStateAction<AttachmentItem[]>>;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
}

export const TicketAttachmentsTab: React.FC<TicketAttachmentsTabProps> = ({
  attachments,
  setAttachments,
  fileInputRef,
}) => {
  return (
    <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-[#F8FAFC]">
      <div
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed border-blue-300 hover:border-blue-500 bg-blue-50/30 rounded-lg p-6 text-center cursor-pointer transition-colors"
      >
        <Paperclip className="w-8 h-8 text-blue-500 mx-auto mb-2" />
        <h4 className="font-bold text-xs text-blue-900">Upload Ticket Attachment</h4>
        <p className="text-[11px] text-gray-500 mt-0.5">
          Drag and drop files here, or click to browse files from your computer
        </p>
      </div>

      <div className="bg-white rounded-lg border border-[#E2E8F0] overflow-hidden shadow-xs">
        <div className="p-3 border-b border-gray-100 font-bold text-xs text-gray-900 flex items-center justify-between">
          <span>Attached Files ({attachments.length})</span>
        </div>
        <div className="divide-y divide-gray-100 text-xs">
          {attachments.map((att) => (
            <div key={att.id} className="p-3 flex items-center justify-between hover:bg-gray-50">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-blue-600 shrink-0" />
                <div>
                  <span className="font-bold text-gray-800">{att.name}</span>
                  <div className="text-[11px] text-gray-400">
                    <span>{att.size}</span> · <span>{att.uploadedAt}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => alert(`Downloading "${att.name}"...`)}
                  className="p-1 rounded text-gray-500 hover:text-blue-600 hover:bg-blue-50 cursor-pointer"
                  title="Download"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setAttachments((prev) => prev.filter((a) => a.id !== att.id))}
                  className="p-1 rounded text-gray-500 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                  title="Delete"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TicketAttachmentsTab;
