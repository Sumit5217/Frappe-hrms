import React, { useState, useEffect } from 'react';
import {
  Settings,
  Save,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Sliders,
  ShieldCheck,
} from 'lucide-react';
import { frappeApi } from '../api/frappe';

interface SettingsViewProps {
  doctype: string;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ doctype }) => {
  const [doc, setDoc] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const loadSettings = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await frappeApi.getSingleDoc(doctype);
      if (data) {
        setDoc(data);
      }
    } catch (err: any) {
      setError(err.message || `Failed to load ${doctype}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, [doctype]);

  const handleChange = (key: string, value: any) => {
    setDoc((prev) => ({
      ...prev,
      [key]: value,
    }));
    setSavedSuccess(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await frappeApi.updateSingleDoc(doctype, doc);
      if (res.success) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3500);
      } else {
        setError(res.message || `Failed to save ${doctype}`);
      }
    } catch (err: any) {
      setError(err.message || 'Error saving settings');
    } finally {
      setSaving(false);
    }
  };

  // Filter out internal fields
  const editableKeys = Object.keys(doc).filter(
    (k) =>
      !k.startsWith('_') &&
      !['name', 'owner', 'modified', 'modified_by', 'creation', 'docstatus', 'idx', 'doctype'].includes(k)
  );

  const deskUrl = `http://localhost:8000/app/${doctype.toLowerCase().replace(/\s+/g, '-')}`;

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 bg-surface-lowest p-4 sm:p-5 rounded-card border border-[rgba(140,150,175,0.14)]">
        <div className="flex items-center gap-3.5">
          <div className="w-9 h-9 rounded-btn bg-[#EEF4FC] text-primary flex items-center justify-center font-bold shadow-xs">
            <Settings className="w-4.5 h-4.5" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="font-serif text-xl font-bold text-content-main tracking-tight">
                {doctype}
              </h2>
              <span className="font-label text-[10.5px] px-2 py-0.5 rounded-chip bg-[#FDF8E2] text-[#6D5E00] border border-[#6D5E00]/20 shadow-xs">
                System Master Settings
              </span>
            </div>
            <p className="text-xs font-sans text-content-muted mt-0.5">
              Global system configurations applied across all HR operations
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={loadSettings}
            disabled={loading}
            className="btn-secondary text-xs h-8.5 px-3"
            title="Reload settings"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Reload</span>
          </button>
          <a
            href={deskUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary text-xs h-8.5 px-3 inline-flex items-center gap-1.5"
            title="Open in Frappe Desk"
          >
            <span>Frappe Desk</span>
            <ExternalLink className="w-3 h-3" />
          </a>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || loading}
            className="btn-primary text-xs h-8.5 px-4 inline-flex items-center gap-1.5"
          >
            {saving ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Save className="w-3.5 h-3.5" />
            )}
            <span>{saving ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>
      </div>

      {savedSuccess && (
        <div className="bg-[#ECFDF5] border border-[#A7F3D0] text-[#059669] p-3 rounded-card text-xs flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span className="font-semibold">{doctype} saved and synced to Frappe backend successfully!</span>
        </div>
      )}

      {error && (
        <div className="bg-[#FEF2F2] border border-[#FECACA] text-[#DC2626] p-3 rounded-card text-xs flex items-center gap-2 animate-fadeIn">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Settings Form */}
      <div className="nv-card bg-white border border-border p-6 min-h-[360px]">
        {loading ? (
          <div className="p-16 text-center text-xs text-content-muted">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-primary" />
            <span>Loading {doctype} from Frappe backend...</span>
          </div>
        ) : editableKeys.length === 0 ? (
          <div className="p-12 text-center text-xs text-content-muted">
            <Sliders className="w-8 h-8 text-content-muted mx-auto mb-2" />
            <p className="font-bold text-sm text-content-main mb-1">No Settings Found</p>
            <p>No configuration properties found for {doctype}.</p>
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {editableKeys.map((key) => {
                const val = doc[key];
                const isBoolean = typeof val === 'boolean' || val === 0 || val === 1;
                const label = key
                  .replace(/_/g, ' ')
                  .replace(/\b\w/g, (l) => l.toUpperCase());

                if (isBoolean) {
                  const isChecked = Boolean(val);
                  return (
                    <div
                      key={key}
                      onClick={() => handleChange(key, isChecked ? 0 : 1)}
                      className="flex items-center justify-between p-3 rounded-btn border border-border hover:border-primary transition-colors cursor-pointer bg-[#F8FAFC]/50 hover:bg-[#EDF3FF]/30 select-none group"
                    >
                      <div className="pr-3">
                        <span className="font-semibold text-xs text-content-main group-hover:text-primary transition-colors block">
                          {label}
                        </span>
                        <span className="text-[11px] text-content-muted font-mono">
                          {key}
                        </span>
                      </div>
                      <div
                        className={`w-10 h-5 flex items-center rounded-full p-0.5 transition-colors ${
                          isChecked ? 'bg-primary justify-end' : 'bg-slate-300 justify-start'
                        }`}
                      >
                        <div className="bg-white w-4 h-4 rounded-full shadow-md transform transition-transform"></div>
                      </div>
                    </div>
                  );
                }

                return (
                  <div key={key} className="space-y-1.5">
                    <label className="block text-xs font-semibold text-content-main">
                      {label}
                    </label>
                    <input
                      type={typeof val === 'number' ? 'number' : 'text'}
                      value={val ?? ''}
                      onChange={(e) =>
                        handleChange(
                          key,
                          typeof val === 'number' ? Number(e.target.value) : e.target.value
                        )
                      }
                      className="nv-input w-full text-xs py-2 px-3"
                    />
                    <span className="text-[10px] text-content-muted font-mono block">
                      {key}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="pt-4 border-t border-border flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs text-content-muted">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Changes will take effect across the entire Frappe HR system immediately.</span>
              </div>
              <button
                type="submit"
                disabled={saving}
                className="btn-primary text-xs h-9 px-5 flex items-center gap-1.5"
              >
                {saving ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Save className="w-3.5 h-3.5" />
                )}
                <span>{saving ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
