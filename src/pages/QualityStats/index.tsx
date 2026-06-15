import { Row, Col, Card, Table, Tag, Select, Space } from 'antd';
import { BarChart3, TrendingDown, Users, AlertTriangle } from 'lucide-react';
import ReactECharts from 'echarts-for-react';
import { useGearStore } from '@/store';
import { PageHeader, StatCard } from '@/components/common/PageComponents';
import { useState } from 'react';

const processNames: Record<string, string> = {
  blank: '齿坯加工',
  hobbing: '滚齿插齿',
  shaving: '剃齿珩齿',
  carburizing: '渗碳淬火',
  grinding: '磨齿精加工',
  inspection: '齿形检测',
  matching: '配对啮合',
};

const processOrder = ['blank', 'hobbing', 'shaving', 'carburizing', 'grinding', 'inspection', 'matching'];

const QualityStats: React.FC = () => {
  const {
    workOrders,
    blankRecords,
    hobbingRecords,
    shavingRecords,
    carburizingRecords,
    grindingRecords,
    inspectionRecords,
    matchingRecords,
    alerts,
  } = useGearStore();

  const [selectedModel, setSelectedModel] = useState<string>('all');
  const [selectedProcess, setSelectedProcess] = useState<string>('all');

  const allModels = [...new Set(workOrders.map((wo) => wo.gearModel))];

  const filteredWorkOrders = selectedModel === 'all'
    ? workOrders
    : workOrders.filter((wo) => wo.gearModel === selectedModel);

  const filteredInspection = inspectionRecords.filter((r) => {
    const wo = workOrders.find((w) => w.id === r.workOrderId);
    if (!wo) return false;
    if (selectedModel !== 'all' && wo.gearModel !== selectedModel) return false;
    return true;
  });

  const filteredMatching = matchingRecords.filter((r) => {
    const wo = workOrders.find((w) => w.id === r.workOrderId);
    if (!wo) return false;
    if (selectedModel !== 'all' && wo.gearModel !== selectedModel) return false;
    return true;
  });

  const qualifiedCount = filteredInspection.filter((r) => r.result === 'qualified').length +
    filteredMatching.filter((r) => r.result === 'qualified').length;
  const unqualifiedCount = filteredInspection.filter((r) => r.result === 'unqualified').length +
    filteredMatching.filter((r) => r.result === 'unqualified').length;
  const totalInspected = qualifiedCount + unqualifiedCount;
  const overallRate = totalInspected > 0 ? Math.round((qualifiedCount / totalInspected) * 100) : 0;

  const processStats = processOrder.map((key) => {
    const recordMap: Record<string, any[]> = {
      blank: blankRecords,
      hobbing: hobbingRecords,
      shaving: shavingRecords,
      carburizing: carburizingRecords,
      grinding: grindingRecords,
      inspection: inspectionRecords,
      matching: matchingRecords,
    };
    const allRecs = recordMap[key] || [];
    const filtered = allRecs.filter((r) => {
      const wo = workOrders.find((w) => w.id === r.workOrderId);
      if (!wo) return false;
      if (selectedModel !== 'all' && wo.gearModel !== selectedModel) return false;
      return true;
    });

    let anomalyCount = 0;
    let totalCount = filtered.length;

    filtered.forEach((r) => {
      if (key === 'blank' && (r.outerDiameter > 260 || r.outerDiameter < 20 || r.endFaceRunout > 0.02 || r.roughness > 3.2)) anomalyCount++;
      if (key === 'hobbing' && (r.toothDirectionError > 0.02 || r.pitchCumulativeError > 0.06)) anomalyCount++;
      if (key === 'shaving' && (r.allowance < 0.1 || r.allowance > 0.2)) anomalyCount++;
      if (key === 'carburizing' && (r.caseDepth < 0.5 || r.caseDepth > 1.5 || r.surfaceHardness < 58)) anomalyCount++;
      if (key === 'grinding' && r.grindingAccuracy > 6) anomalyCount++;
      if (key === 'inspection' && r.result === 'unqualified') anomalyCount++;
      if (key === 'matching' && (r.noiseDb > 72 || r.result === 'unqualified')) anomalyCount++;
    });

    const rate = totalCount > 0 ? Math.round(((totalCount - anomalyCount) / totalCount) * 100) : 0;

    return {
      process: key,
      name: processNames[key],
      totalCount,
      anomalyCount,
      rate,
    };
  });

  const operatorStats: Record<string, { total: number; anomaly: number }> = {};
  const allRecords = [
    ...blankRecords.map((r) => ({ operator: r.operator, anomaly: r.outerDiameter > 260 || r.endFaceRunout > 0.02 })),
    ...hobbingRecords.map((r) => ({ operator: r.operator, anomaly: !!(r.toothDirectionError && r.toothDirectionError > 0.02) })),
    ...shavingRecords.map((r) => ({ operator: r.operator, anomaly: r.allowance < 0.1 || r.allowance > 0.2 })),
    ...carburizingRecords.map((r) => ({ operator: r.operator, anomaly: r.caseDepth < 0.5 || r.surfaceHardness < 58 })),
    ...grindingRecords.map((r) => ({ operator: r.operator, anomaly: r.grindingAccuracy > 6 })),
    ...inspectionRecords.map((r) => ({ operator: r.inspector, anomaly: r.result === 'unqualified' })),
    ...matchingRecords.map((r) => ({ operator: r.inspector, anomaly: r.result === 'unqualified' || r.noiseDb > 72 })),
  ];

  allRecords.forEach((r) => {
    if (!operatorStats[r.operator]) operatorStats[r.operator] = { total: 0, anomaly: 0 };
    operatorStats[r.operator].total++;
    if (r.anomaly) operatorStats[r.operator].anomaly++;
  });

  const operatorTableData = Object.entries(operatorStats).map(([name, stat]) => ({
    name,
    total: stat.total,
    anomaly: stat.anomaly,
    rate: stat.total > 0 ? Math.round(((stat.total - stat.anomaly) / stat.total) * 100) : 0,
  }));

  const processBarOption = {
    tooltip: { trigger: 'axis' },
    legend: { data: ['异常次数', '合格率%'], right: 0, top: 0 },
    grid: { left: 80, right: 40, top: 40, bottom: 40 },
    xAxis: {
      type: 'category',
      data: processStats.map((p) => p.name),
      axisLabel: { color: '#86909C', rotate: 20 },
    },
    yAxis: [
      { type: 'value', name: '异常次数', axisLabel: { color: '#86909C' }, splitLine: { lineStyle: { color: '#F2F3F5' } } },
      { type: 'value', name: '合格率%', min: 0, max: 100, axisLabel: { color: '#86909C' }, splitLine: { show: false } },
    ],
    series: [
      {
        name: '异常次数',
        type: 'bar',
        data: processStats.map((p) => p.anomalyCount),
        itemStyle: {
          color: (params: any) => params.value > 0 ? '#F53F3F' : '#00B42A',
          borderRadius: [4, 4, 0, 0],
        },
        barWidth: 28,
      },
      {
        name: '合格率%',
        type: 'line',
        yAxisIndex: 1,
        data: processStats.map((p) => p.rate),
        smooth: true,
        symbol: 'circle',
        symbolSize: 8,
        lineStyle: { color: '#165DFF', width: 2 },
        itemStyle: { color: '#165DFF' },
        label: { show: true, formatter: '{c}%', position: 'top', fontSize: 11 },
      },
    ],
  };

  const modelPieOption = {
    tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
    legend: { orient: 'vertical', left: 'left', top: 'center' },
    series: [{
      type: 'pie',
      radius: ['45%', '70%'],
      center: ['60%', '50%'],
      avoidLabelOverlap: false,
      label: { show: false },
      emphasis: { label: { show: true, fontSize: 13, fontWeight: 'bold' } },
      data: allModels.map((model) => {
        const woCount = workOrders.filter((wo) => wo.gearModel === model).length;
        return { name: model, value: woCount, itemStyle: { color: model === 'M4Z30' ? '#165DFF' : model === 'M4Z60' ? '#722ED1' : model === 'M5Z12' ? '#13C2C2' : model === 'M3Z25' ? '#00B42A' : model === 'M3Z16' ? '#FF7D00' : '#86909C' } };
      }),
    }],
  };

  const trendOption = {
    tooltip: { trigger: 'axis' },
    legend: { data: ['合格率%', '异常数'], right: 0, top: 0 },
    grid: { left: 60, right: 40, top: 40, bottom: 40 },
    xAxis: {
      type: 'category',
      data: ['第1周', '第2周', '第3周', '第4周', '本周'],
      axisLabel: { color: '#86909C' },
    },
    yAxis: [
      { type: 'value', name: '合格率%', min: 70, max: 100, axisLabel: { color: '#86909C' }, splitLine: { lineStyle: { color: '#F2F3F5' } } },
      { type: 'value', name: '异常数', axisLabel: { color: '#86909C' }, splitLine: { show: false } },
    ],
    series: [
      {
        name: '合格率%',
        type: 'line',
        data: [95, 92, 88, 91, overallRate || 90],
        smooth: true,
        symbol: 'circle',
        symbolSize: 8,
        lineStyle: { color: '#00B42A', width: 3 },
        itemStyle: { color: '#00B42A' },
        areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: 'rgba(0,180,42,0.2)' }, { offset: 1, color: 'rgba(0,180,42,0)' }] } },
        markLine: { silent: true, data: [{ yAxis: 90, lineStyle: { color: '#FF7D00', type: 'dashed' }, label: { formatter: '目标线 90%' } }] },
      },
      {
        name: '异常数',
        type: 'bar',
        yAxisIndex: 1,
        data: [3, 5, 8, 4, alerts.length || 2],
        itemStyle: { color: '#F53F3F', borderRadius: [4, 4, 0, 0] },
        barWidth: 24,
      },
    ],
  };

  const processColumns = [
    { title: '工序', dataIndex: 'name', width: 120, render: (v: string, r: any) => <span className="font-semibold">{v}</span> },
    { title: '记录总数', dataIndex: 'totalCount', width: 100, align: 'center' as const },
    { title: '异常次数', dataIndex: 'anomalyCount', width: 100, align: 'center' as const, render: (v: number) => <span className={v > 0 ? 'text-red-500 font-semibold' : 'text-green-600'}>{v}</span> },
    {
      title: '合格率',
      dataIndex: 'rate',
      width: 160,
      render: (v: number) => (
        <div className="flex items-center gap-2">
          <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${v}%`,
                background: v >= 90 ? '#00B42A' : v >= 70 ? '#FF7D00' : '#F53F3F',
              }}
            />
          </div>
          <span className={`text-xs font-semibold min-w-[36px] ${v >= 90 ? 'text-green-600' : v >= 70 ? 'text-orange-500' : 'text-red-500'}`}>{v}%</span>
        </div>
      ),
    },
  ];

  const operatorColumns = [
    { title: '操作员', dataIndex: 'name', width: 120, render: (v: string) => <span className="font-semibold">{v}</span> },
    { title: '操作总次数', dataIndex: 'total', width: 100, align: 'center' as const },
    { title: '异常次数', dataIndex: 'anomaly', width: 100, align: 'center' as const, render: (v: number) => <span className={v > 0 ? 'text-red-500 font-semibold' : 'text-green-600'}>{v}</span> },
    {
      title: '合格率',
      dataIndex: 'rate',
      width: 160,
      render: (v: number) => (
        <div className="flex items-center gap-2">
          <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${v}%`,
                background: v >= 90 ? '#00B42A' : v >= 70 ? '#FF7D00' : '#F53F3F',
              }}
            />
          </div>
          <span className={`text-xs font-semibold min-w-[36px] ${v >= 90 ? 'text-green-600' : v >= 70 ? 'text-orange-500' : 'text-red-500'}`}>{v}%</span>
        </div>
      ),
    },
  ];

  const recentAlerts = alerts.slice(0, 10);

  return (
    <div className="quality-stats-page">
      <PageHeader
        title="质量统计"
        description="按产品型号、工序、操作员分析合格率与异常趋势，辅助每周质量复盘"
        icon={<BarChart3 size={22} />}
      />

      <div className="mb-4 flex items-center gap-4 flex-wrap">
        <Space>
          <span className="text-sm text-gray-500">筛选：</span>
          <Select
            value={selectedModel}
            onChange={setSelectedModel}
            style={{ width: 150 }}
            options={[{ label: '全部型号', value: 'all' }, ...allModels.map((m) => ({ label: m, value: m }))]}
          />
          <Select
            value={selectedProcess}
            onChange={setSelectedProcess}
            style={{ width: 140 }}
            options={[{ label: '全部工序', value: 'all' }, ...processOrder.map((p) => ({ label: processNames[p], value: p }))]}
          />
        </Space>
      </div>

      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="综合合格率"
            value={overallRate}
            unit="%"
            icon={<BarChart3 size={20} />}
            color={overallRate >= 90 ? '#00B42A' : overallRate >= 70 ? '#FF7D00' : '#F53F3F'}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="检测总数"
            value={totalInspected}
            unit="项"
            icon={<BarChart3 size={20} />}
            color="#165DFF"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="不合格项"
            value={unqualifiedCount}
            unit="项"
            icon={<TrendingDown size={20} />}
            color="#F53F3F"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="实时预警"
            value={alerts.length}
            unit="条"
            icon={<AlertTriangle size={20} />}
            color="#FF7D00"
          />
        </Col>
      </Row>

      <Row gutter={16} className="mb-6">
        <Col xs={24} lg={14}>
          <Card
            title={<span className="font-semibold">各工序异常次数与合格率</span>}
            style={{ borderRadius: 8, height: '100%' }}
          >
            <ReactECharts option={processBarOption} style={{ height: 320 }} />
          </Card>
        </Col>
        <Col xs={24} lg={10}>
          <Card
            title={<span className="font-semibold">产品型号分布</span>}
            style={{ borderRadius: 8, height: '100%' }}
          >
            <ReactECharts option={modelPieOption} style={{ height: 320 }} />
          </Card>
        </Col>
      </Row>

      <Row gutter={16} className="mb-6">
        <Col xs={24}>
          <Card
            title={<span className="font-semibold">周度质量趋势</span>}
            extra={<Tag color="orange">目标线 90%</Tag>}
            style={{ borderRadius: 8 }}
          >
            <ReactECharts option={trendOption} style={{ height: 280 }} />
          </Card>
        </Col>
      </Row>

      <Row gutter={16} className="mb-6">
        <Col xs={24} lg={12}>
          <Card
            title={<span className="font-semibold">工序合格率排行</span>}
            style={{ borderRadius: 8 }}
          >
            <Table
              columns={processColumns}
              dataSource={processStats}
              rowKey="process"
              pagination={false}
              size="middle"
            />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card
            title={<span className="font-semibold flex items-center gap-2"><Users size={16} />操作员质量排行</span>}
            style={{ borderRadius: 8 }}
          >
            <Table
              columns={operatorColumns}
              dataSource={operatorTableData}
              rowKey="name"
              pagination={false}
              size="middle"
            />
          </Card>
        </Col>
      </Row>

      {recentAlerts.length > 0 && (
        <Card
          title={<span className="font-semibold flex items-center gap-2"><AlertTriangle size={16} className="text-orange-500" />最近质量预警 ({alerts.length})</span>}
          style={{ borderRadius: 8 }}
        >
          <Table
            columns={[
              { title: '时间', dataIndex: 'time', width: 170 },
              { title: '工序', dataIndex: 'process', width: 100, render: (v: string) => <Tag>{processNames[v] || v}</Tag> },
              { title: '级别', dataIndex: 'level', width: 80, align: 'center' as const, render: (v: string) => <Tag color={v === '严重' ? 'red' : v === '中等' ? 'orange' : 'blue'}>{v}</Tag> },
              { title: '预警内容', dataIndex: 'message' },
              { title: '类型', dataIndex: 'type', width: 80, align: 'center' as const, render: (v: string) => <Tag color={v === 'error' ? 'red' : v === 'warning' ? 'orange' : 'blue'}>{v === 'error' ? '严重' : v === 'warning' ? '警告' : '提示'}</Tag> },
            ]}
            dataSource={recentAlerts}
            rowKey="id"
            pagination={false}
            size="small"
          />
        </Card>
      )}
    </div>
  );
};

export default QualityStats;
