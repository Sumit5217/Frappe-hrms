import React, { useState, useEffect, useMemo } from 'react';
import {
  Building2,
  FileText,
  ChevronDown,
  ChevronRight,
  Plus,
  Download,
  Maximize2,
  Minimize2,
  Edit3,
} from 'lucide-react';
import { frappeApi } from '../api/frappe';
import { Employee } from '../types';

interface OrgChartNode {
  id: string;
  name: string;
  title?: string;
  department?: string;
  company?: string;
  reports_to?: string | null;
  image?: string;
  expandable?: boolean;
  connections?: number;
  children?: OrgChartNode[];
}

interface OrganizationalChartViewProps {
  onAddEmployee: () => void;
  onEditEmployee?: (employee: Employee) => void;
  employees: Employee[];
}

export const OrganizationalChartView: React.FC<OrganizationalChartViewProps> = ({
  onAddEmployee,
  onEditEmployee,
  employees,
}) => {
  const [companies, setCompanies] = useState<Array<{ name: string; company_name: string }>>([]);
  const [selectedCompany, setSelectedCompany] = useState<string>('');
  const [collapsedMap, setCollapsedMap] = useState<Record<string, boolean>>({});
  const [expandAll, setExpandAll] = useState<boolean>(true);

  // Load companies
  useEffect(() => {
    frappeApi.getCompanies().then((res) => {
      if (res && res.length > 0) {
        setCompanies(res);
        setSelectedCompany((prev) => prev || res[0].name);
      }
    });
  }, []);

  // Build hierarchical tree for selected company from employees prop
  const treeNodes = useMemo(() => {
    const filtered = employees.filter(
      (e) => !e.company || e.company === selectedCompany
    );

    if (filtered.length === 0) return [];

    // Map each to a node
    const nodeMap: Record<string, OrgChartNode> = {};
    filtered.forEach((emp) => {
      nodeMap[emp.name] = {
        id: emp.name,
        name: emp.employee_name,
        title: emp.designation,
        department: emp.department,
        company: emp.company,
        reports_to: emp.reports_to || null,
        children: [],
      };
    });

    const roots: OrgChartNode[] = [];

    // Link parents and children
    filtered.forEach((emp) => {
      const node = nodeMap[emp.name];
      if (emp.reports_to && nodeMap[emp.reports_to]) {
        nodeMap[emp.reports_to].children!.push(node);
      } else {
        roots.push(node);
      }
    });

    return roots;
  }, [employees, selectedCompany]);

  const toggleCollapse = (id: string) => {
    setCollapsedMap((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleToggleExpandAll = () => {
    const nextState = !expandAll;
    setExpandAll(nextState);
    const newCollapsed: Record<string, boolean> = {};
    if (!nextState) {
      // collapse all
      employees.forEach((e) => {
        newCollapsed[e.name] = true;
      });
    }
    setCollapsedMap(newCollapsed);
  };

  const handleExport = () => {
    const jsonStr = JSON.stringify(treeNodes, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `org-chart-${selectedCompany.replace(/\s+/g, '-').toLowerCase()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Render a node and its children recursively
  const renderNode = (node: OrgChartNode, level = 0) => {
    const hasChildren = node.children && node.children.length > 0;
    const isCollapsed = collapsedMap[node.id] || false;
    const matchingEmp = employees.find((e) => e.name === node.id);

    return (
      <div key={node.id} className="flex flex-col items-center">
        {/* The Employee Card */}
        <div
          className={`relative z-10 w-64 nv-card bg-white border border-[rgba(140,150,175,0.14)] p-4 rounded-xl transition-all hover:shadow-card hover:border-primary/40 group ${
            level === 0 ? 'ring-2 ring-primary/20 shadow-sm' : ''
          }`}
        >
          <div className="flex items-start justify-between gap-2.5">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-lg bg-surface-high text-primary flex items-center justify-center font-serif font-bold text-sm border border-primary/20 flex-shrink-0">
                {node.name.charAt(0)}
              </div>
              <div className="min-w-0">
                <h4 className="font-serif font-bold text-xs text-content-main truncate group-hover:text-primary transition-colors">
                  {node.name}
                </h4>
                <p className="font-sans text-[11px] text-content-muted truncate">
                  {node.title || 'Staff Member'}
                </p>
                <p className="font-label text-[10px] text-primary font-semibold tracking-wider truncate">
                  {node.id}
                </p>
              </div>
            </div>

            {matchingEmp && onEditEmployee && (
              <button
                type="button"
                onClick={() => onEditEmployee(matchingEmp)}
                title="Edit Employee"
                className="p-1.5 hover:text-primary hover:bg-surface-high rounded-lg transition-colors text-content-muted"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="mt-3 pt-2.5 border-t border-[rgba(140,150,175,0.12)] flex items-center justify-between text-[10px]">
            <span className="chip-archival text-[9px] truncate max-w-[130px]">
              {node.department || 'General'}
            </span>
            {hasChildren && (
              <span className="font-label font-bold text-primary text-[10px] tracking-wide">
                {node.children!.length} {node.children!.length === 1 ? 'Report' : 'Reports'}
              </span>
            )}
          </div>

          {/* Toggle Children expand button if it has children */}
          {hasChildren && (
            <button
              type="button"
              onClick={() => toggleCollapse(node.id)}
              className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-white border border-[rgba(140,150,175,0.2)] shadow-xs flex items-center justify-center hover:bg-surface-high text-content-main z-20 transition-colors"
              title={isCollapsed ? 'Expand Direct Reports' : 'Collapse Direct Reports'}
            >
              {isCollapsed ? (
                <ChevronRight className="w-3.5 h-3.5 text-primary" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 text-primary" />
              )}
            </button>
          )}
        </div>

        {/* Child branches */}
        {hasChildren && !isCollapsed && (
          <div className="flex flex-col items-center mt-3">
            {/* Vertical connector from parent to horizontal bar */}
            <div className="w-0.5 h-6 bg-[rgba(140,150,175,0.22)]"></div>

            {/* Horizontal branch bar and children */}
            <div className="flex items-start justify-center gap-6 relative pt-4">
              {node.children!.length > 1 && (
                <div className="absolute top-0 left-12 right-12 h-0.5 bg-[rgba(140,150,175,0.22)]"></div>
              )}
              {node.children!.map((child) => (
                <div key={child.id} className="relative flex flex-col items-center">
                  <div className="w-0.5 h-4 bg-[rgba(140,150,175,0.22)] -mt-4 mb-0"></div>
                  {renderNode(child, level + 1)}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Top Controls Bar */}
      <div className="nv-card bg-white border border-[rgba(140,150,175,0.14)] p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-primary" />
            <span className="font-label text-xs uppercase tracking-wider font-bold text-content-muted">
              Company:
            </span>
          </div>
          <select
            value={selectedCompany}
            onChange={(e) => setSelectedCompany(e.target.value)}
            className="nv-input text-xs py-1.5 px-3 bg-white font-medium rounded-md"
          >
            {companies.map((comp) => (
              <option key={comp.name} value={comp.name}>
                {comp.company_name || comp.name}
              </option>
            ))}
          </select>
          <span className="font-label text-[11px] text-content-muted uppercase tracking-wider hidden md:inline">
            ({treeNodes.length} Root Nodes)
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExport}
            className="btn-secondary text-xs h-8 px-3"
            title="Export organizational tree"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export</span>
          </button>
          <button
            type="button"
            onClick={handleToggleExpandAll}
            className="btn-secondary text-xs h-8 px-3"
            title={expandAll ? 'Collapse All Nodes' : 'Expand All Nodes'}
          >
            {expandAll ? (
              <>
                <Minimize2 className="w-3.5 h-3.5" />
                <span>Collapse All</span>
              </>
            ) : (
              <>
                <Maximize2 className="w-3.5 h-3.5" />
                <span>Expand All</span>
              </>
            )}
          </button>
          <button
            type="button"
            onClick={onAddEmployee}
            className="btn-primary text-xs h-8 px-3.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Employee</span>
          </button>
        </div>
      </div>

      {/* Main Hierarchy Viewport or Empty State */}
      <div className="nv-card bg-white border border-[rgba(140,150,175,0.14)] rounded-xl min-h-[500px] flex items-center justify-center p-8 overflow-x-auto shadow-xs">
        {treeNodes.length === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center text-center max-w-sm py-12 animate-fadeIn">
            <div className="w-16 h-16 rounded-xl bg-surface-high text-content-muted flex items-center justify-center mb-4 border border-[rgba(140,150,175,0.12)]">
              <FileText className="w-8 h-8 stroke-[1.5]" />
            </div>
            <p className="font-sans text-xs text-content-muted mb-4">
              You haven't created an Employee for <span className="font-serif font-bold text-content-main">{selectedCompany}</span> yet.
            </p>
            <button
              type="button"
              onClick={onAddEmployee}
              className="btn-primary text-xs h-9 px-4 font-semibold"
            >
              Create a new Employee
            </button>
          </div>
        ) : (
          /* Org Chart Tree Nodes */
          <div className="w-full flex justify-center py-6">
            <div className="flex items-start justify-center gap-12">
              {treeNodes.map((root) => renderNode(root))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
