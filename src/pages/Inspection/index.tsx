import { useState } from 'react';
import { Table, Modal, Form, InputNumber, Select, message, Row, Col, Descriptions, Tag, Divider, Space, Card } from 'antd';
import { FileCheck, Eye, Activity, Ruler, CircleDashed, Gauge } from 'lucide-react';
import ReactECharts from 'echarts-for-react';
import { useGearStore } from '@/store';
import { PageHeader, StatusTag } from '@/components/common/PageComponents';

const InspectionPage: React.FC = () => {
  const { inspectionRecords, workOrders, addInspectionRecord, getWorkOrderById } = useGearStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [detailModal, setDetailModal] = useState(false);
  const [currentRecord, setCurrentRecord] = useState<any>(null);
  const [form] = Form.useForm();

  const handleSubmit = () => {
    form.validateFields().then((values) => {
      addInspectionRecord(values);
      message.success('齿形检测记录添加成功');
      setIsModalOpen(false);
      form.resetFields();
    });
  };

  const viewDetail = (record: any) => {
    setCurrentRecord(record);
    setDetailModal(true);
  };

  const columns = [
    {
      title: '关联工单',
      dataIndex: 'workOrderId',
      width: 150,
      render: (id: string) => {
        const wo = getWorkOrderById(id);
        return wo ? <span className="text-blue-600 font-mono text-xs">{wo.orderNo}</span> : '-';
      },
    },
    { title: '产品名称', dataIndex: 'workOrderId', width: 140, render: (id: string) => getWorkOrderById(id)?.productName || '-' },
    { title: '齿形总偏差 Fa (μm)', dataIndex: 'faTotal', width: 140, align: 'center' as const, render: (v: number) => <span className="font-mono">{(v * 1000).toFixed(1)}</span> },
    { title: '齿向总偏差 Fβ (μm)', dataIndex: 'fbTotal', width: 140, align: 'center' as const, render: (v: number) => <span className="font-mono">{(v * 1000).toFixed(1)}</span> },
    {
      title: '公法线 (mm)',
      dataIndex: 'commonNormal',
      width: 130,
      align: 'center' as const,
      render: (v: number, r: any) => (
        <div>
          <span className="font-mono">{v.toFixed(3)}</span>
          <div className="text-xs text-gray-400">跨{Math.round(r.spanToothCount)}齿 变动量:{(r.commonNormalVariation * 1000).toFixed(0)}μm</div>
        </div>
      ),
    },
    { title: '径向跳动 Fr (μm)', dataIndex: 'radialRunout', width: 120, align: 'center' as const, render: (v: number) => <span className="font-mono">{(v * 1000).toFixed(1)}</span> },
    {
      title: '粗糙度',
      width: 120,
      align: 'center' as const,
      render: (_: any, r: any) => (
        <div className="text-xs">
          <div>Ra <span className="font-semibold">{r.roughnessRa}</span> μm</div>
          <div className="text-gray-400">Rz {r.roughnessRz} μm</div>
        </div>
      ),
    },
    { title: '结果', dataIndex: 'result', width: 80, align: 'center' as const, render: (s: string) => <StatusTag status={s} /> },
    {
      title: '操作',
      key: 'action',
      width: 100,
      render: (_: any, record: any) => (
        <a onClick={() => viewDetail(record)} className="flex items-center gap-1 text-blue-500">
          <Eye size={14} /> 详情
        </a>
      ),
    },
  ];

  const toothProfileOption = {
    tooltip: { trigger: 'axis' },
    grid: { left: 60, right: 30, top: 40, bottom: 40 },
    xAxis: { type: 'category', data: inspectionRecords.map((r, i) => `#${i + 1}`), axisLabel: { color: '#86909C' } },
    yAxis: { type: 'value', name: 'μm', axisLabel: { color: '#86909C' }, splitLine: { lineStyle: { color: '#F2F3F5' } } },
    legend: { data: ['Fa', 'Fα斜率', 'Fβ', 'Fβ斜率'], right: 0, top: 0 },
    series: [
      {
        name: 'Fa',
        type: 'bar',
        data: inspectionRecords.map((r) => (r.faTotal * 1000).toFixed(1)),
        itemStyle: { color: '#165DFF', borderRadius: [4, 4, 0, 0] },
      },
      {
        name: 'Fα斜率',
        type: 'bar',
        data: inspectionRecords.map((r) => (r.faSlope * 1000).toFixed(1)),
        itemStyle: { color: '#4080FF', borderRadius: [4, 4, 0, 0] },
      },
      {
        name: 'Fβ',
        type: 'bar',
        data: inspectionRecords.map((r) => (r.fbTotal * 1000).toFixed(1)),
        itemStyle: { color: '#00B42A', borderRadius: [4, 4, 0, 0] },
      },
      {
        name: 'Fβ斜率',
        type: 'bar',
        data: inspectionRecords.map((r) => (r.fbSlope * 1000).toFixed(1)),
        itemStyle: { color: '#7CB305', borderRadius: [4, 4, 0, 0] },
      },
    ],
  };

  const radarOption = {
    tooltip: {},
    radar: {
      indicator: [
        { name: 'Fa', max: 25 },
        { name: 'Fα斜率', max: 15 },
        { name: 'Fβ', max: 30 },
        { name: 'Fβ斜率', max: 20 },
        { name: 'Fr径向', max: 70 },
        { name: '公法线变动', max: 25 },
      ],
      axisName: { color: '#4E5969', fontSize: 11 },
      splitArea: { areaStyle: { color: ['rgba(22,93,255,0.02)', 'rgba(22,93,255,0.05)'] } },
    },
    series: [{
      type: 'radar',
      data: [
        {
          value: inspectionRecords[0]
            ? [
                (inspectionRecords[0].faTotal * 1000),
                (inspectionRecords[0].faSlope * 1000),
                (inspectionRecords[0].fbTotal * 1000),
                (inspectionRecords[0].fbSlope * 1000),
                (inspectionRecords[0].radialRunout * 1000),
                (inspectionRecords[0].commonNormalVariation * 1000),
              ]
            : [0, 0, 0, 0, 0, 0],
          name: inspectionRecords[0] ? getWorkOrderById(inspectionRecords[0].workOrderId)?.orderNo : '示例',
          lineStyle: { color: '#165DFF', width: 2 },
          itemStyle: { color: '#165DFF' },
          areaStyle: { color: 'rgba(22,93,255,0.2)' },
        },
      ],
    }],
  };

  const runoutOption = {
    tooltip: { trigger: 'axis' },
    grid: { left: 60, right: 30, top: 30, bottom: 40 },
    xAxis: {
      type: 'category',
      data: ['测点1', '测点2', '测点3', '测点4', '测点5', '测点6', '测点7', '测点8'],
      axisLabel: { color: '#86909C' },
    },
    yAxis: {
      type: 'value',
      name: 'μm',
      min: -40,
      max: 40,
      axisLabel: { color: '#86909C' },
      splitLine: { lineStyle: { color: '#F2F3F5' } },
    },
    series: [{
      type: 'line',
      smooth: true,
      symbol: 'circle',
      symbolSize: 8,
      data: [12, 25, -8, -28, -15, 8, 22, 5],
      lineStyle: { color: '#722ED1', width: 2 },
      itemStyle: { color: '#722ED1' },
      areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: 'rgba(114,46,209,0.2)' }, { offset: 1, color: 'rgba(114,46,209,0)' }] } },
      markLine: {
        silent: true,
        data: [
          { yAxis: 30, lineStyle: { color: '#F53F3F', type: 'dashed' }, label: { formatter: '+公差' } },
          { yAxis: -30, lineStyle: { color: '#F53F3F', type: 'dashed' }, label: { formatter: '-公差' } },
        ],
      },
    }],
  };

  return (
    <div className="inspection-page">
      <PageHeader
        title="齿形检测"
        description="齿形齿向、公法线、径向跳动与粗糙度全项检测"
        icon={<FileCheck size={22} />}
        onAdd={() => setIsModalOpen(true)}
        addText="新增检测记录"
      />

      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} lg={6}>
          <Card className="h-full" style={{ borderRadius: 8 }} bodyStyle={{ padding: 16 }}>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500">
                <Activity size={20} />
              </div>
              <div>
                <div className="text-xs text-gray-500">齿形检测</div>
                <div className="font-bold text-lg text-blue-600">{inspectionRecords.filter((r) => r.result === 'qualified').length}/{inspectionRecords.length}</div>
              </div>
            </div>
            <div className="text-xs text-gray-400">合格率 {inspectionRecords.length ? Math.round(inspectionRecords.filter((r) => r.result === 'qualified').length / inspectionRecords.length * 100) : 0}%</div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="h-full" style={{ borderRadius: 8 }} bodyStyle={{ padding: 16 }}>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-cyan-50 flex items-center justify-center text-cyan-500">
                <Ruler size={20} />
              </div>
              <div>
                <div className="text-xs text-gray-500">平均Fa</div>
                <div className="font-bold text-lg text-cyan-600">
                  {inspectionRecords.length ? (inspectionRecords.reduce((s, r) => s + r.faTotal, 0) / inspectionRecords.length * 1000).toFixed(1) : '0'}
                </div>
              </div>
            </div>
            <div className="text-xs text-gray-400">μm / 目标≤20μm</div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="h-full" style={{ borderRadius: 8 }} bodyStyle={{ padding: 16 }}>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center text-purple-500">
                <CircleDashed size={20} />
              </div>
              <div>
                <div className="text-xs text-gray-500">平均Fr跳动</div>
                <div className="font-bold text-lg text-purple-600">
                  {inspectionRecords.length ? (inspectionRecords.reduce((s, r) => s + r.radialRunout, 0) / inspectionRecords.length * 1000).toFixed(1) : '0'}
                </div>
              </div>
            </div>
            <div className="text-xs text-gray-400">μm / 目标≤50μm</div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="h-full" style={{ borderRadius: 8 }} bodyStyle={{ padding: 16 }}>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center text-green-500">
                <Gauge size={20} />
              </div>
              <div>
                <div className="text-xs text-gray-500">平均Ra</div>
                <div className="font-bold text-lg text-green-600">
                  {inspectionRecords.length ? (inspectionRecords.reduce((s, r) => s + r.roughnessRa, 0) / inspectionRecords.length).toFixed(2) : '0'}
                </div>
              </div>
            </div>
            <div className="text-xs text-gray-400">μm / 目标≤0.8μm</div>
          </Card>
        </Col>
      </Row>

      <Row gutter={16} className="mb-6">
        <Col xs={24} lg={12}>
          <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <span className="font-semibold text-gray-800">齿形/齿向偏差对比</span>
              <Tag color="blue">全项检测</Tag>
            </div>
            <ReactECharts option={toothProfileOption} style={{ height: 260 }} />
          </div>
        </Col>
        <Col xs={24} lg={12}>
          <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <span className="font-semibold text-gray-800">检测参数雷达图</span>
              <Tag color="purple">综合评估</Tag>
            </div>
            <ReactECharts option={radarOption} style={{ height: 260 }} />
          </div>
        </Col>
      </Row>

      <Row gutter={16} className="mb-6">
        <Col xs={24}>
          <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <span className="font-semibold text-gray-800">齿圈径向跳动曲线 (示例)</span>
              <Tag color="purple">8点测量法</Tag>
            </div>
            <ReactECharts option={runoutOption} style={{ height: 240 }} />
          </div>
        </Col>
      </Row>

      <div className="bg-white rounded-lg shadow-sm border border-gray-100">
        <div className="px-5 py-4 border-b border-gray-100">
          <span className="font-semibold text-gray-800">检测记录列表</span>
        </div>
        <Table
          columns={columns}
          dataSource={inspectionRecords}
          rowKey="id"
          pagination={{ pageSize: 8, showSizeChanger: true, showTotal: (t) => `共 ${t} 条记录` }}
          scroll={{ x: 1400 }}
        />
      </div>

      <Modal
        title={<span className="font-semibold">新增齿形检测记录</span>}
        open={isModalOpen}
        onOk={handleSubmit}
        onCancel={() => setIsModalOpen(false)}
        okText="提交"
        cancelText="取消"
        width={720}
      >
        <Form form={form} layout="vertical">
          <Divider orientation="left" className="!my-3"><span className="text-xs text-gray-500">基本信息</span></Divider>
          <Row gutter={16}>
            <Col span={16}>
              <Form.Item name="workOrderId" label="关联工单" rules={[{ required: true }]}>
                <Select
                  options={workOrders.filter((wo) => wo.processProgress.grinding && !wo.processProgress.inspection).map((wo) => ({
                    label: `${wo.orderNo} - ${wo.productName}`,
                    value: wo.id,
                  }))}
                  placeholder="选择已完成磨齿的工单"
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="inspector" label="质检员" rules={[{ required: true }]}>
                <Select options={['质检员-陈工', '质检员-王工', '质检员-李工'].map((v) => ({ label: v, value: v }))} />
              </Form.Item>
            </Col>
          </Row>

          <Divider orientation="left" className="!my-3"><span className="text-xs text-gray-500">齿形检测 (单位: mm)</span></Divider>
          <Row gutter={16}>
            <Col span={6}>
              <Form.Item name="faTotal" label="齿形总偏差 Fa" rules={[{ required: true }]}>
                <InputNumber step={0.001} precision={4} className="!w-full" placeholder="如 0.008" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="faSlope" label="齿形斜率偏差" rules={[{ required: true }]}>
                <InputNumber step={0.001} precision={4} className="!w-full" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="fbTotal" label="齿向总偏差 Fβ" rules={[{ required: true }]}>
                <InputNumber step={0.001} precision={4} className="!w-full" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="fbSlope" label="齿向斜率偏差" rules={[{ required: true }]}>
                <InputNumber step={0.001} precision={4} className="!w-full" />
              </Form.Item>
            </Col>
          </Row>

          <Divider orientation="left" className="!my-3"><span className="text-xs text-gray-500">公法线 & 径向跳动 (单位: mm)</span></Divider>
          <Row gutter={16}>
            <Col span={6}>
              <Form.Item name="spanToothCount" label="跨齿数" rules={[{ required: true }]}>
                <InputNumber min={2} className="!w-full" placeholder="如 4" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="commonNormal" label="公法线长度 Wk" rules={[{ required: true }]}>
                <InputNumber step={0.001} precision={3} className="!w-full" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="commonNormalVariation" label="公法线变动量" rules={[{ required: true }]}>
                <InputNumber step={0.001} precision={4} className="!w-full" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="radialRunout" label="径向跳动 Fr" rules={[{ required: true }]}>
                <InputNumber step={0.001} precision={4} className="!w-full" />
              </Form.Item>
            </Col>
          </Row>

          <Divider orientation="left" className="!my-3"><span className="text-xs text-gray-500">齿面粗糙度 (单位: μm)</span></Divider>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="roughnessRa" label="粗糙度 Ra" rules={[{ required: true }]}>
                <Select
                  options={[0.2, 0.4, 0.8, 1.6, 3.2].map((v) => ({ label: `Ra ${v}`, value: v }))}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="roughnessRz" label="粗糙度 Rz" rules={[{ required: true }]}>
                <Select
                  options={[1.6, 2.5, 3.2, 4.2, 6.3, 10.0].map((v) => ({ label: `Rz ${v}`, value: v }))}
                />
              </Form.Item>
            </Col>
          </Row>

          <Divider orientation="left" className="!my-3"><span className="text-xs text-gray-500">检测判定</span></Divider>
          <Form.Item name="result" label="综合判定" rules={[{ required: true }]}>
            <Select
              options={[
                { label: '合格', value: 'qualified' },
                { label: '不合格', value: 'unqualified' },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={<span className="font-semibold">齿形检测报告详情</span>}
        open={detailModal}
        onCancel={() => setDetailModal(false)}
        footer={null}
        width={720}
      >
        {currentRecord && (() => {
          const wo = getWorkOrderById(currentRecord.workOrderId);
          return (
            <Descriptions bordered column={3} size="small">
              <Descriptions.Item label="关联工单" span={3}><span className="text-blue-600 font-mono">{wo?.orderNo}</span> - {wo?.productName} ({wo?.gearModel})</Descriptions.Item>
              <Descriptions.Item label="齿形总偏差 Fa"><span className="font-mono">{(currentRecord.faTotal * 1000).toFixed(1)} μm</span></Descriptions.Item>
              <Descriptions.Item label="齿形斜率"><span className="font-mono">{(currentRecord.faSlope * 1000).toFixed(1)} μm</span></Descriptions.Item>
              <Descriptions.Item label="齿向总偏差 Fβ"><span className="font-mono">{(currentRecord.fbTotal * 1000).toFixed(1)} μm</span></Descriptions.Item>
              <Descriptions.Item label="齿向斜率"><span className="font-mono">{(currentRecord.fbSlope * 1000).toFixed(1)} μm</span></Descriptions.Item>
              <Descriptions.Item label="跨齿数">{Math.round(currentRecord.spanToothCount)} 齿</Descriptions.Item>
              <Descriptions.Item label="公法线 Wk"><span className="font-mono">{currentRecord.commonNormal.toFixed(3)} mm</span></Descriptions.Item>
              <Descriptions.Item label="公法线变动"><span className="font-mono">{(currentRecord.commonNormalVariation * 1000).toFixed(0)} μm</span></Descriptions.Item>
              <Descriptions.Item label="径向跳动 Fr"><span className="font-mono">{(currentRecord.radialRunout * 1000).toFixed(1)} μm</span></Descriptions.Item>
              <Descriptions.Item label="粗糙度 Ra">Ra {currentRecord.roughnessRa} μm</Descriptions.Item>
              <Descriptions.Item label="粗糙度 Rz">Rz {currentRecord.roughnessRz} μm</Descriptions.Item>
              <Descriptions.Item label="综合判定">
                <StatusTag status={currentRecord.result} />
              </Descriptions.Item>
              <Descriptions.Item label="质检员">{currentRecord.inspector}</Descriptions.Item>
              <Descriptions.Item label="检测时间" span={2}>{currentRecord.recordTime}</Descriptions.Item>
            </Descriptions>
          );
        })()}
      </Modal>
    </div>
  );
};

export default InspectionPage;
