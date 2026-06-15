import { useParams, useNavigate } from 'react-router-dom';
import { Button, Card, Descriptions, Row, Col, Tag, Timeline, Empty, Divider, Steps, Table, Space } from 'antd';
import { ArrowLeft, CircleDot, Scissors, Flame, Sparkles, FileCheck, Puzzle, Box } from 'lucide-react';
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

const WorkOrderDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getWorkOrderById, getRecordsByWorkOrderId } = useGearStore();

  const workOrder = id ? getWorkOrderById(id) : undefined;
  const records = id ? getRecordsByWorkOrderId(id) : null;

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
    { title: '剃齿余量(mm)', dataIndex: 'allowance', align: 'center' as const, render: (v: number) => <Tag color="geekblue">{v.toFixed(3)}</Tag> },
    { title: '操作员', dataIndex: 'operator' },
    { title: '记录时间', dataIndex: 'recordTime' },
  ];

  const carburizingColumns = [
    { title: '温度(℃)', dataIndex: 'carburizingTemp', width: 90, align: 'center' as const, render: (v: number) => <span className="text-red-500 font-semibold">{v}</span> },
    { title: '保温时间(h)', dataIndex: 'holdingTime', align: 'center' as const },
    { title: '渗碳层深度(mm)', dataIndex: 'caseDepth', align: 'center' as const, render: (v: number) => v.toFixed(2) },
    { title: '表面硬度(HRC)', dataIndex: 'surfaceHardness', align: 'center' as const, render: (v: number) => v.toFixed(1) },
    { title: '心部硬度(HRC)', dataIndex: 'coreHardness', align: 'center' as const },
    { title: '操作员', dataIndex: 'operator' },
    { title: '记录时间', dataIndex: 'recordTime' },
  ];

  const grindingColumns = [
    { title: '砂轮型号', dataIndex: 'wheelModel', render: (v: string) => <Tag color="geekblue">{v}</Tag> },
    { title: '修整进给', dataIndex: 'dressingFeed', align: 'center' as const, render: (v: number) => `${v.toFixed(3)}mm` },
    { title: '修整次数', dataIndex: 'dressingPass', align: 'center' as const, render: (v: number) => `${v}次` },
    { title: '修整深度', dataIndex: 'dressingDepth', align: 'center' as const, render: (v: number) => `${v.toFixed(3)}mm` },
    { title: '精度等级', dataIndex: 'grindingAccuracy', align: 'center' as const, render: (v: number) => <Tag color={v <= 5 ? 'green' : 'blue'}>{v}级</Tag> },
    { title: '操作员', dataIndex: 'operator' },
    { title: '记录时间', dataIndex: 'recordTime' },
  ];

  const inspectionColumns = [
    { title: 'Fa(μm)', dataIndex: 'faTotal', align: 'center' as const, render: (v: number) => (v * 1000).toFixed(1) },
    { title: 'Fβ(μm)', dataIndex: 'fbTotal', align: 'center' as const, render: (v: number) => (v * 1000).toFixed(1) },
    { title: '公法线(mm)', dataIndex: 'commonNormal', align: 'center' as const, render: (v: number, r: any) => `${v.toFixed(3)} (跨${Math.round(r.spanToothCount)}齿)` },
    { title: '变动量(μm)', dataIndex: 'commonNormalVariation', align: 'center' as const, render: (v: number) => (v * 1000).toFixed(0) },
    { title: '径向跳动(μm)', dataIndex: 'radialRunout', align: 'center' as const, render: (v: number) => (v * 1000).toFixed(1) },
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
    { title: '噪声(dB)', dataIndex: 'noiseDb', align: 'center' as const, render: (v: number) => <span className={v <= 72 ? 'text-green-600' : 'text-red-500'}><strong>{v}</strong></span> },
    { title: '判定', dataIndex: 'result', align: 'center' as const, render: (s: string) => <StatusTag status={s} /> },
    { title: '质检员', dataIndex: 'inspector' },
    { title: '检验时间', dataIndex: 'recordTime' },
  ];

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
