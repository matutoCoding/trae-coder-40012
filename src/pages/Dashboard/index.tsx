import { Row, Col, Card, Table, Tag, Progress, List, Avatar, Tooltip, Timeline } from 'antd';
import { useNavigate } from 'react-router-dom';
import {
  Factory,
  ClipboardCheck,
  AlertTriangle,
  CheckCircle2,
  Box,
  CircleDot,
  Scissors,
  Flame,
  Sparkles,
  FileCheck,
  Puzzle,
  TrendingUp,
  Clock,
} from 'lucide-react';
import ReactECharts from 'echarts-for-react';
import { useGearStore } from '@/store';
import { PageHeader, StatCard, StatusTag } from '@/components/common/PageComponents';
import type { ProcessKey } from '@/types';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { workOrders, inspectionRecords } = useGearStore();

  const totalWorkOrders = workOrders.length;
  const processingCount = workOrders.filter((wo) => wo.status === 'processing').length;
  const completedCount = workOrders.filter((wo) => wo.status === 'completed').length;
  const unqualifiedCount = inspectionRecords.filter((r) => r.result === 'unqualified').length;

  const processList: ProcessKey[] = [
    { key: 'blank', name: '齿坯加工', icon: 'CircleDot', color: '#165DFF', path: '/process/blank' },
    { key: 'hobbing', name: '滚齿插齿', icon: 'CircleDot', color: '#722ED1', path: '/process/hobbing' },
    { key: 'shaving', name: '剃齿珩齿', icon: 'Scissors', color: '#13C2C2', path: '/process/shaving' },
    { key: 'carburizing', name: '渗碳淬火', icon: 'Flame', color: '#F53F3F', path: '/process/carburizing' },
    { key: 'grinding', name: '磨齿精加工', icon: 'Sparkles', color: '#FF7D00', path: '/process/grinding' },
    { key: 'inspection', name: '齿形检测', icon: 'FileCheck', color: '#00B42A', path: '/inspection' },
    { key: 'matching', name: '配对啮合', icon: 'Puzzle', color: '#86909C', path: '/matching' },
  ];

  const iconMap: Record<string, React.ElementType> = {
    CircleDot,
    Scissors,
    Flame,
    Sparkles,
    FileCheck,
    Puzzle,
  };

  const processIcons: Record<string, React.ElementType> = {
    blank: CircleDot,
    hobbing: CircleDot,
    shaving: Scissors,
    carburizing: Flame,
    grinding: Sparkles,
    inspection: FileCheck,
    matching: Puzzle,
  };

  const recentWorkOrders = [...workOrders]
    .sort((a, b) => new Date(b.updateTime).getTime() - new Date(a.updateTime).getTime())
    .slice(0, 6);

  const productionTrendOption = {
    tooltip: { trigger: 'axis' },
    legend: { data: ['工单数', '完成数'], right: 0, top: 0 },
    grid: { left: 40, right: 20, top: 40, bottom: 30 },
    xAxis: {
      type: 'category',
      data: ['6/9', '6/10', '6/11', '6/12', '6/13', '6/14', '6/15', '6/16'],
      axisLine: { lineStyle: { color: '#E5E6EB' } },
      axisLabel: { color: '#86909C' },
    },
    yAxis: {
      type: 'value',
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: { lineStyle: { color: '#F2F3F5' } },
      axisLabel: { color: '#86909C' },
    },
    series: [
      {
        name: '工单数',
        type: 'bar',
        data: [8, 12, 10, 15, 13, 14, 16, 6],
        itemStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: '#4080FF' },
              { offset: 1, color: '#165DFF' },
            ],
          },
          borderRadius: [4, 4, 0, 0],
        },
        barWidth: 16,
      },
      {
        name: '完成数',
        type: 'line',
        data: [6, 10, 8, 12, 11, 12, 13, 3],
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        lineStyle: { color: '#00B42A', width: 2 },
        itemStyle: { color: '#00B42A' },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(0, 180, 42, 0.2)' },
              { offset: 1, color: 'rgba(0, 180, 42, 0)' },
            ],
          },
        },
      },
    ],
  };

  const qualityOption = {
    tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
    legend: { orient: 'vertical', left: 'left', top: 'center' },
    series: [
      {
        type: 'pie',
        radius: ['55%', '75%'],
        center: ['65%', '50%'],
        avoidLabelOverlap: false,
        label: { show: false },
        emphasis: {
          label: { show: true, fontSize: 14, fontWeight: 'bold' },
        },
        labelLine: { show: false },
        data: [
          { value: 86, name: '合格', itemStyle: { color: '#00B42A' } },
          { value: 8, name: '待检', itemStyle: { color: '#165DFF' } },
          { value: 4, name: '返工', itemStyle: { color: '#FF7D00' } },
          { value: 2, name: '报废', itemStyle: { color: '#F53F3F' } },
        ],
      },
    ],
  };

  const workOrderColumns = [
    {
      title: '工单号',
      dataIndex: 'orderNo',
      width: 140,
      render: (v: string) => <span className="font-mono text-xs text-blue-600">{v}</span>,
    },
    { title: '产品名称', dataIndex: 'productName', width: 140 },
    { title: '型号', dataIndex: 'gearModel', width: 80 },
    { title: '数量', dataIndex: 'quantity', width: 60, align: 'center' as const },
    {
      title: '进度',
      dataIndex: 'processProgress',
      render: (p: Record<string, boolean>) => {
        const completed = Object.values(p).filter(Boolean).length;
        const total = 7;
        const percent = Math.round((completed / total) * 100);
        return (
          <Progress
            percent={percent}
            size="small"
            strokeColor={{ from: '#4080FF', to: '#165DFF' }}
          />
        );
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 90,
      render: (s: string) => <StatusTag status={s} />,
    },
  ];

  const alerts = [
    { type: 'warning', title: 'WO202606150002 公法线偏差超差', time: '10分钟前', level: '中等' },
    { type: 'error', title: 'WO202606150006 齿形检测不合格', time: '32分钟前', level: '严重' },
    { type: 'warning', title: '渗碳炉 #2 温度偏高 5℃', time: '1小时前', level: '中等' },
    { type: 'info', title: '砂轮 SG80JV 需更换', time: '2小时前', level: '提示' },
  ];

  return (
    <div className="dashboard-page">
      <PageHeader
        title="工作台"
        description="齿轮加工厂生产总览，实时掌握生产进度和质量状态"
        icon={<Factory size={22} />}
      />

      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="工单总数"
            value={totalWorkOrders}
            unit="单"
            icon={<ClipboardCheck size={20} />}
            trend={12.5}
            color="#165DFF"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="生产中"
            value={processingCount}
            unit="单"
            icon={<TrendingUp size={20} />}
            trend={5.2}
            color="#722ED1"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="已完成"
            value={completedCount}
            unit="单"
            icon={<CheckCircle2 size={20} />}
            trend={18.3}
            color="#00B42A"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="质量异常"
            value={unqualifiedCount}
            unit="项"
            icon={<AlertTriangle size={20} />}
            trend={-8.5}
            color="#F53F3F"
          />
        </Col>
      </Row>

      <Card
        title={<span className="font-semibold">工序快速入口</span>}
        className="mb-6 process-entrance"
        bodyStyle={{ padding: 20 }}
        style={{ borderRadius: 8 }}
      >
        <Row gutter={[16, 16]}>
          {processList.map((p) => {
            const IconComp = iconMap[p.icon] || Box;
            const completed = workOrders.filter(
              (wo) => wo.processProgress[p.key as keyof typeof wo.processProgress]
            ).length;
            return (
              <Col xs={12} sm={8} md={6} lg={3} key={p.key}>
                <Tooltip title={`进入${p.name}模块`}>
                  <Card
                    hoverable
                    onClick={() => navigate(p.path)}
                    className="cursor-pointer text-center border-0 process-card transition-all"
                    style={{
                      background: `linear-gradient(135deg, ${p.color}08 0%, #FFFFFF 100%)`,
                      borderRadius: 8,
                    }}
                    bodyStyle={{ padding: '24px 12px' }}
                  >
                    <div
                      className="w-14 h-14 mx-auto rounded-xl flex items-center justify-center mb-3 transition-transform"
                      style={{ background: `${p.color}14`, color: p.color }}
                    >
                      <IconComp size={26} />
                    </div>
                    <div className="font-semibold text-gray-800 text-sm mb-1">{p.name}</div>
                    <div className="text-xs text-gray-500">
                      已完成 <span style={{ color: p.color, fontWeight: 600 }}>{completed}</span> 单
                    </div>
                  </Card>
                </Tooltip>
              </Col>
            );
          })}
        </Row>
      </Card>

      <Row gutter={16} className="mb-6">
        <Col xs={24} lg={16}>
          <Card
            title={<span className="font-semibold">生产趋势</span>}
            extra={<Tag color="blue">近8天</Tag>}
            style={{ borderRadius: 8, height: '100%' }}
          >
            <ReactECharts option={productionTrendOption} style={{ height: 300 }} />
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card
            title={<span className="font-semibold">质量分布</span>}
            style={{ borderRadius: 8, height: '100%' }}
          >
            <ReactECharts option={qualityOption} style={{ height: 300 }} />
          </Card>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col xs={24} lg={16}>
          <Card
            title={<span className="font-semibold">最近工单</span>}
            extra={
              <a onClick={() => navigate('/workorders')} className="text-blue-500 text-sm">
                查看全部 →
              </a>
            }
            style={{ borderRadius: 8 }}
          >
            <Table
              columns={workOrderColumns}
              dataSource={recentWorkOrders}
              rowKey="id"
              size="middle"
              pagination={false}
              onRow={(record) => ({
                onClick: () => navigate(`/workorders/${record.id}`),
                style: { cursor: 'pointer' },
              })}
            />
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card
            title={<span className="font-semibold flex items-center gap-2"><AlertTriangle size={16} className="text-orange-500" />实时预警</span>}
            style={{ borderRadius: 8 }}
          >
            <List
              dataSource={alerts}
              renderItem={(item) => (
                <List.Item className="!px-0 !py-3 border-b border-gray-100 last:border-0">
                  <List.Item.Meta
                    avatar={
                      <Avatar
                        size={36}
                        icon={
                          item.type === 'error' ? (
                            <AlertTriangle size={18} />
                          ) : item.type === 'warning' ? (
                            <Clock size={18} />
                          ) : (
                            <AlertTriangle size={18} />
                          )
                        }
                        style={{
                          background:
                            item.type === 'error'
                              ? '#FEECEC'
                              : item.type === 'warning'
                              ? '#FFF7E8'
                              : '#E8F3FF',
                          color:
                            item.type === 'error'
                              ? '#F53F3F'
                              : item.type === 'warning'
                              ? '#FF7D00'
                              : '#165DFF',
                        }}
                      />
                    }
                    title={<span className="text-sm font-medium text-gray-800">{item.title}</span>}
                    description={
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs text-gray-400">{item.time}</span>
                        <Tag
                          color={
                            item.level === '严重'
                              ? 'red'
                              : item.level === '中等'
                              ? 'orange'
                              : 'blue'
                          }
                          style={{ margin: 0 }}
                        >
                          {item.level}
                        </Tag>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
          <Card
            title={<span className="font-semibold mt-4 block">工序进度示意</span>}
            style={{ borderRadius: 8, marginTop: 16 }}
          >
            <Timeline
              items={Object.keys(processIcons).map((key, idx) => {
                const processInfo = processList.find((p) => p.key === key)!;
                const IconComp = processIcons[key];
                const done = idx < 4;
                const active = idx === 4;
                return {
                  dot: (
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center"
                      style={{
                        background: done
                          ? '#00B42A'
                          : active
                          ? processInfo.color
                          : '#E5E6EB',
                        color: active || done ? '#fff' : '#86909C',
                      }}
                    >
                      <IconComp size={14} />
                    </div>
                  ),
                  color: done ? 'green' : active ? 'blue' : 'gray',
                  children: (
                    <div className="py-1">
                      <div className="text-sm font-medium">{processInfo.name}</div>
                      <div className="text-xs text-gray-400 mt-0.5">
                        {done ? '已完成' : active ? '进行中' : '待开始'}
                      </div>
                    </div>
                  ),
                };
              })}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
