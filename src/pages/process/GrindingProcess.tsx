import { useState } from 'react';
import { Table, Modal, Form, Input, InputNumber, Select, message, Row, Col, Descriptions, Tag, Divider } from 'antd';
import { Sparkles, Eye } from 'lucide-react';
import ReactECharts from 'echarts-for-react';
import { useGearStore } from '@/store';
import { PageHeader, StatusTag } from '@/components/common/PageComponents';
import { validateGrinding } from '@/utils';

const GrindingProcess: React.FC = () => {
  const { grindingRecords, workOrders, addGrindingRecord, getWorkOrderById } = useGearStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [detailModal, setDetailModal] = useState(false);
  const [currentRecord, setCurrentRecord] = useState<any>(null);
  const [form] = Form.useForm();

  const handleSubmit = () => {
    form.validateFields().then((values) => {
      const validation = validateGrinding({ grindingAccuracy: values.grindingAccuracy });
      addGrindingRecord(values);
      message.success('磨齿精加工记录添加成功');
      if (validation.warnings.length > 0) {
        validation.warnings.forEach((w) => {
          message.warning({ content: w.message, duration: 5 });
        });
      }
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
    { title: '产品名称', dataIndex: 'workOrderId', render: (id: string) => getWorkOrderById(id)?.productName || '-' },
    {
      title: '砂轮型号',
      dataIndex: 'wheelModel',
      width: 110,
      render: (v: string) => <Tag color="geekblue">{v}</Tag>,
    },
    { title: '修整进给 (mm/行程)', dataIndex: 'dressingFeed', width: 140, align: 'center' as const, render: (v: number) => <span className="font-mono">{v.toFixed(3)}</span> },
    { title: '修整次数', dataIndex: 'dressingPass', width: 90, align: 'center' as const, render: (v: number) => `${v} 次` },
    { title: '修整深度 (mm)', dataIndex: 'dressingDepth', width: 110, align: 'center' as const, render: (v: number) => <span className="font-mono">{v.toFixed(3)}</span> },
    {
      title: '加工精度等级',
      dataIndex: 'grindingAccuracy',
      width: 120,
      align: 'center' as const,
      render: (v: number) => <Tag color={v <= 5 ? 'green' : v <= 6 ? 'blue' : 'orange'}>{v} 级</Tag>,
    },
    { title: '操作员', dataIndex: 'operator', width: 100 },
    { title: '记录时间', dataIndex: 'recordTime', width: 170 },
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

  const wheelDressingOption = {
    tooltip: { trigger: 'axis' },
    legend: { data: ['修整深度', '修整进给'], right: 0, top: 0 },
    grid: { left: 60, right: 30, top: 40, bottom: 30 },
    xAxis: { type: 'category', data: grindingRecords.map((r, i) => `#${i + 1} ${r.wheelModel}`), axisLabel: { color: '#86909C', rotate: 30 } },
    yAxis: { type: 'value', name: 'mm', axisLabel: { color: '#86909C' }, splitLine: { lineStyle: { color: '#F2F3F5' } } },
    series: [
      {
        name: '修整深度',
        type: 'bar',
        data: grindingRecords.map((r) => r.dressingDepth),
        itemStyle: { color: '#FF7D00', borderRadius: [4, 4, 0, 0] },
      },
      {
        name: '修整进给',
        type: 'bar',
        data: grindingRecords.map((r) => r.dressingFeed),
        itemStyle: { color: '#FFC53D', borderRadius: [4, 4, 0, 0] },
      },
    ],
  };

  const accuracyOption = {
    tooltip: { trigger: 'axis' },
    grid: { left: 60, right: 30, top: 40, bottom: 30 },
    xAxis: { type: 'category', data: grindingRecords.map((_, i) => `#${i + 1}`), axisLabel: { color: '#86909C' } },
    yAxis: {
      type: 'value',
      name: '精度等级',
      inverse: true,
      min: 3,
      max: 8,
      axisLabel: { color: '#86909C' },
      splitLine: { lineStyle: { color: '#F2F3F5' } },
    },
    series: [{
      data: grindingRecords.map((r) => ({
        value: r.grindingAccuracy,
        itemStyle: { color: r.grindingAccuracy <= 5 ? '#00B42A' : r.grindingAccuracy <= 6 ? '#165DFF' : '#FF7D00' },
      })),
      type: 'line',
      smooth: true,
      symbol: 'circle',
      symbolSize: 12,
      lineStyle: { color: '#165DFF', width: 2 },
      markArea: {
        silent: true,
        itemStyle: { color: 'rgba(0, 180, 42, 0.1)' },
        data: [[{ yAxis: 3 }, { yAxis: 5 }]],
      },
      label: { show: true, formatter: '{c}级', position: 'top' },
    }],
  };

  return (
    <div className="grinding-process-page">
      <PageHeader
        title="磨齿精加工"
        description="磨齿砂轮修整工艺与高精度齿面加工"
        icon={<Sparkles size={22} />}
        onAdd={() => setIsModalOpen(true)}
        addText="新增磨齿记录"
      />

      <Row gutter={16} className="mb-6">
        <Col xs={24} lg={12}>
          <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <span className="font-semibold text-gray-800">砂轮修整参数</span>
              <Tag color="orange">深度/进给对比</Tag>
            </div>
            <ReactECharts option={wheelDressingOption} style={{ height: 260 }} />
          </div>
        </Col>
        <Col xs={24} lg={12}>
          <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <span className="font-semibold text-gray-800">加工精度等级趋势</span>
              <Tag color="green">绿色区域为高精度区 ≤5级</Tag>
            </div>
            <ReactECharts option={accuracyOption} style={{ height: 260 }} />
          </div>
        </Col>
      </Row>

      <div className="bg-white rounded-lg shadow-sm border border-gray-100">
        <div className="px-5 py-4 border-b border-gray-100">
          <span className="font-semibold text-gray-800">磨齿精加工记录列表</span>
        </div>
        <Table
          columns={columns}
          dataSource={grindingRecords}
          rowKey="id"
          pagination={{ pageSize: 8, showSizeChanger: true, showTotal: (t) => `共 ${t} 条记录` }}
          scroll={{ x: 1300 }}
        />
      </div>

      <Modal
        title={<span className="font-semibold">新增磨齿精加工记录</span>}
        open={isModalOpen}
        onOk={handleSubmit}
        onCancel={() => setIsModalOpen(false)}
        okText="提交"
        cancelText="取消"
        width={640}
      >
        <Form form={form} layout="vertical">
          <Divider orientation="left" className="!my-3"><span className="text-xs text-gray-500">基本信息</span></Divider>
          <Form.Item name="workOrderId" label="关联工单" rules={[{ required: true }]}>
            <Select
              options={workOrders.filter((wo) => wo.processProgress.carburizing && !wo.processProgress.grinding).map((wo) => ({
                label: `${wo.orderNo} - ${wo.productName}`,
                value: wo.id,
              }))}
              placeholder="选择已完成渗碳的工单"
            />
          </Form.Item>

          <Divider orientation="left" className="!my-3"><span className="text-xs text-gray-500">砂轮参数</span></Divider>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="wheelModel" label="砂轮型号" rules={[{ required: true }]}>
                <Select
                  options={['SG60KV', 'SG80JV', 'SG100JV', 'WA60KV', 'GC80KV'].map((v) => ({ label: v, value: v }))}
                  placeholder="请选择砂轮型号"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="grindingAccuracy" label="目标精度等级" rules={[{ required: true }]} initialValue={5}>
                <Select
                  options={[3, 4, 5, 6, 7].map((v) => ({ label: `${v} 级 - ${v <= 4 ? '超高精' : v <= 5 ? '高精度' : '普通精'}`, value: v }))}
                />
              </Form.Item>
            </Col>
          </Row>

          <Divider orientation="left" className="!my-3"><span className="text-xs text-gray-500">砂轮修整工艺</span></Divider>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="dressingFeed" label="修整进给 (mm/行程)" rules={[{ required: true }]} initialValue={0.002}>
                <InputNumber step={0.001} precision={3} className="!w-full" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="dressingPass" label="修整次数" rules={[{ required: true }]} initialValue={2}>
                <InputNumber min={1} max={10} className="!w-full" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="dressingDepth" label="修整总深度 (mm)" rules={[{ required: true }]} initialValue={0.015}>
                <InputNumber step={0.005} precision={3} className="!w-full" />
              </Form.Item>
            </Col>
          </Row>

          <Divider orientation="left" className="!my-3"><span className="text-xs text-gray-500">人员信息</span></Divider>
          <Form.Item name="operator" label="操作员" rules={[{ required: true }]}>
            <Select options={['吴建明', '郑光华', '王师傅'].map((v) => ({ label: v, value: v }))} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={<span className="font-semibold">磨齿精加工记录详情</span>}
        open={detailModal}
        onCancel={() => setDetailModal(false)}
        footer={null}
        width={600}
      >
        {currentRecord && (() => {
          const wo = getWorkOrderById(currentRecord.workOrderId);
          return (
            <Descriptions bordered column={2} size="small">
              <Descriptions.Item label="关联工单"><span className="text-blue-600 font-mono">{wo?.orderNo}</span></Descriptions.Item>
              <Descriptions.Item label="产品名称">{wo?.productName}</Descriptions.Item>
              <Descriptions.Item label="齿轮型号">{wo?.gearModel}</Descriptions.Item>
              <Descriptions.Item label="精度等级">
                <Tag color={currentRecord.grindingAccuracy <= 5 ? 'green' : 'blue'}>{currentRecord.grindingAccuracy} 级</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="砂轮型号" span={2}><Tag color="geekblue">{currentRecord.wheelModel}</Tag></Descriptions.Item>
              <Descriptions.Item label="修整进给"><span className="font-mono">{currentRecord.dressingFeed.toFixed(3)} mm/行程</span></Descriptions.Item>
              <Descriptions.Item label="修整次数">{currentRecord.dressingPass} 次</Descriptions.Item>
              <Descriptions.Item label="修整总深度" span={2}><span className="font-mono">{currentRecord.dressingDepth.toFixed(3)} mm</span></Descriptions.Item>
              <Descriptions.Item label="操作员">{currentRecord.operator}</Descriptions.Item>
              <Descriptions.Item label="记录时间">{currentRecord.recordTime}</Descriptions.Item>
            </Descriptions>
          );
        })()}
      </Modal>
    </div>
  );
};

export default GrindingProcess;
