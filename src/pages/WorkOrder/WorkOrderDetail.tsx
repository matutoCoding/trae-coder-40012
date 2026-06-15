import { useParams, useNavigate } from 'react-router-dom';
import { Button, Card, Descriptions, Row, Col, Tag, Timeline, Empty, Divider, Steps, Table, Space, Collapse, Badge } from 'antd';
import { ArrowLeft, CircleDot, Scissors, Flame, Sparkles, FileCheck, Puzzle, Box, CheckCircle2, AlertTriangle, Clock } from 'lucide-react';
import { useGearStore } from '@/store';
import { StatusTag } from '@/components/common/PageComponents';

const processIcons: Record<string, React.ElementType> = {
  blank: CircleDot,
  hobbing: CircleDot,
  shaving: Scissors,
  carburizing: Flame,
  grinding: Sparkles,
  inspection: FileCheck,
  matching: Puzzle,
};

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

const processColors: Record<string, string> = {
  blank: '#165DFF',
  hobbing: '#722ED1',
  shaving: '#13C2C2',
  carburizing: '#F53F3F',
  grinding: '#FF7D00',
  inspection: '#00B42A',
  matching: '#86909C',
};

interface TimelineNode {
  process: string;
  label: string;
  color: string;
  done: boolean;
  records: any[];
  alerts: any[];
  summaryItems: { label: string; value: string; status?: 'normal' | 'warning' | 'error' }[];
  result?: 'qualified' | 'unqualified' | 'processing';
  time?: string;
  operator?: string;
}

const WorkOrderDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getWorkOrderById, getRecordsByWorkOrderId, getAlertsByWorkOrderId } = useGearStore();

  const workOrder = id ? getWorkOrderById(id) : undefined;
  const records = id ? getRecordsByWorkOrderId(id) : null;
  const alertList = id ? getAlertsByWorkOrderId(id) : [];

  if (!workOrder || !records) {
    return (
      <div className="p-12">
        <Empty description="工单不存在" />
        <div className="text-center mt-4">
          <Button onClick={() => navigate('/workorders')}>返回工单列表</Button>
        </div>
      </div>
    );
  }

  const progressKeys = Object.keys(workOrder.processProgress) as string[];
  const completedCount = progressKeys.filter((k) => workOrder.processProgress[k as keyof typeof workOrder.processProgress]).length;
  const currentStepIndex = completedCount > 0 ? Math.min(completedCount - 1, 6) : 0;

  const buildTimelineNodes = (): TimelineNode[] => {
    return processOrder.map((key) => {
      const done = workOrder.processProgress[key as keyof typeof workOrder.processProgress];
      const recs = records[key as keyof typeof records] as any[];
      let summaryItems: TimelineNode['summaryItems'] = [];
      let result: TimelineNode['result'] | undefined;
      let time: string | undefined;
      let operator: string | undefined;

      if (recs.length > 0) {
        const r = recs[0];
        operator = r.operator || r.inspector;
        time = r.recordTime;

        switch (key) {
          case 'blank':
            summaryItems = [
              { label: '外圆直径', value: `${r.outerDiameter.toFixed(3)} mm`, status: r.outerDiameter > 260 || r.outerDiameter < 20 ? 'error' : 'normal' },
              { label: '端面跳动', value: `${(r.endFaceRunout * 1000).toFixed(1)} μm`, status: r.endFaceRunout > 0.02 ? 'error' : 'normal' },
              { label: '粗糙度', value: `Ra ${r.roughness} μm`, status: r.roughness > 3.2 ? 'warning' : 'normal' },
            ];
            break;
          case 'hobbing':
            summaryItems = [
              { label: '工序类型', value: r.processType },
              { label: '模数', value: r.hobModule ? `M${r.hobModule}` : '-' },
              { label: '齿向误差', value: r.toothDirectionError ? `${(r.toothDirectionError * 1000).toFixed(1)} μm` : '-', status: r.toothDirectionError && r.toothDirectionError > 0.02 ? 'error' : 'normal' },
              { label: '齿距累积', value: r.pitchCumulativeError ? `${(r.pitchCumulativeError * 1000).toFixed(1)} μm` : '-' },
            ];
            break;
          case 'shaving':
            summaryItems = [
              { label: '剃前Wk', value: `${r.preShaveWk.toFixed(3)} mm` },
              { label: '剃后Wk', value: `${r.postShaveWk.toFixed(3)} mm` },
              { label: '剃齿余量', value: `${r.allowance.toFixed(3)} mm`, status: r.allowance < 0.1 || r.allowance > 0.2 ? 'warning' : 'normal' },
            ];
            break;
          case 'carburizing':
            summaryItems = [
              { label: '渗碳温度', value: `${r.carburizingTemp} ℃` },
              { label: '渗碳层深度', value: `${r.caseDepth.toFixed(2)} mm`, status: r.caseDepth < 0.5 || r.caseDepth > 1.5 ? 'error' : 'normal' },
              { label: '表面硬度', value: `${r.surfaceHardness.toFixed(1)} HRC`, status: r.surfaceHardness < 58 ? 'error' : 'normal' },
              { label: '心部硬度', value: `${r.coreHardness} HRC` },
            ];
            break;
          case 'grinding':
            summaryItems = [
              { label: '砂轮型号', value: r.wheelModel },
              { label: '修整次数', value: `${r.dressingPass} 次` },
              { label: '精度等级', value: `${r.grindingAccuracy} 级`, status: r.grindingAccuracy > 6 ? 'warning' : 'normal' },
            ];
            break;
          case 'inspection':
            result = r.result;
            summaryItems = [
              { label: '齿形Fa', value: `${(r.faTotal * 1000).toFixed(1)} μm`, status: r.faTotal > 0.02 ? 'error' : 'normal' },
              { label: '齿向Fβ', value: `${(r.fbTotal * 1000).toFixed(1)} μm`, status: r.fbTotal > 0.025 ? 'error' : 'normal' },
              { label: '径向跳动', value: `${(r.radialRunout * 1000).toFixed(1)} μm`, status: r.radialRunout > 0.05 ? 'error' : 'normal' },
              { label: '粗糙度', value: `Ra ${r.roughnessRa} μm`, status: r.roughnessRa > 0.8 ? 'warning' : 'normal' },
              { label: '公法线', value: `${r.commonNormal.toFixed(3)} mm` },
              { label: '综合判定', value: r.result === 'qualified' ? '合格 ✓' : '不合格 ✗', status: r.result === 'unqualified' ? 'error' : 'normal' },
            ];
            break;
          case 'matching':
            result = r.result;
            summaryItems = [
              { label: '主动轮', value: r.drivingGearNo },
              { label: '从动轮', value: r.drivenGearNo },
              { label: '侧隙', value: `${r.backlash.toFixed(3)} mm`, status: r.backlash < 0.05 || r.backlash > 0.25 ? 'warning' : 'normal' },
              { label: '噪声', value: `${r.noiseDb} dB`, status: r.noiseDb > 72 ? 'error' : 'normal' },
              { label: '综合判定', value: r.result === 'qualified' ? '合格 ✓' : '不合格 ✗', status: r.result === 'unqualified' ? 'error' : 'normal' },
            ];
            break;
        }
      }

      return {
        process: key,
        label: processNames[key],
        color: processColors[key],
        done,
        records: recs,
        alerts: alertList.filter((a) => a.process === key),
        summaryItems,
        result,
        time,
        operator,
      };
    });
  };

  const timelineNodes = buildTimelineNodes();

  const renderRecordSection = (key: string, title: string, data: any[], columns: any[]) => {
    const IconComp = processIcons[key];
    const color = processColors[key];
    const done = workOrder.processProgress[key as keyof typeof workOrder.processProgress];

    return (
      <Card
        key={key}
        className="mb-4 record-section"
        style={{
          borderRadius: 8,
          borderLeft: `4px solid ${color}`,
          opacity: done ? 1 : 0.6,
        }}
        title={
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded flex items-center justify-center"
              style={{ background: `${color}14`, color }}
            >
              <IconComp size={16} />
            </div>
            <span className="font-semibold">{title}</span>
            <Tag color={done ? 'green' : 'default'}>{done ? '已完成' : '待处理'}</Tag>
            {data.length > 0 && <Tag color="blue">{data.length} 条记录</Tag>}
          </div>
        }
      >
        {data.length > 0 ? (
          <Table
            size="small"
            columns={columns}
            dataSource={data}
            rowKey="id"
            pagination={false}
            scroll={{ x: 'max-content' }}
          />
        ) : (
          <Empty description={`暂无${title}记录`} image={Empty.PRESENTED_IMAGE_SIMPLE} style={{ padding: '16px 0' }} />
        )}
      </Card>
    );
  };

  const blankColumns = [
    { title: '批次号', dataIndex: 'batchNo', width: 130, render: (v: string) => <span className="font-mono text-xs">{v}</span> },
    { title: '外圆直径(mm)', dataIndex: 'outerDiameter', align: 'center' as const, render: (v: number) => v.toFixed(3) },
    { title: '公差带', dataIndex: 'outerDiameterTolerance' },
    { title: '端面跳动(μm)', dataIndex: 'endFaceRunout', align: 'center' as const, render: (v: number) => (v * 1000).toFixed(1) },
    { title: '粗糙度', dataIndex: 'roughness', align: 'center' as const, render: (v: number) => `Ra ${v}` },
    { title: '操作员', dataIndex: 'operator' },
    { title: '记录时间', dataIndex: 'recordTime' },
  ];

  const hobbingColumns = [
    { title: '类型', dataIndex: 'processType', width: 80, render: (v: string) => <Tag>{v}</Tag> },
    { title: '刀具型号', dataIndex: 'hobModel', width: 100 },
    { title: '模数', dataIndex: 'hobModule', width: 60, align: 'center' as const, render: (v: number) => v ? `M${v}` : '-' },
    { title: '切削速度', dataIndex: 'cuttingSpeed', align: 'center' as const, render: (v: number) => `${v} m/min` },
    { title: '进给量', dataIndex: 'feedRate', align: 'center' as const, render: (v: number) => `${v} mm/r` },
    { title: '齿向误差(μm)', dataIndex: 'toothDirectionError', align: 'center' as const, render: (v?: number) => v ? (v * 1000).toFixed(1) : '-' },
    { title: '齿距累积(μm)', dataIndex: 'pitchCumulativeError', align: 'center' as const, render: (v?: number) => v ? (v * 1000).toFixed(1) : '-' },
    { title: '键槽宽(mm)', dataIndex: 'keywayWidth', align: 'center' as const, render: (v?: number) => v?.toFixed(2) || '-' },
    { title: '对称度(μm)', dataIndex: 'symmetry', align: 'center' as const, render: (v?: number) => v ? (v * 1000).toFixed(1) : '-' },
    { title: '操作员', dataIndex: 'operator' },
    { title: '记录时间', dataIndex: 'recordTime' },
  ];

  const shavingColumns = [
    { title: '齿数', dataIndex: 'toothCount', width: 60, align: 'center' as const, render: (v: number) => `Z${v}` },
    { title: '剃前Wk(mm)', dataIndex: 'preShaveWk', align: 'center' as const, render: (v: number) => v.toFixed(3) },
    { title: '剃后Wk(mm)', dataIndex: 'postShaveWk', align: 'center' as const, render: (v: number) => v.toFixed(3) },
    { title: '剃齿余量(mm)', dataIndex: 'allowance', align: 'center' as const, render: (v: number) => <Tag color={v >= 0.1 && v <= 0.2 ? 'geekblue' : 'orange'}>{v.toFixed(3)}</Tag> },
    { title: '操作员', dataIndex: 'operator' },
    { title: '记录时间', dataIndex: 'recordTime' },
  ];

  const carburizingColumns = [
    { title: '温度(℃)', dataIndex: 'carburizingTemp', width: 90, align: 'center' as const, render: (v: number) => <span className="text-red-500 font-semibold">{v}</span> },
    { title: '保温时间(h)', dataIndex: 'holdingTime', align: 'center' as const },
    { title: '渗碳层深度(mm)', dataIndex: 'caseDepth', align: 'center' as const, render: (v: number) => <Tag color={v >= 0.5 && v <= 1.5 ? 'green' : 'orange'}>{v.toFixed(2)}</Tag> },
    { title: '表面硬度(HRC)', dataIndex: 'surfaceHardness', align: 'center' as const, render: (v: number) => <span className={v < 58 ? 'text-red-500 font-semibold' : ''}>{v.toFixed(1)}</span> },
    { title: '心部硬度(HRC)', dataIndex: 'coreHardness', align: 'center' as const },
    { title: '操作员', dataIndex: 'operator' },
    { title: '记录时间', dataIndex: 'recordTime' },
  ];

  const grindingColumns = [
    { title: '砂轮型号', dataIndex: 'wheelModel', render: (v: string) => <Tag color="geekblue">{v}</Tag> },
    { title: '修整进给', dataIndex: 'dressingFeed', align: 'center' as const, render: (v: number) => `${v.toFixed(3)}mm` },
    { title: '修整次数', dataIndex: 'dressingPass', align: 'center' as const, render: (v: number) => `${v}次` },
    { title: '修整深度', dataIndex: 'dressingDepth', align: 'center' as const, render: (v: number) => `${v.toFixed(3)}mm` },
    { title: '精度等级', dataIndex: 'grindingAccuracy', align: 'center' as const, render: (v: number) => <Tag color={v <= 5 ? 'green' : v <= 6 ? 'blue' : 'orange'}>{v}级</Tag> },
    { title: '操作员', dataIndex: 'operator' },
    { title: '记录时间', dataIndex: 'recordTime' },
  ];

  const inspectionColumns = [
    { title: 'Fa(μm)', dataIndex: 'faTotal', align: 'center' as const, render: (v: number) => <span className={v > 0.02 ? 'text-red-500 font-semibold' : ''}>{(v * 1000).toFixed(1)}</span> },
    { title: 'Fβ(μm)', dataIndex: 'fbTotal', align: 'center' as const, render: (v: number) => <span className={v > 0.025 ? 'text-red-500 font-semibold' : ''}>{(v * 1000).toFixed(1)}</span> },
    { title: '公法线(mm)', dataIndex: 'commonNormal', align: 'center' as const, render: (v: number, r: any) => `${v.toFixed(3)} (跨${Math.round(r.spanToothCount)}齿)` },
    { title: '变动量(μm)', dataIndex: 'commonNormalVariation', align: 'center' as const, render: (v: number) => (v * 1000).toFixed(0) },
    { title: '径向跳动(μm)', dataIndex: 'radialRunout', align: 'center' as const, render: (v: number) => <span className={v > 0.05 ? 'text-red-500 font-semibold' : ''}>{(v * 1000).toFixed(1)}</span> },
    { title: '粗糙度', align: 'center' as const, render: (_: any, r: any) => `Ra${r.roughnessRa}/Rz${r.roughnessRz}` },
    { title: '判定', dataIndex: 'result', align: 'center' as const, render: (s: string) => <StatusTag status={s} /> },
    { title: '质检员', dataIndex: 'inspector' },
    { title: '检测时间', dataIndex: 'recordTime' },
  ];

  const matchingColumns = [
    { title: '主动轮', dataIndex: 'drivingGearNo', width: 150, render: (v: string) => <span className="font-mono text-xs">{v}</span> },
    { title: '从动轮', dataIndex: 'drivenGearNo', width: 150, render: (v: string) => <span className="font-mono text-xs">{v}</span> },
    { title: '侧隙(mm)', dataIndex: 'backlash', align: 'center' as const, render: (v: number) => <Tag color={v >= 0.08 && v <= 0.18 ? 'green' : 'orange'}>{v.toFixed(3)}</Tag> },
    { title: '接触斑点', dataIndex: 'contactPattern', width: 180, ellipsis: true },
    { title: '噪声(dB)', dataIndex: 'noiseDb', align: 'center' as const, render: (v: number) => <span className={v > 72 ? 'text-red-500' : 'text-green-600'}><strong>{v}</strong></span> },
    { title: '判定', dataIndex: 'result', align: 'center' as const, render: (s: string) => <StatusTag status={s} /> },
    { title: '质检员', dataIndex: 'inspector' },
    { title: '检验时间', dataIndex: 'recordTime' },
  ];

  const summaryStatusColor = (s?: string) => {
    if (s === 'error') return '#F53F3F';
    if (s === 'warning') return '#FF7D00';
    return '#4E5969';
  };

  return (
    <div className="workorder-detail-page">
      <div className="mb-6">
        <Space className="mb-4">
          <Button icon={<ArrowLeft size={14} />} onClick={() => navigate('/workorders')}>
            返回工单列表
          </Button>
        </Space>

        <Card
          className="mb-6"
          style={{ borderRadius: 8 }}
          title={
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #165DFF, #4080FF)' }}>
                <Box size={18} className="text-white" />
              </div>
              <div>
                <div className="font-bold text-lg">
                  <span className="font-mono text-blue-600 text-sm mr-3">{workOrder.orderNo}</span>
                  {workOrder.productName}
                </div>
                <div className="text-gray-500 text-sm mt-0.5">
                  型号: {workOrder.gearModel} · 数量: {workOrder.quantity}件
                </div>
              </div>
            </div>
          }
          extra={<StatusTag status={workOrder.status} />}
        >
          <Row gutter={[24, 16]}>
            <Col xs={24} lg={8}>
              <Descriptions size="small" column={1} bordered>
                <Descriptions.Item label="创建时间">{workOrder.createTime}</Descriptions.Item>
                <Descriptions.Item label="更新时间">{workOrder.updateTime}</Descriptions.Item>
                <Descriptions.Item label="工单号"><span className="font-mono">{workOrder.orderNo}</span></Descriptions.Item>
              </Descriptions>
            </Col>
            <Col xs={24} lg={16}>
              <div className="text-sm text-gray-600 mb-3 font-medium">工序进度 ({completedCount}/7)</div>
              <Steps
                size="small"
                current={currentStepIndex}
                status={workOrder.status === 'rejected' ? 'error' : workOrder.status === 'completed' ? 'finish' : 'process'}
                items={processOrder.map((key) => ({
                  title: processNames[key],
                  icon: (() => {
                    const Icon = processIcons[key];
                    return <Icon size={14} />;
                  })(),
                }))}
              />
            </Col>
          </Row>
        </Card>

        <Card
          className="mb-6"
          style={{ borderRadius: 8 }}
          title={
            <div className="flex items-center gap-2">
              <Clock size={18} className="text-blue-500" />
              <span className="font-semibold">质量追溯时间轴</span>
              <Tag color="blue">全流程关键参数串联</Tag>
            </div>
          }
        >
          <Timeline
            mode="left"
            items={timelineNodes.map((node) => {
              const IconComp = processIcons[node.process];
              const hasAnomaly = node.summaryItems.some((s) => s.status === 'error' || s.status === 'warning');
              const isQualified = node.result === 'qualified';
              const isUnqualified = node.result === 'unqualified';

              return {
                dot: (
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center border-2"
                    style={{
                      background: node.done
                        ? isUnqualified
                          ? '#FEECEC'
                          : '#E8FFEA'
                        : '#F7F8FA',
                      borderColor: node.done
                        ? isUnqualified
                          ? '#F53F3F'
                          : hasAnomaly
                          ? '#FF7D00'
                          : node.color
                        : '#E5E6EB',
                      color: node.done ? node.color : '#C9CDD4',
                    }}
                  >
                    {node.done ? (
                      isUnqualified ? (
                        <AlertTriangle size={16} className="text-red-500" />
                      ) : hasAnomaly ? (
                        <AlertTriangle size={16} className="text-orange-500" />
                      ) : (
                        <CheckCircle2 size={16} style={{ color: node.color }} />
                      )
                    ) : (
                      <IconComp size={16} />
                    )}
                  </div>
                ),
                color: node.done ? (isUnqualified ? 'red' : hasAnomaly ? 'orange' : 'green') : 'gray',
                children: (
                  <div
                    className="pb-4"
                    style={{ borderLeft: node.done ? `3px solid ${isUnqualified ? '#F53F3F' : hasAnomaly ? '#FF7D00' : node.color}20` : 'none', paddingLeft: node.done ? 16 : 0, marginLeft: -4 }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-semibold text-gray-800">{node.label}</span>
                      {node.done ? (
                        isQualified ? (
                          <Tag color="green">合格</Tag>
                        ) : isUnqualified ? (
                          <Tag color="red">不合格</Tag>
                        ) : hasAnomaly ? (
                          <Tag color="orange">有异常</Tag>
                        ) : (
                          <Tag color="blue">已完成</Tag>
                        )
                      ) : (
                        <Tag>待处理</Tag>
                      )}
                      {node.alerts.length > 0 && (
                        <Badge count={node.alerts.length} size="small" style={{ backgroundColor: node.alerts.some((a) => a.status === 'pending') ? '#F53F3F' : '#FF7D00' }} />
                      )}
                      {node.time && <span className="text-xs text-gray-400 ml-auto">{node.time}</span>}
                    </div>

                    {node.done && node.records.length > 0 && (
                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-2">
                          {node.summaryItems.map((item, idx) => (
                            <div key={idx} className="text-sm">
                              <span className="text-gray-500 text-xs">{item.label}：</span>
                              <span
                                className="font-medium"
                                style={{ color: summaryStatusColor(item.status) }}
                              >
                                {item.value}
                              </span>
                              {item.status === 'error' && (
                                <AlertTriangle size={12} className="inline ml-1 text-red-500" />
                              )}
                              {item.status === 'warning' && (
                                <AlertTriangle size={12} className="inline ml-1 text-orange-400" />
                              )}
                            </div>
                          ))}
                        </div>
                        {node.operator && (
                          <div className="text-xs text-gray-400 mt-2 pt-2 border-t border-gray-200">
                            操作员：{node.operator}
                          </div>
                        )}
                      </div>
                    )}

                    {node.alerts.length > 0 && (
                      <div className="mt-3 bg-orange-50 border border-orange-200 rounded-lg p-3">
                        <div className="text-xs text-orange-700 font-medium mb-2 flex items-center gap-1">
                          <AlertTriangle size={14} />
                          关联异常 ({node.alerts.length}条)
                        </div>
                        <div className="space-y-1">
                          {node.alerts.slice(0, 3).map((alert: any) => (
                            <div
                              key={alert.id}
                              className="text-xs cursor-pointer hover:text-orange-600 transition-colors flex items-center justify-between"
                              onClick={() => navigate(`/quality-alerts?alertId=${alert.id}`)}
                            >
                              <span className="truncate flex-1">
                                <Tag color={alert.status === 'pending' ? 'red' : alert.status === 'processing' ? 'orange' : 'green'} style={{ padding: '0 6px', marginRight: 6, marginBottom: 0 }}>
                                  {alert.status === 'pending' ? '待处理' : alert.status === 'processing' ? '处理中' : '已关闭'}
                                </Tag>
                                {alert.message}
                              </span>
                              {alert.recheckResult && (
                                <span className={alert.recheckResult === 'passed' ? 'text-green-600 ml-2' : 'text-red-500 ml-2'}>
                                  复检{alert.recheckResult === 'passed' ? '通过' : '未过'}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                        {node.alerts.length > 0 && (
                          <a
                            className="text-xs text-blue-500 mt-2 inline-block hover:underline"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/quality-alerts?workOrderId=${id}&process=${node.process}`);
                            }}
                          >
                            查看全部异常 →
                          </a>
                        )}
                      </div>
                    )}

                    {node.done && node.records.length > 1 && (
                      <Collapse
                        ghost
                        size="small"
                        items={[{
                          key: 'more',
                          label: <span className="text-xs text-blue-500">查看全部 {node.records.length} 条记录</span>,
                          children: <span className="text-xs text-gray-500">共 {node.records.length} 条{node.label}记录，请查看下方详细表格</span>,
                        }]}
                      />
                    )}
                  </div>
                ),
              };
            })}
          />
        </Card>

        <Divider orientation="left" className="!my-4">
          <span className="font-semibold text-gray-700 px-2">各工序记录详情</span>
        </Divider>

        {renderRecordSection('blank', '齿坯外圆车削', records.blank, blankColumns)}
        {renderRecordSection('hobbing', '滚齿/插齿/键槽', records.hobbing, hobbingColumns)}
        {renderRecordSection('shaving', '剃齿余量控制', records.shaving, shavingColumns)}
        {renderRecordSection('carburizing', '渗碳淬火/硬度检测', records.carburizing, carburizingColumns)}
        {renderRecordSection('grinding', '磨齿/砂轮修整', records.grinding, grindingColumns)}
        {renderRecordSection('inspection', '齿形四项检测', records.inspection, inspectionColumns)}
        {renderRecordSection('matching', '配对啮合/噪声检验', records.matching, matchingColumns)}
      </div>
    </div>
  );
};

export default WorkOrderDetail;
