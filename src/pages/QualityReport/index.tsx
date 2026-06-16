import { useState, useMemo } from 'react';
import { Row, Col, Card, Table, Tag, DatePicker, Button, Space, message, Progress } from 'antd';
import { FileText, Download, BarChart3, Users, AlertTriangle } from 'lucide-react';
import ReactECharts from 'echarts-for-react';
import { useGearStore } from '@/store';
import { PageHeader, StatCard } from '@/components/common/PageComponents';
import { isProcessRecordAnomaly } from '@/utils';
import dayjs, { Dayjs } from 'dayjs';

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

const levelColors: Record<string, string> = {
  严重: 'red',
  中等: 'orange',
  轻微: 'blue',
};

const QualityReport: React.FC = () => {
  const { workOrders, blankRecords, hobbingRecords, shavingRecords, carburizingRecords, grindingRecords, inspectionRecords, matchingRecords, alerts } = useGearStore();

  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null] | null>([
    dayjs().subtract(7, 'day').startOf('day'),
    dayjs().endOf('day'),
  ]);

  const recordMap: Record<string, any[]> = {
    blank: blankRecords,
    hobbing: hobbingRecords,
    shaving: shavingRecords,
    carburizing: carburizingRecords,
    grinding: grindingRecords,
    inspection: inspectionRecords,
    matching: matchingRecords,
  };

  const inRange = (time: string): boolean => {
    if (!dateRange || !dateRange[0] || !dateRange[1]) return true;
    const t = dayjs(time).valueOf();
    return t >= dateRange[0].valueOf() && t <= dateRange[1].valueOf();
  };

  const getWorkOrder = (workOrderId: string) => workOrders.find((w) => w.id === workOrderId);

  const stats = useMemo(() => {
    const modelStats: Record<string, { total: number; anomaly: number }> = {};
    const processStats: Record<string, { total: number; anomaly: number }> = {};
    const operatorStats: Record<string, { total: number; anomaly: number }> = {};
    const alertList: any[] = [];
    let totalRecords = 0;
    let totalAnomaly = 0;

    processOrder.forEach((key) => {
      const recs = recordMap[key] || [];
      const filtered = recs.filter((r) => inRange(r.recordTime));

      processStats[key] = { total: 0, anomaly: 0 };

      filtered.forEach((r: any) => {
        const wo = getWorkOrder(r.workOrderId);
        const model = wo?.gearModel || '未知';
        const operator = r.operator || r.inspector || '未知';

        const isAnomaly = isProcessRecordAnomaly(key, r);

        if (!modelStats[model]) modelStats[model] = { total: 0, anomaly: 0 };
        modelStats[model].total++;
        if (isAnomaly) modelStats[model].anomaly++;

        processStats[key].total++;
        if (isAnomaly) processStats[key].anomaly++;

        if (!operatorStats[operator]) operatorStats[operator] = { total: 0, anomaly: 0 };
        operatorStats[operator].total++;
        if (isAnomaly) operatorStats[operator].anomaly++;

        totalRecords++;
        if (isAnomaly) totalAnomaly++;
      });
    });

    const filteredAlerts = alerts.filter((a) => inRange(a.time));
    filteredAlerts.forEach((a) => alertList.push(a));

    const overallRate = totalRecords > 0 ? Math.round(((totalRecords - totalAnomaly) / totalRecords) * 100) : 0;

    const modelTableData = Object.entries(modelStats).map(([model, s]) => ({
      model,
      total: s.total,
      anomaly: s.anomaly,
      rate: s.total > 0 ? Math.round(((s.total - s.anomaly) / s.total) * 100) : 0,
    })).sort((a, b) => b.total - a.total);

    const processTableData = processOrder.map((key) => ({
      process: key,
      name: processNames[key],
      total: processStats[key]?.total || 0,
      anomaly: processStats[key]?.anomaly || 0,
      rate: (processStats[key]?.total || 0) > 0 ? Math.round(((processStats[key].total - processStats[key].anomaly) / processStats[key].total) * 100) : 0,
    }));

    const operatorTableData = Object.entries(operatorStats).map(([name, s]) => ({
      name,
      total: s.total,
      anomaly: s.anomaly,
      rate: s.total > 0 ? Math.round(((s.total - s.anomaly) / s.total) * 100) : 0,
    })).sort((a, b) => b.total - a.total);

    return {
      overallRate,
      totalRecords,
      totalAnomaly,
      alertCount: alertList.length,
      modelTableData,
      processTableData,
      operatorTableData,
      alertList,
    };
  }, [dateRange, workOrders, alerts, blankRecords, hobbingRecords, shavingRecords, carburizingRecords, grindingRecords, inspectionRecords, matchingRecords]);

  const processBarOption = useMemo(() => {
    return {
      tooltip: { trigger: 'axis' },
      legend: { data: ['异常次数', '合格率%'], right: 0, top: 0 },
      grid: { left: 80, right: 40, top: 40, bottom: 40 },
      xAxis: {
        type: 'category',
        data: stats.processTableData.map((p) => p.name),
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
          data: stats.processTableData.map((p) => p.anomaly),
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
          data: stats.processTableData.map((p) => p.rate),
          smooth: true,
          symbol: 'circle',
          symbolSize: 8,
          lineStyle: { color: '#165DFF', width: 2 },
          itemStyle: { color: '#165DFF' },
          label: { show: true, formatter: '{c}%', position: 'top', fontSize: 11 },
        },
      ],
    };
  }, [stats]);

  const modelPieOption = useMemo(() => {
    const colorMap: Record<string, string> = {
      'M4Z30': '#165DFF',
      'M4Z60': '#722ED1',
      'M5Z12': '#13C2C2',
      'M3Z25': '#00B42A',
      'M3Z16': '#FF7D00',
    };

    return {
      tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
      legend: { orient: 'vertical', left: 'left', top: 'center' },
      series: [{
        type: 'pie',
        radius: ['45%', '70%'],
        center: ['60%', '50%'],
        avoidLabelOverlap: false,
        label: { show: false },
        emphasis: { label: { show: true, fontSize: 13, fontWeight: 'bold' } },
        data: stats.modelTableData.map((m) => ({
          name: m.model,
          value: m.total,
          itemStyle: { color: colorMap[m.model] || '#86909C' },
        })),
      }],
    };
  }, [stats]);

  const exportToCSV = () => {
    const lines: string[] = [];
    const dateRangeText = dateRange && dateRange[0] && dateRange[1]
      ? `${dateRange[0].format('YYYY-MM-DD')} 至 ${dateRange[1].format('YYYY-MM-DD')}`
      : '全部时间';

    lines.push(`质量周报,${dateRangeText}`);
    lines.push('');

    lines.push('一、综合指标');
    lines.push(`综合合格率,${stats.overallRate}%`);
    lines.push(`检测总数,${stats.totalRecords}项`);
    lines.push(`不合格项,${stats.totalAnomaly}项`);
    lines.push(`质量预警,${stats.alertCount}条`);
    lines.push('');

    lines.push('二、产品型号合格率');
    lines.push('型号,记录数,异常数,合格率');
    stats.modelTableData.forEach((m) => {
      lines.push(`${m.model},${m.total},${m.anomaly},${m.rate}%`);
    });
    lines.push('');

    lines.push('三、工序合格率');
    lines.push('工序,记录数,异常数,合格率');
    stats.processTableData.forEach((p) => {
      lines.push(`${p.name},${p.total},${p.anomaly},${p.rate}%`);
    });
    lines.push('');

    lines.push('四、操作员质量排行');
    lines.push('操作员,操作次数,异常次数,合格率');
    stats.operatorTableData.forEach((o) => {
      lines.push(`${o.name},${o.total},${o.anomaly},${o.rate}%`);
    });
    lines.push('');

    lines.push('五、质量异常清单');
    lines.push('时间,工序,级别,状态,预警内容,处理人,复检结果');
    stats.alertList.forEach((a) => {
      const statusMap: Record<string, string> = { pending: '待处理', processing: '处理中', closed: '已关闭' };
      const recheckMap: Record<string, string> = { passed: '通过', failed: '未通过' };
      lines.push(`${a.time},${processNames[a.process] || a.process},${a.level},${statusMap[a.status] || a.status},${a.message},${a.handler || '-'},${a.recheckResult ? recheckMap[a.recheckResult] : '-'}`);
    });

    const csv = '\uFEFF' + lines.join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `质量周报_${dayjs().format('YYYYMMDD')}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    message.success('周报导出成功');
  };

  const alertColumns = [
    { title: '时间', dataIndex: 'time', width: 170 },
    { title: '工序', dataIndex: 'process', width: 100, render: (v: string) => <Tag>{processNames[v] || v}</Tag> },
    { title: '级别', dataIndex: 'level', width: 80, align: 'center' as const, render: (v: string) => <Tag color={levelColors[v] || 'blue'}>{v}</Tag> },
    { title: '状态', dataIndex: 'status', width: 90, align: 'center' as const, render: (v: string) => {
      const colorMap: Record<string, string> = { pending: 'red', processing: 'orange', closed: 'green' };
      const textMap: Record<string, string> = { pending: '待处理', processing: '处理中', closed: '已关闭' };
      return <Tag color={colorMap[v]}>{textMap[v]}</Tag>;
    }},
    { title: '预警内容', dataIndex: 'message' },
    { title: '处理人', dataIndex: 'handler', width: 100 },
    { title: '复检结果', dataIndex: 'recheckResult', width: 90, align: 'center' as const, render: (v: string) => {
      if (!v) return '-';
      return <Tag color={v === 'passed' ? 'green' : 'red'}>{v === 'passed' ? '通过' : '未通过'}</Tag>;
    }},
  ];

  const modelColumns = [
    { title: '产品型号', dataIndex: 'model', width: 140, render: (v: string) => <span className="font-semibold">{v}</span> },
    { title: '记录数', dataIndex: 'total', width: 100, align: 'center' as const },
    { title: '异常数', dataIndex: 'anomaly', width: 100, align: 'center' as const, render: (v: number) => <span className={v > 0 ? 'text-red-500 font-semibold' : 'text-green-600'}>{v}</span> },
    {
      title: '合格率',
      dataIndex: 'rate',
      render: (v: number) => (
        <div className="flex items-center gap-2">
          <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full rounded-full" style={{ width: `${v}%`, background: v >= 90 ? '#00B42A' : v >= 70 ? '#FF7D00' : '#F53F3F' }} />
          </div>
          <span className="text-xs font-semibold min-w-[40px]" style={{ color: v >= 90 ? '#00B42A' : v >= 70 ? '#FF7D00' : '#F53F3F' }}>{v}%</span>
        </div>
      ),
    },
  ];

  const processColumns = [
    { title: '工序', dataIndex: 'name', width: 120, render: (v: string) => <span className="font-semibold">{v}</span> },
    { title: '记录数', dataIndex: 'total', width: 100, align: 'center' as const },
    { title: '异常数', dataIndex: 'anomaly', width: 100, align: 'center' as const, render: (v: number) => <span className={v > 0 ? 'text-red-500 font-semibold' : 'text-green-600'}>{v}</span> },
    {
      title: '合格率',
      dataIndex: 'rate',
      render: (v: number) => (
        <div className="flex items-center gap-2">
          <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full rounded-full" style={{ width: `${v}%`, background: v >= 90 ? '#00B42A' : v >= 70 ? '#FF7D00' : '#F53F3F' }} />
          </div>
          <span className="text-xs font-semibold min-w-[40px]" style={{ color: v >= 90 ? '#00B42A' : v >= 70 ? '#FF7D00' : '#F53F3F' }}>{v}%</span>
        </div>
      ),
    },
  ];

  const operatorColumns = [
    { title: '操作员', dataIndex: 'name', width: 140, render: (v: string) => <span className="font-semibold">{v}</span> },
    { title: '操作次数', dataIndex: 'total', width: 100, align: 'center' as const },
    { title: '异常次数', dataIndex: 'anomaly', width: 100, align: 'center' as const, render: (v: number) => <span className={v > 0 ? 'text-red-500 font-semibold' : 'text-green-600'}>{v}</span> },
    {
      title: '合格率',
      dataIndex: 'rate',
      render: (v: number) => (
        <div className="flex items-center gap-2">
          <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full rounded-full" style={{ width: `${v}%`, background: v >= 90 ? '#00B42A' : v >= 70 ? '#FF7D00' : '#F53F3F' }} />
          </div>
          <span className="text-xs font-semibold min-w-[40px]" style={{ color: v >= 90 ? '#00B42A' : v >= 70 ? '#FF7D00' : '#F53F3F' }}>{v}%</span>
        </div>
      ),
    },
  ];

  return (
    <div className="quality-report-page">
      <PageHeader
        title="周报导出"
        description="按时间范围汇总质量数据，支持预览和导出CSV格式周报"
        icon={<FileText size={22} className="text-blue-500" />}
      />

      <Card style={{ borderRadius: 8, marginBottom: 16 }} styles={{ body: { padding: 16 } }}>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <Space>
            <span className="text-sm text-gray-500">统计周期：</span>
            <DatePicker.RangePicker
              value={dateRange as any}
              onChange={(dates) => setDateRange(dates as any)}
              allowClear={false}
            />
            <Button type="default" onClick={() => setDateRange([dayjs().subtract(7, 'day').startOf('day'), dayjs().endOf('day')])}>
              最近一周
            </Button>
            <Button type="default" onClick={() => setDateRange([dayjs().subtract(30, 'day').startOf('day'), dayjs().endOf('day')])}>
              最近一月
            </Button>
          </Space>
          <Button type="primary" icon={<Download size={16} />} onClick={exportToCSV}>
            导出周报 (CSV)
          </Button>
        </div>
      </Card>

      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="综合合格率"
            value={stats.overallRate}
            unit="%"
            icon={<BarChart3 size={20} />}
            color={stats.overallRate >= 90 ? '#00B42A' : stats.overallRate >= 70 ? '#FF7D00' : '#F53F3F'}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="检测总数"
            value={stats.totalRecords}
            unit="项"
            icon={<BarChart3 size={20} />}
            color="#165DFF"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="不合格项"
            value={stats.totalAnomaly}
            unit="项"
            icon={<AlertTriangle size={20} />}
            color="#F53F3F"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="质量预警"
            value={stats.alertCount}
            unit="条"
            icon={<AlertTriangle size={20} />}
            color="#FF7D00"
          />
        </Col>
      </Row>

      <Row gutter={16} className="mb-6">
        <Col xs={24} lg={14}>
          <Card title={<span className="font-semibold">各工序合格率</span>} style={{ borderRadius: 8, height: '100%' }}>
            <ReactECharts option={processBarOption} style={{ height: 300 }} />
          </Card>
        </Col>
        <Col xs={24} lg={10}>
          <Card title={<span className="font-semibold">产品型号分布</span>} style={{ borderRadius: 8, height: '100%' }}>
            <ReactECharts option={modelPieOption} style={{ height: 300 }} />
          </Card>
        </Col>
      </Row>

      <Row gutter={16} className="mb-6">
        <Col xs={24} lg={12}>
          <Card title={<span className="font-semibold">产品型号合格率</span>} style={{ borderRadius: 8 }}>
            <Table
              columns={modelColumns}
              dataSource={stats.modelTableData}
              rowKey="model"
              pagination={false}
              size="middle"
            />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title={<span className="font-semibold flex items-center gap-2"><Users size={16} />操作员质量排行</span>} style={{ borderRadius: 8 }}>
            <Table
              columns={operatorColumns}
              dataSource={stats.operatorTableData}
              rowKey="name"
              pagination={false}
              size="middle"
            />
          </Card>
        </Col>
      </Row>

      <Card
        title={<span className="font-semibold flex items-center gap-2"><AlertTriangle size={16} className="text-orange-500" />质量异常清单</span>}
        style={{ borderRadius: 8 }}
        extra={<span className="text-sm text-gray-500">共 {stats.alertList.length} 条异常</span>}
      >
        <Table
          columns={alertColumns}
          dataSource={stats.alertList}
          rowKey="id"
          pagination={{ pageSize: 8, showSizeChanger: true, showTotal: (total) => `共 ${total} 条` }}
          size="middle"
        />
      </Card>
    </div>
  );
};

export default QualityReport;
