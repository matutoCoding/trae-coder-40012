import { Card, Tabs, Button, Space, Tag } from 'antd';
import { Plus, Download, RefreshCw } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  extraButtons?: React.ReactNode;
  onAdd?: () => void;
  addText?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  icon,
  onAdd,
  addText = '新增记录',
  extraButtons,
}) => {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          {icon && (
            <div
              className="w-12 h-12 rounded flex items-center justify-center text-white"
              style={{ background: 'linear-gradient(135deg, #165DFF 0%, #4080FF 100%)' }}
            >
              {icon}
            </div>
          )}
          <div>
            <h1 className="text-xl font-bold text-gray-800 m-0">{title}</h1>
            {description && <p className="text-gray-500 text-sm mt-1 mb-0">{description}</p>}
          </div>
        </div>
        <Space>
          {extraButtons}
          <Button icon={<RefreshCw size={16} />}>刷新</Button>
          <Button icon={<Download size={16} />}>导出</Button>
          {onAdd && (
            <Button
              type="primary"
              icon={<Plus size={16} />}
              onClick={onAdd}
              style={{
                background: '#165DFF',
                boxShadow: '0 2px 6px rgba(22, 93, 255, 0.3)',
              }}
            >
              {addText}
            </Button>
          )}
        </Space>
      </div>
    </div>
  );
};

interface StatCardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon: React.ReactNode;
  trend?: number;
  color?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  unit,
  icon,
  trend,
  color = '#165DFF',
}) => {
  return (
    <Card
      className="h-full border-0 stat-card"
      style={{
        background: `linear-gradient(135deg, ${color}0A 0%, #FFFFFF 100%)`,
        borderRadius: 8,
        boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
      }}
      bodyStyle={{ padding: 20 }}
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="text-gray-500 text-sm mb-2">{title}</div>
          <div className="flex items-baseline gap-1">
            <span
              className="text-2xl font-bold"
              style={{ color, fontFamily: 'DIN, sans-serif' }}
            >
              {value}
            </span>
            {unit && <span className="text-gray-400 text-sm">{unit}</span>}
          </div>
          {trend !== undefined && (
            <div className={`text-xs mt-2 ${trend >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}% 较昨日
            </div>
          )}
        </div>
        <div
          className="w-11 h-11 rounded-lg flex items-center justify-center"
          style={{ background: `${color}14`, color }}
        >
          {icon}
        </div>
      </div>
    </Card>
  );
};

export const StatusTag: React.FC<{ status: string }> = ({ status }) => {
  const colorMap: Record<string, string> = {
    pending: 'orange',
    processing: 'blue',
    completed: 'green',
    rejected: 'red',
    qualified: 'green',
    unqualified: 'red',
  };
  const textMap: Record<string, string> = {
    pending: '待开始',
    processing: '生产中',
    completed: '已完成',
    rejected: '已报废',
    qualified: '合格',
    unqualified: '不合格',
  };
  return <Tag color={colorMap[status]}>{textMap[status] || status}</Tag>;
};

interface TabContainerProps {
  items: { key: string; label: string; children: React.ReactNode }[];
}

export const TabContainer: React.FC<TabContainerProps> = ({ items }) => {
  return (
    <Card bodyStyle={{ padding: 0 }} className="border-0 tab-container" style={{ borderRadius: 8 }}>
      <Tabs
        items={items}
        defaultActiveKey={items[0]?.key}
        size="large"
        style={{ padding: '0 24px' }}
        tabBarStyle={{ marginBottom: 0, borderBottom: '1px solid #F2F3F5' }}
      />
    </Card>
  );
};

export default { PageHeader, StatCard, StatusTag, TabContainer };
