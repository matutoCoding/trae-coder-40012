import { useState } from 'react';
import { Table, Modal, Form, InputNumber, Select, message, Row, Col, Descriptions, Tag, Divider } from 'antd';
import { Scissors, Eye, Calculator } from 'lucide-react';
import ReactECharts from 'echarts-for-react';
import { useGearStore } from '@/store';
import { PageHeader, StatusTag } from '@/components/common/PageComponents';
import { calculateAllowance, validateShaving } from '@/utils';

const ShavingProcess: React.FC = () => {
  const { shavingRecords, workOrders, addShavingRecord, getWorkOrderById } = useGearStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [detailModal, setDetailModal] = useState(false);
  const [currentRecord, setCurrentRecord] = useState<any>(null);
  const [form] = Form.useForm();
  const [preShaveValue, setPreShaveValue] = useState<number | null>(null);
  const [postShaveValue, setPostShaveValue] = useState<number | null>(null);

  const calculatedAllowance = preShaveValue !== null && postShaveValue !== null
    ? calculateAllowance(preShaveValue, postShaveValue)
    : null;

  const handleSubmit = () => {
    form.validateFields().then((values) => {
      const allowance = calculateAllowance(values.preShaveWk, values.postShaveWk);
      const validation = validateShaving({ allowance });
      addShavingRecord({ ...values, allowance });
      message.success('剃齿记录添加成功，剃齿余量：' + allowance.toFixed(3) + ' mm');
      if (validation.warnings.length > 0) {
        validation.warnings.forEach((w) => {
          message.warning({ content: w.message, duration: 5 });
        });
      }
      setIsModalOpen(false);
      form.resetFields();
      setPreShaveValue(null);
      setPostShaveValue(null);
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
    { title: '齿数', dataIndex: 'toothCount', width: 70, align: 'center' as const, render: (v: number) => `Z${v}` },
    {
      title: '剃前公法线 Wk (mm)',
      dataIndex: 'preShaveWk',
      width: 150,
      align: 'center' as const,
      render: (v: number) => <span className="text-gray-600">{v.toFixed(3)}</span>,
    },
    {
      title: '剃后公法线 Wk (mm)',
      dataIndex: 'postShaveWk',
      width: 150,
      align: 'center' as const,
      render: (v: number) => <span className="text-blue-600 font-semibold">{v.toFixed(3)}</span>,
    },
    {
      title: '剃齿余量 (mm)',
      dataIndex: 'allowance',
      width: 130,
      align: 'center' as const,
      render: (v: number) => {
        const isGood = v >= 0.1 && v <= 0.2;
        return (
          <Tag color={isGood ? 'green' : 'orange'}>
            <span className="font-mono">{v.toFixed(3)}</span>
          </Tag>
        );
      },
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

  const allowanceChartOption = {
    tooltip: { trigger: 'axis' },
    grid: { left: 60, right: 30, top: 30, bottom: 40 },
    xAxis: {
      type: 'category',
      data: shavingRecords.map((r, i) => `#${i + 1}`),
      axisLabel: { color: '#86909C' },
    },
    yAxis: {
      type: 'value',
      name: '剃齿余量mm',
      min: 0.05,
      max: 0.25,
      axisLabel: { color: '#86909C' },
      splitLine: { lineStyle: { color: '#F2F3F5' } },
    },
    series: [{
      data: shavingRecords.map((r) => r.allowance),
      type: 'scatter',
      symbolSize: 14,
      itemStyle: {
        color: (params: any) => {
          const v = params.value;
          return v >= 0.1 && v <= 0.2 ? '#00B42A' : v < 0.1 ? '#F53F3F' : '#FF7D00';
        },
      },
      markArea: {
        silent: true,
        itemStyle: { color: 'rgba(0, 180, 42, 0.08)' },
        data: [[{ yAxis: 0.1 }, { yAxis: 0.2 }]],
      },
      markLine: {
        silent: true,
        data: [
          { yAxis: 0.1, lineStyle: { color: '#00B42A', type: 'dashed' }, label: { formatter: '下限 0.1' } },
          { yAxis: 0.2, lineStyle: { color: '#00B42A', type: 'dashed' }, label: { formatter: '上限 0.2' } },
        ],
      },
    }],
  };

  const wkCompareOption = {
    tooltip: { trigger: 'axis' },
    legend: { data: ['剃前Wk', '剃后Wk'], right: 0, top: 0 },
    grid: { left: 60, right: 20, top: 40, bottom: 30 },
    xAxis: { type: 'category', data: shavingRecords.map((r, i) => `#${i + 1}`), axisLabel: { color: '#86909C' } },
    yAxis: { type: 'value', name: 'mm', axisLabel: { color: '#86909C' }, splitLine: { lineStyle: { color: '#F2F3F5' } } },
    series: [
      {
        name: '剃前Wk',
        type: 'bar',
        data: shavingRecords.map((r) => r.preShaveWk),
        itemStyle: { color: '#86909C', borderRadius: [4, 4, 0, 0] },
        barWidth: 18,
      },
      {
        name: '剃后Wk',
        type: 'bar',
        data: shavingRecords.map((r) => r.postShaveWk),
        itemStyle: { color: '#13C2C2', borderRadius: [4, 4, 0, 0] },
        barWidth: 18,
      },
    ],
  };

  return (
    <div className="shaving-process-page">
      <PageHeader
        title="剃齿珩齿"
        description="剃齿余量精确控制与公法线测量记录"
        icon={<Scissors size={22} />}
        onAdd={() => setIsModalOpen(true)}
        addText="新增剃齿记录"
      />

      <Row gutter={16} className="mb-6">
        <Col xs={24} lg={12}>
          <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <span className="font-semibold text-gray-800">剃齿余量分布</span>
              <Tag color="green">绿色区域为合格区间 0.1~0.2mm</Tag>
            </div>
            <ReactECharts option={allowanceChartOption} style={{ height: 260 }} />
          </div>
        </Col>
        <Col xs={24} lg={12}>
          <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <span className="font-semibold text-gray-800">公法线Wk对比</span>
              <Tag color="cyan">剃前 vs 剃后</Tag>
            </div>
            <ReactECharts option={wkCompareOption} style={{ height: 260 }} />
          </div>
        </Col>
      </Row>

      <div className="bg-white rounded-lg shadow-sm border border-gray-100">
        <div className="px-5 py-4 border-b border-gray-100">
          <span className="font-semibold text-gray-800">剃齿记录列表</span>
        </div>
        <Table
          columns={columns}
          dataSource={shavingRecords}
          rowKey="id"
          pagination={{ pageSize: 8, showSizeChanger: true, showTotal: (t) => `共 ${t} 条记录` }}
          scroll={{ x: 1200 }}
        />
      </div>

      <Modal
        title={<span className="font-semibold flex items-center gap-2"><Calculator size={18} className="text-blue-500" />新增剃齿加工记录（自动计算余量）</span>}
        open={isModalOpen}
        onOk={handleSubmit}
        onCancel={() => setIsModalOpen(false)}
        okText="提交"
        cancelText="取消"
        width={600}
      >
        <Form form={form} layout="vertical">
          <Divider orientation="left" className="!my-3"><span className="text-xs text-gray-500">基本信息</span></Divider>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="workOrderId" label="关联工单" rules={[{ required: true }]}>
                <Select
                  options={workOrders.filter((wo) => wo.processProgress.hobbing && !wo.processProgress.shaving).map((wo) => ({
                    label: `${wo.orderNo} - ${wo.productName}`,
                    value: wo.id,
                  }))}
                  placeholder="选择已完成滚齿的工单"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="toothCount" label="齿数 Z" rules={[{ required: true }]}>
                <InputNumber min={8} className="!w-full" placeholder="如 30" />
              </Form.Item>
            </Col>
          </Row>

          <Divider orientation="left" className="!my-3"><span className="text-xs text-gray-500">公法线测量</span></Divider>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="preShaveWk" label="剃前公法线 Wk (mm)" rules={[{ required: true }]}>
                <InputNumber
                  step={0.001}
                  precision={3}
                  className="!w-full"
                  placeholder="如 32.586"
                  onChange={(v) => setPreShaveValue(v as number)}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="postShaveWk" label="剃后公法线 Wk (mm)" rules={[{ required: true }]}>
                <InputNumber
                  step={0.001}
                  precision={3}
                  className="!w-full"
                  placeholder="如 32.452"
                  onChange={(v) => setPostShaveValue(v as number)}
                />
              </Form.Item>
            </Col>
          </Row>

          <div
            className="rounded-lg p-4 mb-4"
            style={{
              background: calculatedAllowance !== null && calculatedAllowance >= 0.1 && calculatedAllowance <= 0.2
                ? '#E8FFEA'
                : calculatedAllowance !== null
                ? '#FFF7E8'
                : '#F7F8FA',
            }}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 flex items-center gap-2">
                <Calculator size={16} /> 自动计算剃齿余量：
              </span>
              <span
                className="text-xl font-bold font-mono"
                style={{
                  color: calculatedAllowance !== null && calculatedAllowance >= 0.1 && calculatedAllowance <= 0.2
                    ? '#00B42A'
                    : calculatedAllowance !== null
                    ? '#FF7D00'
                    : '#86909C',
                }}
              >
                {calculatedAllowance !== null ? calculatedAllowance.toFixed(3) : '—'} mm
              </span>
            </div>
            {calculatedAllowance !== null && (
              <div className="text-xs mt-2" style={{ color: calculatedAllowance >= 0.1 && calculatedAllowance <= 0.2 ? '#00B42A' : '#FF7D00' }}>
                {calculatedAllowance >= 0.1 && calculatedAllowance <= 0.2
                  ? '✓ 余量在合格范围内 (0.10~0.20 mm)'
                  : '⚠ 余量偏离推荐区间，请确认工艺要求'}
              </div>
            )}
          </div>

          <Divider orientation="left" className="!my-3"><span className="text-xs text-gray-500">人员信息</span></Divider>
          <Form.Item name="operator" label="操作员" rules={[{ required: true }]}>
            <Select options={['孙文斌', '周国强', '吴建明'].map((v) => ({ label: v, value: v }))} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={<span className="font-semibold">剃齿记录详情</span>}
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
              <Descriptions.Item label="齿数">Z{currentRecord.toothCount}</Descriptions.Item>
              <Descriptions.Item label="剃前公法线"><span className="text-gray-600">{currentRecord.preShaveWk.toFixed(3)} mm</span></Descriptions.Item>
              <Descriptions.Item label="剃后公法线"><span className="text-cyan-600 font-semibold">{currentRecord.postShaveWk.toFixed(3)} mm</span></Descriptions.Item>
              <Descriptions.Item label="剃齿余量" span={2}>
                <Tag color={currentRecord.allowance >= 0.1 && currentRecord.allowance <= 0.2 ? 'green' : 'orange'}>
                  <span className="font-mono text-base px-1">{currentRecord.allowance.toFixed(3)} mm</span>
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="操作员">{currentRecord.operator}</Descriptions.Item>
              <Descriptions.Item label="记录时间">{currentRecord.recordTime}</Descriptions.Item>
            </Descriptions>
          );
        })()}
      </Modal>
    </div>
  );
};

export default ShavingProcess;
