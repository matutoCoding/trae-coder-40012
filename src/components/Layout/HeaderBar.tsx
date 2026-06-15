import { Layout, Avatar, Dropdown, Badge, Input } from 'antd';
import { Bell, Search, User, LogOut, UserCog } from 'lucide-react';

const { Header } = Layout;

interface HeaderBarProps {
  collapsed: boolean;
  toggleCollapsed: () => void;
  collapseIcon: React.ReactNode;
}

const HeaderBar: React.FC<HeaderBarProps> = ({ toggleCollapsed, collapseIcon }) => {
  const userMenuItems = [
    { key: 'profile', icon: <User size={16} />, label: '个人信息' },
    { key: 'settings', icon: <UserCog size={16} />, label: '账号设置' },
    { type: 'divider' as const },
    { key: 'logout', icon: <LogOut size={16} />, label: '退出登录' },
  ];

  return (
    <Header
      className="flex items-center justify-between px-5 gear-header"
      style={{
        background: '#fff',
        padding: 0,
        height: 64,
        lineHeight: '64px',
        borderBottom: '1px solid #F2F3F5',
      }}
    >
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={toggleCollapsed}
          className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded transition-colors"
        >
          {collapseIcon}
        </button>
        <div className="relative hidden md:block">
          <Input
            placeholder="搜索工单号、产品名称、记录..."
            prefix={<Search size={16} className="text-gray-400" />}
            className="!w-80 !h-9 !rounded"
            style={{ borderRadius: 4 }}
          />
        </div>
      </div>
      <div className="flex items-center gap-5 pr-5">
        <div className="hidden md:flex items-center gap-6 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            <span>系统运行正常</span>
          </div>
        </div>
        <Badge count={3} size="small">
          <button className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
            <Bell size={18} />
          </button>
        </Badge>
        <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" arrow>
          <div className="flex items-center gap-3 cursor-pointer py-1.5 px-2 rounded hover:bg-gray-50 transition-colors">
            <Avatar
              size={34}
              style={{
                background: 'linear-gradient(135deg, #165DFF 0%, #4080FF 100%)',
                fontWeight: 600,
                verticalAlign: 'middle',
              }}
            >
              管
            </Avatar>
            <div className="hidden md:block">
              <div className="text-sm font-medium text-gray-800 leading-tight">管理员</div>
              <div className="text-xs text-gray-400 leading-tight mt-0.5">生产管理部</div>
            </div>
          </div>
        </Dropdown>
      </div>
    </Header>
  );
};

export default HeaderBar;
