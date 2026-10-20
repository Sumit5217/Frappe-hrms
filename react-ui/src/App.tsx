import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import { SubSidebar } from './components/SubSidebar';
import { Header } from './components/Header';
import { AddEmployeeModal } from './components/AddEmployeeModal';
import { EditEmployeeModal } from './components/EditEmployeeModal';
import { QuickPunchModal } from './components/QuickPunchModal';
import { BulkEmployeeImportModal } from './components/BulkEmployeeImportModal';
import { HRSetupDashboard } from './views/HRSetupDashboard';
import { GenericModuleView } from './views/GenericModuleView';
import { OrganizationalChartView } from './views/OrganizationalChartView';
import { DocTypeListView } from './views/DocTypeListView'; // refreshed
import { ReportView } from './views/ReportView';
import { SettingsView } from './views/SettingsView';
import { ModuleDashboardView } from './views/ModuleDashboardView';
import { ZohoTicketView } from './views/ZohoTicketView';
import { LoginView } from './views/LoginView';
import { PayrollMasterView } from './views/PayrollMasterView';
import { TaxAndBenefitsView } from './views/TaxAndBenefitsView';
import { LeavesView } from './views/LeavesView';
import { AttendanceView } from './views/AttendanceView';
import { NavItem } from './config/workspaceNav';
import { EmployeeTable } from './components/EmployeeTable';
import { frappeApi } from './api/frappe';
import { GenericDocModal } from './components/GenericDocModal';
import { DepartmentHeadcount, Employee, HRKPIs, ModuleTab, UserSession } from './types';
import { Sparkles } from 'lucide-react';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ModuleTab>('hr_setup');
  const [activeSubItem, setActiveSubItem] = useState<string>('Home');
  const [activeItemType, setActiveItemType] = useState<string>('Workspace');
  const [activeDocType, setActiveDocType] = useState<string | null>(null);
  const [activeReportName, setActiveReportName] = useState<string | null>(null);
  const [activeDashboardName, setActiveDashboardName] = useState<string | null>(null);
  const [isSubSidebarOpen, setIsSubSidebarOpen] = useState<boolean>(true);
  const [isMainSidebarOpen, setIsMainSidebarOpen] = useState<boolean>(true);
  const [showSidebarInComplaints, setShowSidebarInComplaints] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);
  const [isPunchModalOpen, setIsPunchModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [genericModalDocType, setGenericModalDocType] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  // Real data states from Frappe
  const [user, setUser] = useState<UserSession>({
    name: 'Guest',
    email: '',
    full_name: 'Guest',
    roles: [],
    is_logged_in: false,
  });

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<DepartmentHeadcount[]>([]);
  const [sidebarCounts, setSidebarCounts] = useState<{ leaves: number; recruitment: number }>({
    leaves: 0,
    recruitment: 0,
  });
  const [kpis, setKpis] = useState<HRKPIs>({
    totalEmployees: 0,
    joiningThisQuarter: 0,
    relievingThisQuarter: 0,
    presentToday: 0,
    onLeaveToday: 0,
    attendanceRate: 0,
    pendingApprovals: 0,
  });

  const loadData = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const session = await frappeApi.getSession();
      setUser(session);

      const [emps, depts, stats, counts] = await Promise.all([
        frappeApi.getEmployees(),
        frappeApi.getDepartmentHeadcount(),
        frappeApi.getHRKPIs(),
        frappeApi.getSidebarCounts(),
      ]);

      setEmployees(emps);
      setDepartments(depts);
      setKpis(stats);
      setSidebarCounts(counts);
    } catch (err) {
      console.error('Error fetching live data from Frappe:', err);
    } finally {
      setIsRefreshing(false);
      setAuthLoading(false);
    }
  }, []);

  const handleLogout = async () => {
    await frappeApi.logout();
    setUser({
      name: 'Guest',
      email: '',
      full_name: 'Guest',
      roles: [],
      is_logged_in: false,
    });
  };

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleTabChange = (tab: ModuleTab) => {
    if (tab === activeTab) {
      if (tab !== 'complaints' && tab !== 'payroll') {
        setIsSubSidebarOpen((prev) => !prev);
      }
      return;
    }
    setActiveTab(tab);
    if (tab === 'complaints' || tab === 'payroll' || tab === 'tax_and_benefits') {
      setIsSubSidebarOpen(false);
      setShowSidebarInComplaints(false);
    } else {
      setIsSubSidebarOpen(true);
    }
    setActiveSubItem('Home');
    setActiveItemType('Workspace');
    setActiveDocType(null);
    setActiveReportName(null);
    setActiveDashboardName(null);
  };

  const handleSubItemSelect = (item: NavItem) => {
    setActiveSubItem(item.label);

    const lowerLabel = item.label.toLowerCase();
    const linkType = item.link_type;
    const linkTo = item.link_to || '';

    // 1. Home / Workspace Overview
    if (lowerLabel === 'home' || (linkType === 'Workspace' && lowerLabel !== 'dashboard')) {
      setActiveItemType('Workspace');
      setActiveDocType(null);
      setActiveReportName(null);
      setActiveDashboardName(null);
    }
    // 2. Dashboard Analytics
    else if (lowerLabel === 'dashboard' || linkType === 'Dashboard') {
      setActiveItemType('Dashboard');
      setActiveDashboardName(linkTo || `${item.label} Dashboard`);
      setActiveDocType(null);
      setActiveReportName(null);
    }
    // 3. Report Runner
    else if (linkType === 'Report' || lowerLabel.includes('report') || lowerLabel.includes('register') || lowerLabel.includes('balance') || lowerLabel.includes('analytics')) {
      setActiveItemType('Report');
      setActiveReportName(linkTo || item.label);
      setActiveDocType(null);
      setActiveDashboardName(null);
    }
    // 4. Single DocType Settings
    else if (
      lowerLabel === 'settings' ||
      linkTo === 'HR Settings' ||
      linkTo === 'Payroll Settings'
    ) {
      setActiveItemType('Settings');
      setActiveDocType(linkTo || (activeTab === 'payroll' ? 'Payroll Settings' : 'HR Settings'));
      setActiveReportName(null);
      setActiveDashboardName(null);
    }
    // 5. Special Tools & Fallback Handling
    else if (linkTo === 'Employee Attendance Tool' || lowerLabel.includes('attendance tool')) {
      setActiveItemType('DocType');
      setActiveDocType('Attendance');
      setActiveReportName(null);
      setActiveDashboardName(null);
    }
    else if (linkTo === 'Leave Control Panel' || lowerLabel.includes('control panel')) {
      setActiveItemType('DocType');
      setActiveDocType('Leave Allocation');
      setActiveReportName(null);
      setActiveDashboardName(null);
    }
    // 6. External URLs (e.g. Shift Roster app)
    else if (linkType === 'URL' && item.url) {
      if (item.url.includes('roster') || lowerLabel.includes('roster')) {
        setActiveItemType('DocType');
        setActiveDocType('Shift Assignment');
        setActiveReportName(null);
        setActiveDashboardName(null);
      } else {
        window.open(`http://localhost:8000${item.url}`, '_blank');
      }
    }
    // 7. Dedicated Employee Directory
    else if (lowerLabel === 'employee' || linkTo === 'Employee') {
      setActiveItemType('Employee');
      setActiveDocType('Employee');
      setActiveReportName(null);
      setActiveDashboardName(null);
    }
    // 8. Organizational Chart
    else if (lowerLabel.includes('organizational') || linkTo.includes('organizational')) {
      setActiveItemType('OrganizationalChart');
      setActiveDocType(null);
      setActiveReportName(null);
      setActiveDashboardName(null);
    }
    // 9. Standard Frappe DocType
    else {
      setActiveItemType('DocType');
      setActiveDocType(linkTo || item.label);
      setActiveReportName(null);
      setActiveDashboardName(null);
    }
  };

  const handleCreateEmployee = async (newEmp: Partial<Employee>) => {
    const result = await frappeApi.createEmployee(newEmp);
    if (result.success) {
      await loadData();
    }
    return result;
  };

  const handleUpdateEmployee = async (id: string, data: Partial<Employee>) => {
    const result = await frappeApi.updateEmployee(id, data);
    if (result.success) {
      await loadData();
    }
    return result;
  };

  const renderMainView = () => {
    // 1. Organizational Chart Page
    if (
      activeItemType === 'OrganizationalChart' ||
      activeSubItem.toLowerCase().includes('organizational') ||
      activeSubItem === 'Organizational Chart'
    ) {
      return (
        <OrganizationalChartView
          onAddEmployee={() => setIsAddModalOpen(true)}
          onEditEmployee={(emp) => setEditingEmployee(emp)}
          employees={employees}
        />
      );
    }

    // 2. Dedicated Employee Directory view
    if (activeItemType === 'Employee' || activeDocType === 'Employee' || activeSubItem.toLowerCase() === 'employee') {
      return (
        <div className="space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-primary"></span>
              <h2 className="font-serif text-2xl font-bold text-content-main tracking-tight">
                Enterprise Employee Directory
              </h2>
            </div>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="btn-primary text-xs h-8 px-4"
            >
              + Quick Add Employee
            </button>
          </div>
          <EmployeeTable
            employees={employees}
            onEdit={(emp) => setEditingEmployee(emp)}
            onOpenBulkImport={() => setIsBulkImportOpen(true)}
            onAddEmployee={() => setIsAddModalOpen(true)}
          />
        </div>
      );
    }

    // 3. Single DocType Settings View (HR Settings, Payroll Settings)
    if (activeItemType === 'Settings' && activeDocType) {
      return <SettingsView doctype={activeDocType} />;
    }

    // 4. Dedicated Modular Payroll Management Hub
    if (activeTab === 'payroll') {
      return (
        <PayrollMasterView
          activeSubItem={activeSubItem}
          activeDocType={activeDocType}
          activeReportName={activeReportName}
          employees={employees}
          onNavigate={(subItem, docType, reportName) => {
            setActiveSubItem(subItem);
            if (reportName) {
              setActiveItemType('Report');
              setActiveReportName(reportName);
              setActiveDocType(null);
            } else if (docType) {
              setActiveItemType('DocType');
              setActiveDocType(docType);
              setActiveReportName(null);
            } else {
              setActiveItemType('Workspace');
              setActiveDocType(null);
              setActiveReportName(null);
            }
          }}
        />
      );
    }

    // 4. Live Report Runner View (all 27 Frappe Reports)
    if (activeItemType === 'Report' && activeReportName) {
      return <ReportView reportName={activeReportName} />;
    }

    // 5. Module Analytics Dashboard View
    if (activeItemType === 'Dashboard') {
      return (
        <ModuleDashboardView
          module={activeTab}
          dashboardName={activeDashboardName || undefined}
          onNavigateDocType={(dt) => {
            setActiveDocType(dt);
            setActiveSubItem(dt);
            setActiveItemType('DocType');
            setIsSubSidebarOpen(false);
          }}
        />
      );
    }

    // 6. Generic Frappe DocType Viewer
    if (activeItemType === 'DocType' && activeDocType) {
      if (activeDocType === 'Complaint') {
        return (
          <ZohoTicketView
            onBackToDashboard={() => {
              setActiveTab('hr_setup');
              setActiveDocType(null);
              setActiveSubItem('Home');
            }}
          />
        );
      }
      return <DocTypeListView doctype={activeDocType} />;
    }

    // 7. Home / Workspace Overview (Default)
    if (activeTab === 'hr_setup') {
      return (
        <HRSetupDashboard
          kpis={kpis}
          departments={departments}
          employees={employees}
          onAddEmployee={() => setIsAddModalOpen(true)}
          onNavigateTab={handleTabChange}
          onEditEmployee={(emp) => setEditingEmployee(emp)}
          onOpenBulkImport={() => setIsBulkImportOpen(true)}
        />
      );
    }

    if (activeTab === 'complaints') {
      return (
        <ZohoTicketView
          onBackToDashboard={() => {
            setActiveTab('hr_setup');
            setActiveDocType(null);
            setActiveSubItem('Home');
          }}
        />
      );
    }

    if (activeTab === 'tax_and_benefits') {
      return (
        <TaxAndBenefitsView
          employees={employees}
          activeSubItem={activeSubItem}
          onNavigate={(subItem, docType, reportName) => {
            if (docType) {
              setActiveDocType(docType);
              setActiveSubItem(docType);
              setActiveItemType('DocType');
            } else if (reportName) {
              setActiveReportName(reportName);
              setActiveItemType('Report');
            } else {
              setActiveSubItem(subItem);
            }
          }}
        />
      );
    }

    if (activeTab === 'leaves') {
      return (
        <LeavesView
          employees={employees}
          user={user}
          activeSubItem={activeSubItem}
          onNavigate={(subItem, docType, reportName) => {
            if (docType) {
              setActiveDocType(docType);
              setActiveSubItem(docType);
              setActiveItemType('DocType');
            } else if (reportName) {
              setActiveReportName(reportName);
              setActiveItemType('Report');
            } else {
              setActiveSubItem(subItem);
            }
          }}
        />
      );
    }

    if (activeTab === 'shift_and_attendance') {
      return (
        <AttendanceView
          employees={employees}
          user={user}
          onOpenQuickPunch={() => setIsPunchModalOpen(true)}
          onNavigate={(subItem, docType, reportName) => {
            if (docType) {
              setActiveDocType(docType);
              setActiveSubItem(docType);
              setActiveItemType('DocType');
            } else if (reportName) {
              setActiveReportName(reportName);
              setActiveItemType('Report');
            } else {
              setActiveSubItem(subItem);
            }
          }}
        />
      );
    }

    return (
      <GenericModuleView
        module={activeTab}
        onSelectDocType={(dt) => {
          setActiveDocType(dt);
          setActiveSubItem(dt);
          setActiveItemType('DocType');
        }}
        onNewRecord={(dt) => {
          setGenericModalDocType(dt);
        }}
      />
    );
  };

  if (authLoading) {
    return (
      <div
        style={{
          background: 'radial-gradient(ellipse at top, #0C1528 0%, #080D18 60%, #050810 100%)',
        }}
        className="min-h-screen w-full flex flex-col items-center justify-center p-4 text-white select-none"
      >
        <div
          style={{
            background: 'linear-gradient(135deg, #1E40AF 0%, #0284C7 100%)',
            boxShadow: '0 8px 20px -4px rgba(2, 132, 199, 0.4)',
          }}
          className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 text-[#38BDF8] animate-pulse"
        >
          <Sparkles className="w-6 h-6" />
        </div>
        <h2 className="font-serif text-lg font-bold tracking-tight">Nimble Vision HR</h2>
        <p className="font-sans text-xs text-[#94A3B8] mt-1">Connecting to Frappe authentication...</p>
      </div>
    );
  }

  if (!user.is_logged_in) {
    return (
      <LoginView
        onLoginSuccess={async (loggedInUser) => {
          setUser(loggedInUser);
          await loadData();
        }}
      />
    );
  }

  const isComplaints = activeTab === 'complaints';

  const totalEmployeesCount = employees.length > 0 ? employees.length : (kpis.totalEmployees || 0);

  return (
    <div className="flex min-h-screen bg-surface font-sans text-content-main selection:bg-primary selection:text-white">
      {/* 1. Primary Left Sidebar */}
      {(!isComplaints || showSidebarInComplaints) && (
        <Sidebar
          isOpen={isMainSidebarOpen}
          onToggleCollapse={() => setIsMainSidebarOpen((prev) => !prev)}
          activeTab={activeTab}
          onTabChange={handleTabChange}
          user={user}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          sidebarCounts={sidebarCounts}
          totalEmployees={totalEmployeesCount}
          onLogout={handleLogout}
        />
      )}

      {/* 2. Secondary Sub-Navigation Workspace Sidebar */}
      {!isComplaints && (
        <SubSidebar
          isOpen={isSubSidebarOpen}
          activeTab={activeTab}
          activeSubItem={activeSubItem}
          onSelectSubItem={handleSubItemSelect}
          onClose={() => setIsSubSidebarOpen(false)}
          totalEmployees={totalEmployeesCount}
        />
      )}

      {/* 3. Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto transition-all duration-300 ease-in-out">
        {isComplaints ? (
          <div className="h-screen overflow-hidden flex flex-col">
            <ZohoTicketView
              onBackToDashboard={() => {
                setActiveTab('hr_setup');
                setActiveDocType(null);
                setActiveSubItem('Home');
              }}
              onToggleHRSidebar={() => setShowSidebarInComplaints((prev) => !prev)}
              isHRSidebarOpen={showSidebarInComplaints}
            />
          </div>
        ) : (
          <div className="max-w-7xl w-full mx-auto p-6 md:p-8">
            <Header
              activeTab={activeTab}
              activeSubItem={activeSubItem}
              onAddEmployee={() => setIsAddModalOpen(true)}
              onRefresh={loadData}
              isRefreshing={isRefreshing}
              isMainSidebarOpen={isMainSidebarOpen}
              onToggleMainSidebar={() => setIsMainSidebarOpen((prev) => !prev)}
              isSubSidebarOpen={isSubSidebarOpen}
              onToggleSubSidebar={() => setIsSubSidebarOpen((prev) => !prev)}
            />

            {renderMainView()}
          </div>
        )}
      </main>

      {/* 4. Add Employee Modal */}
      <AddEmployeeModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleCreateEmployee}
      />

      {/* 5. Edit Employee Modal */}
      <EditEmployeeModal
        employee={editingEmployee}
        isOpen={Boolean(editingEmployee)}
        onClose={() => setEditingEmployee(null)}
        onUpdate={handleUpdateEmployee}
      />

      {/* 6. Quick Punch In/Out Modal */}
      <QuickPunchModal
        isOpen={isPunchModalOpen}
        onClose={() => setIsPunchModalOpen(false)}
        onSuccess={loadData}
        user={user}
        employees={employees}
      />

      {/* 7. greytHR-Style Bulk Employee & Salary Excel Import Modal */}
      <BulkEmployeeImportModal
        isOpen={isBulkImportOpen}
        onClose={() => setIsBulkImportOpen(false)}
        onSuccess={loadData}
      />

      {/* 8. Generic DocType Record Creation Modal */}
      {genericModalDocType && (
        <GenericDocModal
          doctype={genericModalDocType}
          isOpen={Boolean(genericModalDocType)}
          onClose={() => setGenericModalDocType(null)}
          onCreated={() => {
            setGenericModalDocType(null);
            loadData();
          }}
        />
      )}
    </div>
  );
};
