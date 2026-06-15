import { useState } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { Layout, Menu, theme } from 'antd';
import {
  LayoutDashboard,
  Box,
  CircleDot,
  Scissors,
  Flame,
  Sparkles,
  FileCheck,
  Puzzle,
  ClipboardList,
  Settings,
  PanelLeftClose,
  PanelLeft,
  BarChart3,
  AlertTriangle,
  FileText,
} from 'lucide-react';
import HeaderBar from './HeaderBar';

const { Sider, Content } = Layout;

interface MenuItem {
  key: string;
  icon: React.ElementType;
  label: string;
  path: string;
  children?: MenuItem[];
}

const menuItems: MenuItem[] = [
  { key: '/dashboard', icon: LayoutDashboard, label: '工作台', path: '/dashboard' },
  { key: '/workorders', icon: ClipboardList, label: '工单管理', path: '/workorders' },
  {
    key: 'process',
    icon: Box,
    label: '工序管理',
    path: '',
    children: [
      { key: '/process/blank', icon: CircleDot, label: '齿坯加工', path: '/process/blank' },
      { key: '/process/hobbing', icon: CircleDot, label: '滚齿插齿', path: '/process/hobbing' },
      { key: '/process/shaving', icon: Scissors, label: '剃齿珩齿', path: '/process/shaving' },
      { key: '/process/carburizing', icon: Flame, label: '渗碳淬火', path: '/process/carburizing' },
      { key: '/process/grinding', icon: Sparkles, label: '磨齿精加工', path: '/process/grinding' },
    ],
  },
  { key: '/inspection', icon: FileCheck, label: '齿形检测', path: '/inspection' },
  { key: '/matching', icon: Puzzle, label: '配对啮合', path: '/matching' },
  {
    key: 'quality',
    icon: BarChart3,
    label: '质量管理',
    path: '',
    children: [
      { key: '/quality-stats', icon: BarChart3, label: '质量统计', path: '/quality-stats' },
      { key: '/quality-alerts', icon: AlertTriangle, label: '异常闭环', path: '/quality-alerts' },
      { key: '/quality-report', icon: FileText, label: '周报导出', path: '/quality-report' },
    ],
  },
  { key: '/settings', icon: Settings, label: '系统设置', path: '/settings' },
];

const convertToAntdMenu = (items: MenuItem[]) => {
  return items.map((item) => ({
    key: item.key,
    icon: <item.icon size={18} />,
    label: item.label,
    children: item.children ? convertToAntdMenu(item.children) : undefined,
  }));
};

const findSelectedKey = (pathname: string): string => {
  for (const item of menuItems) {
    if (item.path === pathname) return item.key;
    if (item.children) {
      for (const child of item.children) {
        if (child.path === pathname || pathname.startsWith(child.path)) return child.key;
      }
    }
  }
  return '/dashboard';
};

const AppLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const selectedKey = findSelectedKey(location.pathname);
  const openKeys = menuItems
    .filter((item) => item.children?.some((c) => c.key === selectedKey))
    .map((item) => item.key);

  const handleMenuClick = ({ key }: { key: string }) => {
    const findPath = (items: MenuItem[], targetKey: string): string | null => {
      for (const item of items) {
        if (item.key === targetKey) return item.path;
        if (item.children) {
          const found = findPath(item.children, targetKey);
          if (found) return found;
        }
      }
      return null;
    };
    const path = findPath(menuItems, key);
    if (path) navigate(path);
  };

  return (
    <Layout style={{ minHeight: '100vh' }} className="gear-layout">
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        width={240}
        style={{
          background: '#1D2129',
          overflow: 'auto',
          height: '100vh',
          position: 'sticky',
          top: 0,
          left: 0,
        }}
        className="gear-sider"
      >
        <div
          className="flex items-center gap-3 px-5 h-16 border-b border-white/10"
          style={{ whiteSpace: collapsed ? 'nowrap' : 'normal', overflow: 'hidden' }}
        >
          <div
            className="flex-shrink-0 w-9 h-9 rounded flex items-center justify-center text-white font-bold text-lg"
            style={{
              background: 'linear-gradient(135deg, #165DFF 0%, #4080FF 100%)',
              boxShadow: '0 2px 8px rgba(22, 93, 255, 0.4)',
            }}
          >
            齿
          </div>
          {!collapsed && (
            <div className="flex-col overflow-hidden">
              <div className="text-white font-bold text-base leading-tight">齿轮加工厂</div>
              <div className="text-gray-400 text-xs leading-tight mt-0.5">传动齿轮业务管理</div>
            </div>
          )}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[selectedKey]}
          defaultOpenKeys={openKeys}
          items={convertToAntdMenu(menuItems)}
          onClick={handleMenuClick}
          style={{ borderRight: 0, background: 'transparent', paddingTop: 8 }}
          className="gear-menu"
        />
      </Sider>
      <Layout>
        <HeaderBar
          collapsed={collapsed}
          toggleCollapsed={() => setCollapsed(!collapsed)}
          collapseIcon={
            collapsed ? <PanelLeft size={18} /> : <PanelLeftClose size={18} />
          }
        />
        <Content
          style={{
            margin: '16px',
            padding: 24,
            minHeight: 280,
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
          }}
          className="gear-content"
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default AppLayout;
