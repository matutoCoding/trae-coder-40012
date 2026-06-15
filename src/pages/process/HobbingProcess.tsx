import { useState } from 'react';
import { Table, Modal, Form, Input, InputNumber, Select, Tabs, message, Row, Col, Descriptions, Tag, Divider } from 'antd';
import { CircleDot, Eye } from 'lucide-react';
import ReactECharts from 'echarts-for-react';
import { useGearStore } from '@/store';
import { PageHeader, StatusTag } from '@/components/common/PageComponents';

const HobbingProcess: React.FC = () => {
  const { hobbingRecords, workOrders, addHobbingRecord, getWorkOrderById } = useGearStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [detailModal, setDetailModal] = useState(false);
  const [currentRecord, setCurrentRecord] = useState<any>(null);
  const [currentProcessType, setCurrentProcessType] = useState<'滚齿' | '插齿' | '键槽'>('滚齿');
  const [form] = Form.useForm();

  const handleSubmit = () => {
    form.validateFields().then((values) => {
      addHobbingRecord(values);
      message.success(`${currentProcessType}记录添加成功`);
      setIsModalOpen(false);
      form.resetFields();
    });
  };

  const viewDetail = (record: any) => {
    setCurrentRecord(record);
    setDetailModal(true);
  };

  const hobbingRecordsList = hobbingRecords.filter((r) => r.processType === '滚齿');
  const slottingRecordsList = hobbingRecords.filter((r) => r.processType === '插齿');
  const keywayRecordsList = hobbingRecords.filter((r) => r.processType === '键槽');

  const baseColumns = [
    { title: '工序类型', dataIndex: 'processType', width: 80, render: (v: string) => <Tag color={v === '滚齿' ? 'blue' : v === '插齿' ? 'purple' : 'cyan'}>{v}</Tag> },
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
    { title: '模数', dataIndex: 'hobModule', width: 70, align: 'center' as const, render: (v: number) => v ? `M${v}` : '-' },
    { title: '压力角', dataIndex: 'pressureAngle', width: 80, align: 'center' as const, render: (v: number) => v ? `${v}°` : '-' },
    { title: '切削速度(m/min)', dataIndex: 'cuttingSpeed', width: 120, align: 'center' as const },
    { title: '进给量(mm/r)', dataIndex: 'feedRate', width: 110, align: 'center' as const },
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

  const hobbingColumns = [
    ...baseColumns,
    { title: '齿向误差(μm)', dataIndex: 'toothDirectionError', width: 110, align: 'center' as const, render: (v?: number) => v ? (v * 1000).toFixed(1) : '-' },
    { title: '齿距累积误差(μm)', dataIndex: 'pitchCumulativeError', width: 130, align: 'center' as const, render: (v?: number) => v ? (v * 1000).toFixed(1) : '-' },
  ];

  const keywayColumns = [
    baseColumns[0],
    baseColumns[1],
    baseColumns[2],
    { title: '键槽宽度(mm)', dataIndex: 'keywayWidth', width: 110, align: 'center' as const, render: (v?: number) => v?.toFixed(2) || '-' },
    { title: '键槽深度(mm)', dataIndex: 'keywayDepth', width: 110, align: 'center' as const, render: (v?: number) => v?.toFixed(2) || '-' },
    { title: '对称度(μm)', dataIndex: 'symmetry', width: 100, align: 'center' as const, render: (v?: number) => v ? (v * 1000).toFixed(1) : '-' },
    baseColumns[7],
    baseColumns[8],
    baseColumns[9],
  ];

  const errorChartOption = {
    tooltip: { trigger: 'axis' },
    legend: { data: ['齿向误差', '齿距累积误差'], right: 0, top: 0 },
    grid: { left: 60, right: 20, top: 40, bottom: 30 },
    xAxis: { type: 'category', data: hobbingRecordsList.map((_, i) => `#${i + 1}`), axisLabel: { color: '#86909C' } },
    yAxis: { type: 'value', name: 'μm', axisLabel: { color: '#86909C' }, splitLine: { lineStyle: { color: '#F2F3F5' } } },
    series: [
      {
        name: '齿向误差',
        type: 'bar',
        data: hobbingRecordsList.map((r) => (r.toothDirectionError || 0) * 1000),
        itemStyle: { color: '#165DFF', borderRadius: [4, 4, 0, 0] },
      },
      {
        name: '齿距累积误差',
        type: 'bar',
        data: hobbingRecordsList.map((r) => (r.pitchCumulativeError || 0) * 1000),
        itemStyle: { color: '#722ED1', borderRadius: [4, 4, 0, 0] },
      },
    ],
  };

  const renderForm = () => (
    <Form form={form} layout="vertical">
      <Divider orientation="left" className="!my-3"><span className="text-xs text-gray-500">基本信息</span></Divider>
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item name="workOrderId" label="关联工单" rules={[{ required: true }]}>
            <Select
              options={workOrders.map((wo) => ({ label: `${wo.orderNo} - ${wo.productName}`, value: wo.id }))}
              placeholder="请选择工单"
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="processType" label="工序类型" rules={[{ required: true }]} initialValue={currentProcessType}>
            <Select
              options={[
                { label: '滚齿', value: '滚齿' },
                { label: '插齿', value: '插齿' },
                { label: '键槽', value: '键槽' },
              ]}
              onChange={(v) => setCurrentProcessType(v)}
            />
          </Form.Item>
        </Col>
      </Row>

      {(currentProcessType === '滚齿' || currentProcessType === '插齿') && (
        <>
          <Divider orientation="left" className="!my-3"><span className="text-xs text-gray-500">刀具参数</span></Divider>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="hobModel" label="刀具型号">
                <Input placeholder={currentProcessType === '滚齿' ? '如 M4AA级' : '如 M5A级'} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="hobModule" label="模数" rules={[{ required: true }]}>
                <InputNumber step={0.5} className="!w-full" placeholder="如 4" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="pressureAngle" label="压力角 (°)" rules={[{ required: true }]} initialValue={20}>
                <InputNumber className="!w-full" placeholder="20" />
              </Form.Item>
            </Col>
            <Col span={12}></Col>
          </Row>

          <Divider orientation="left" className="!my-3"><span className="text-xs text-gray-500">切削参数</span></Divider>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="cuttingSpeed" label="切削速度 (m/min)" rules={[{ required: true }]}>
                <InputNumber step={5} className="!w-full" placeholder="如 85" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="feedRate" label="进给量 (mm/r)" rules={[{ required: true }]}>
                <InputNumber step={0.1} precision={2} className="!w-full" placeholder="如 1.2" />
              </Form.Item>
            </Col>
          </Row>

          <Divider orientation="left" className="!my-3"><span className="text-xs text-gray-500">检测参数</span></Divider>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="toothDirectionError" label="齿向误差 (mm)">
                <InputNumber step={0.001} precision={4} className="!w-full" placeholder="如 0.012" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="pitchCumulativeError" label="齿距累积误差 (mm)">
                <InputNumber step={0.001} precision={4} className="!w-full" placeholder="如 0.045" />
              </Form.Item>
            </Col>
          </Row>
        </>
      )}

      {currentProcessType === '键槽' && (
        <>
          <Divider orientation="left" className="!my-3"><span className="text-xs text-gray-500">键槽参数</span></Divider>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="hobModule" label="关联模数" rules={[{ required: true }]} initialValue={0}>
                <InputNumber step={0.5} className="!w-full" placeholder="如 5" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="pressureAngle" label="压力角参考" rules={[{ required: true }]} initialValue={0}>
                <InputNumber className="!w-full" placeholder="20" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="keywayWidth" label="键槽宽度 (mm)">
                <InputNumber step={0.01} precision={2} className="!w-full" placeholder="如 8.01" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="keywayDepth" label="键槽深度 (mm)">
                <InputNumber step={0.1} precision={1} className="!w-full" placeholder="如 36.5" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="symmetry" label="对称度 (mm)">
                <InputNumber step={0.001} precision={4} className="!w-full" placeholder="如 0.015" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="cuttingSpeed" label="切削速度" rules={[{ required: true }]} initialValue={0}>
                <InputNumber step={1} className="!w-full" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="feedRate" label="进给量" rules={[{ required: true }]} initialValue={0}>
                <InputNumber step={0.1} className="!w-full" />
              </Form.Item>
            </Col>
          </Row>
        </>
      )}

      <Divider orientation="left" className="!my-3"><span className="text-xs text-gray-500">人员信息</span></Divider>
      <Form.Item name="operator" label="操作员" rules={[{ required: true }]}>
        <Select options={['王海涛', '赵振华', '周国强'].map((v) => ({ label: v, value: v }))} />
      </Form.Item>
    </Form>
  );

  return (
    <div className="hobbing-process-page">
      <PageHeader
        title="滚齿插齿"
        description="滚齿加工、插齿加工与键槽加工参数记录"
        icon={<CircleDot size={22} />}
        onAdd={() => setIsModalOpen(true)}
        addText="新增加工记录"
      />

      <Row gutter={16} className="mb-6">
        <Col xs={24} lg={24}>
          <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <span className="font-semibold text-gray-800">滚齿误差分析</span>
              <Tag color="purple">全部滚齿记录</Tag>
            </div>
            <ReactECharts option={errorChartOption} style={{ height: 240 }} />
          </div>
        </Col>
      </Row>

      <div className="bg-white rounded-lg shadow-sm border border-gray-100">
        <Tabs
          defaultActiveKey="hobbing"
          size="large"
          style={{ padding: '0 24px' }}
          tabBarStyle={{ marginBottom: 0 }}
          items={[
            {
              key: 'hobbing',
              label: <span className="px-2">滚齿加工 ({hobbingRecordsList.length})</span>,
              children: (
                <Table
                  columns={hobbingColumns}
                  dataSource={hobbingRecordsList}
                  rowKey="id"
                  pagination={{ pageSize: 8, showSizeChanger: true, showTotal: (t) => `共 ${t} 条记录` }}
                  scroll={{ x: 1400 }}
                />
              ),
            },
            {
              key: 'slotting',
              label: <span className="px-2">插齿加工 ({slottingRecordsList.length})</span>,
              children: (
                <Table
                  columns={hobbingColumns}
                  dataSource={slottingRecordsList}
                  rowKey="id"
                  pagination={{ pageSize: 8, showSizeChanger: true, showTotal: (t) => `共 ${t} 条记录` }}
                  scroll={{ x: 1400 }}
                />
              ),
            },
            {
              key: 'keyway',
              label: <span className="px-2">键槽加工 ({keywayRecordsList.length})</span>,
              children: (
                <Table
                  columns={keywayColumns}
                  dataSource={keywayRecordsList}
                  rowKey="id"
                  pagination={{ pageSize: 8, showSizeChanger: true, showTotal: (t) => `共 ${t} 条记录` }}
                  scroll={{ x: 1400 }}
                />
              ),
            },
          ]}
        />
      </div>

      <Modal
        title={<span className="font-semibold">新增{currentProcessType}加工记录</span>}
        open={isModalOpen}
        onOk={handleSubmit}
        onCancel={() => setIsModalOpen(false)}
        okText="提交"
        cancelText="取消"
        width={700}
        destroyOnClose
      >
        {renderForm()}
      </Modal>

      <Modal
        title={<span className="font-semibold">加工记录详情</span>}
        open={detailModal}
        onCancel={() => setDetailModal(false)}
        footer={null}
        width={640}
      >
        {currentRecord && (() => {
          const wo = getWorkOrderById(currentRecord.workOrderId);
          return (
            <Descriptions bordered column={2} size="small">
              <Descriptions.Item label="工序类型"><Tag>{currentRecord.processType}</Tag></Descriptions.Item>
              <Descriptions.Item label="关联工单"><span className="text-blue-600 font-mono">{wo?.orderNo}</span></Descriptions.Item>
              <Descriptions.Item label="产品名称">{wo?.productName}</Descriptions.Item>
              <Descriptions.Item label="齿轮型号">{wo?.gearModel}</Descriptions.Item>
              {currentRecord.processType !== '键槽' && (
                <>
                  <Descriptions.Item label="刀具型号">{currentRecord.hobModel || '-'}</Descriptions.Item>
                  <Descriptions.Item label="模数">M{currentRecord.hobModule}</Descriptions.Item>
                  <Descriptions.Item label="压力角">{currentRecord.pressureAngle}°</Descriptions.Item>
                  <Descriptions.Item label="切削速度">{currentRecord.cuttingSpeed} m/min</Descriptions.Item>
                  <Descriptions.Item label="进给量">{currentRecord.feedRate} mm/r</Descriptions.Item>
                  {currentRecord.toothDirectionError !== undefined && (
                    <Descriptions.Item label="齿向误差">{(currentRecord.toothDirectionError * 1000).toFixed(1)} μm</Descriptions.Item>
                  )}
                  {currentRecord.pitchCumulativeError !== undefined && (
                    <Descriptions.Item label="齿距累积误差">{(currentRecord.pitchCumulativeError * 1000).toFixed(1)} μm</Descriptions.Item>
                  )}
                </>
              )}
              {currentRecord.processType === '键槽' && (
                <>
                  <Descriptions.Item label="键槽宽度">{currentRecord.keywayWidth?.toFixed(2)} mm</Descriptions.Item>
                  <Descriptions.Item label="键槽深度">{currentRecord.keywayDepth?.toFixed(1)} mm</Descriptions.Item>
                  <Descriptions.Item label="对称度">{currentRecord.symmetry ? (currentRecord.symmetry * 1000).toFixed(1) : '-'} μm</Descriptions.Item>
                </>
              )}
              <Descriptions.Item label="操作员">{currentRecord.operator}</Descriptions.Item>
              <Descriptions.Item label="记录时间">{currentRecord.recordTime}</Descriptions.Item>
            </Descriptions>
          );
        })()}
      </Modal>
    </div>
  );
};

export default HobbingProcess;
