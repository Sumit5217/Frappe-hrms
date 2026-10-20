import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { ZOHO_STATUS_OPTIONS, getStatusBadge } from '../constants';

export interface ZohoStatusDropdownProps {
  status: string;
  onChange: (newStatus: string) => void;
  align?: 'left' | 'right';
  size?: 'sm' | 'md';
  className?: string;
}

export const ZohoStatusDropdown: React.FC<ZohoStatusDropdownProps> = ({
  status,
  onChange,
  align = 'right',
  size = 'md',
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const currentOpt = ZOHO_STATUS_OPTIONS.find((o) => o.value === status) || {
    value: status,
    label: status,
    dotColor: 'bg-black',
  };

  return (
    <div className={`relative inline-block ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen((prev) => !prev);
        }}
        className={`inline-flex items-center gap-1.5 font-bold rounded-full cursor-pointer transition-all outline-none border shadow-2xs select-none ${
          size === 'sm' ? 'text-[11px] px-2.5 py-0.5' : 'text-xs px-3 py-1'
        } ${getStatusBadge(status)}`}
      >
        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${currentOpt.dotColor}`} />
        <span>{status}</span>
        <ChevronDown
          className={`w-3 h-3 opacity-60 ml-0.5 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div
          onClick={(e) => e.stopPropagation()}
          className={`absolute ${
            align === 'right' ? 'right-0' : 'left-0'
          } mt-1.5 w-44 bg-white rounded-lg shadow-xl border border-gray-200/90 py-2.5 z-50 animate-scaleUp`}
        >
          {/* Zoho Desk Header: STATUS with black underline */}
          <div className="px-4 pb-2 border-b border-gray-100">
            <span className="text-[11px] font-bold text-black tracking-wider uppercase block">
              STATUS
            </span>
            <div className="w-5 h-[2px] bg-black mt-1" />
          </div>

          {/* Status options list */}
          <div className="pt-1.5 pb-0.5 space-y-0.5">
            {ZOHO_STATUS_OPTIONS.map((opt) => {
              const isSelected = opt.value === status;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onChange(opt.value);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-4 py-2 text-xs text-left cursor-pointer transition-colors ${
                    isSelected ? 'bg-gray-100 font-semibold text-black' : 'text-gray-800 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className={`w-2 h-2 rounded-full ${opt.dotColor} shrink-0`} />
                    <span>{opt.label}</span>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-black shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
