import fs from 'fs';
import path from 'path';

const sidebarsDir = path.resolve('../hrms/workspace_sidebar');
const files = fs.readdirSync(sidebarsDir).filter(f => f.endsWith('.json'));

const mapping = {
  'hr_setup.json': 'hr_setup',
  'tenure.json': 'tenure',
  'recruitment.json': 'recruitment',
  'shift_&_attendance.json': 'shift_and_attendance',
  'leaves.json': 'leaves',
  'expenses.json': 'expenses',
  'performance.json': 'performance',
  'payroll.json': 'payroll',
  'tax_&_benefits.json': 'tax_and_benefits',
  'complaints.json': 'complaints',
};

const result = {};

for (const file of files) {
  const modKey = mapping[file];
  if (!modKey) continue;
  const content = JSON.parse(fs.readFileSync(path.join(sidebarsDir, file), 'utf8'));
  result[modKey] = {
    title: content.title || content.name,
    header_icon: content.header_icon,
    items: content.items.map(item => ({
      label: item.label,
      type: item.type, // 'Link' | 'Section Break'
      link_to: item.link_to || '',
      link_type: item.link_type || '', // 'DocType' | 'Workspace' | 'Page' | 'Report' | 'URL' | 'Dashboard'
      icon: item.icon || '',
      child: item.child || 0,
      url: item.url || '',
    })),
  };
}

const outTs = `export interface NavItem {
  label: string;
  type: 'Link' | 'Section Break';
  link_to?: string;
  link_type?: 'DocType' | 'Workspace' | 'Page' | 'Report' | 'URL' | 'Dashboard';
  icon?: string;
  child?: number;
  url?: string;
}

export interface WorkspaceSidebarData {
  title: string;
  header_icon?: string;
  items: NavItem[];
}

export const WORKSPACE_SIDEBARS: Record<string, WorkspaceSidebarData> = ${JSON.stringify(result, null, 2)};
`;

if (!fs.existsSync('./src/config')) {
  fs.mkdirSync('./src/config', { recursive: true });
}
fs.writeFileSync('./src/config/workspaceNav.ts', outTs, 'utf8');
console.log('Successfully generated src/config/workspaceNav.ts');
