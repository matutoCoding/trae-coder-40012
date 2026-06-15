import { useState } from 'react';
import { Table, Modal, Form, InputNumber, Select, message, Row, Col, Descriptions, Tag, Divider } from 'antd';
import { Flame, Eye } from 'lucide-react';
import ReactECharts from 'echarts-for-react';
import { useGearStore } from '@/store';
import { PageHeader, StatusTag } from '@/components/common/PageComponents';

const CarburizingProcess: React.FC = () => {
  const { carburizingRecords, workOrders, addCarburizingRecord, getWorkOrderById } = useGearStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [detailModal, setDetailModal] = useState(false);
  const [currentRecord, setCurrentRecord] = useState<any>(null);
  const [form] = Form.useForm();

  const handleSubmit = () => {
    form.validateFields().then((values) => {
      addCarburizingRecord(values);
      message.success('渗碳淬火记录添加成功');
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
      title: '渗碳温度 (℃)',
      dataIndex: 'carburizingTemp',
      width: 120,
      align: 'center' as const,
      render: (v: number) => <span className="font-semibold text-red-500">{v}</span>,
    },
    { title: '保温时间 (h)', dataIndex: 'holdingTime', width: 110, align: 'center' as const },
    {
      title: '渗碳层深度 (mm)',
      dataIndex: 'caseDepth',
      width: 130,
      align: 'center' as const,
      render: (v: number) => (
        <Tag color={v >= 0.8 && v <= 1.2 ? 'green' : v < 0.8 ? 'orange' : 'blue'}>
          <span className="font-mono">{v.toFixed(2)}</span>
        </Tag>
      ),
    },
    { title: '表面硬度 (HRC)', dataIndex: 'surfaceHardness', width: 130, align: 'center' as const, render: (v: number) => <span className="font-semibold">{v.toFixed(1)}</span> },
    { title: '心部硬度 (HRC)', dataIndex: 'coreHardness', width: 120, align: 'center' as const },
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

  const tempCurveOption = {
    tooltip: { trigger: 'axis', formatter: '{b}<br/>{a}: {c}℃' },
    grid: { left: 60, right: 30, top: 40, bottom: 40 },
    xAxis: {
      type: 'category',
      data: ['入炉', '升温1h', '渗碳保温', '扩散2h', '降温', '出炉淬火', '回火后'],
      axisLabel: { color: '#86909C', rotate: 20 },
    },
    yAxis: {
      type: 'value',
      name: '温度℃',
      min: 200,
      max: 1000,
      axisLabel: { color: '#86909C' },
      splitLine: { lineStyle: { color: '#F2F3F5' } },
    },
    series: [{
      name: '工艺温度曲线',
      type: 'line',
      smooth: true,
      symbol: 'circle',
      symbolSize: 8,
      data: [25, 500, 920, 880, 840, 820, 180],
      lineStyle: { color: '#F53F3F', width: 3 },
      itemStyle: { color: '#F53F3F' },
      areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: 'rgba(245,63,63,0.3)' }, { offset: 1, color: 'rgba(245,63,63,0)' }] } },
      markPoint: {
        data: [{ type: 'max', name: '最高温', label: { formatter: '{c}℃' } }],
      },
    }],
  };

  const hardnessCompareOption = {
    tooltip: { trigger: 'axis' },
    legend: { data: ['表面硬度', '心部硬度'], right: 0, top: 0 },
    grid: { left: 60, right: 30, top: 40, bottom: 30 },
    xAxis: { type: 'category', data: carburizingRecords.map((_, i) => `#${i + 1}`), axisLabel: { color: '#86909C' } },
    yAxis: { type: 'value', name: 'HRC', min: 20, max: 70, axisLabel: { color: '#86909C' }, splitLine: { lineStyle: { color: '#F2F3F5' } } },
    series: [
      {
        name: '表面硬度',
        type: 'bar',
        data: carburizingRecords.map((r) => r.surfaceHardness),
        itemStyle: { color: '#F53F3F', borderRadius: [4, 4, 0, 0] },
        barWidth: 20,
        markLine: { data: [{ yAxis: 58, lineStyle: { color: '#00B42A', type: 'dashed' }, label: { formatter: '合格下限 58HRC' } }] },
      },
      {
        name: '心部硬度',
        type: 'bar',
        data: carburizingRecords.map((r) => r.coreHardness),
        itemStyle: { color: '#FF7D00', borderRadius: [4, 4, 0, 0] },
        barWidth: 20,
      },
    ],
  };

  return (
    <div className="carburizing-process-page">
      <PageHeader
        title="渗碳淬火"
        description="齿面渗碳层深度控制与硬度检测记录"
        icon={<Flame size={22} />}
        onAdd={() => setIsModalOpen(true)}
        addText="新增渗碳记录"
      />

      <Row gutter={16} className="mb-6">
        <Col xs={24} lg={12}>
          <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <span className="font-semibold text-gray-800">标准渗碳工艺温度曲线</span>
              <Tag color="red">920℃高温渗碳</Tag>
            </div>
            <ReactECharts option={tempCurveOption} style={{ height: 260 }} />
          </div>
        </Col>
        <Col xs={24} lg={12}>
          <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <span className="font-semibold text-gray-800">表面/心部硬度对比</span>
              <Tag color="green">目标 ≥58 HRC</Tag>
            </div>
            <ReactECharts option={hardnessCompareOption} style={{ height: 260 }} />
          </div>
        </Col>
      </Row>

      <div className="bg-white rounded-lg shadow-sm border border-gray-100">
        <div className="px-5 py-4 border-b border-gray-100">
          <span className="font-semibold text-gray-800">渗碳淬火记录列表</span>
        </div>
        <Table
          columns={columns}
          dataSource={carburizingRecords}
          rowKey="id"
          pagination={{ pageSize: 8, showSizeChanger: true, showTotal: (t) => `共 ${t} 条记录` }}
          scroll={{ x: 1300 }}
        />
      </div>

      <Modal
        title={<span className="font-semibold">新增渗碳淬火记录</span>}
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
              options={workOrders.filter((wo) => wo.processProgress.shaving && !wo.processProgress.carburizing).map((wo) => ({
                label: `${wo.orderNo} - ${wo.productName}`,
                value: wo.id,
              }))}
              placeholder="选择已完成剃齿的工单"
            />
          </Form.Item>

          <Divider orientation="left" className="!my-3"><span className="text-xs text-gray-500">热处理工艺参数</span></Divider>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="carburizingTemp" label="渗碳温度 (℃)" rules={[{ required: true }]} initialValue={920}>
                <InputNumber step={10} className="!w-full" placeholder="920" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="holdingTime" label="保温时间 (h)" rules={[{ required: true }]}>
                <InputNumber step={0.5} precision={1} className="!w-full" placeholder="如 6.5" />
              </Form.Item>
            </Col>
          </Row>

          <Divider orientation="left" className="!my-3"><span className="text-xs text-gray-500">检测参数</span></Divider>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="caseDepth" label="渗碳层深度 (mm)" rules={[{ required: true }]}>
                <InputNumber step={0.01} precision={2} className="!w-full" placeholder="如 0.85" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="surfaceHardness" label="表面硬度 (HRC)" rules={[{ required: true }]}>
                <InputNumber step={0.5} precision={1} className="!w-full" placeholder="如 60.5" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="coreHardness" label="心部硬度 (HRC)" rules={[{ required: true }]}>
                <InputNumber step={1} className="!w-full" placeholder="如 42" />
              </Form.Item>
            </Col>
          </Row>

          <Divider orientation="left" className="!my-3"><span className="text-xs text-gray-500">人员信息</span></Divider>
          <Form.Item name="operator" label="操作员" rules={[{ required: true }]}>
            <Select options={['刘师傅', '陈师傅', '张师傅'].map((v) => ({ label: v, value: v }))} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={<span className="font-semibold">渗碳淬火记录详情</span>}
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
              <Descriptions.Item label="数量">{wo?.quantity} 件</Descriptions.Item>
              <Descriptions.Item label="渗碳温度"><span className="text-red-500 font-semibold">{currentRecord.carburizingTemp} ℃</span></Descriptions.Item>
              <Descriptions.Item label="保温时间">{currentRecord.holdingTime} h</Descriptions.Item>
              <Descriptions.Item label="渗碳层深度">
                <Tag color={currentRecord.caseDepth >= 0.8 && currentRecord.caseDepth <= 1.2 ? 'green' : 'orange'}>
                  {currentRecord.caseDepth.toFixed(2)} mm
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="表面硬度"><span className="font-semibold">{currentRecord.surfaceHardness.toFixed(1)} HRC</span></Descriptions.Item>
              <Descriptions.Item label="心部硬度">{currentRecord.coreHardness} HRC</Descriptions.Item>
              <Descriptions.Item label="操作员">{currentRecord.operator}</Descriptions.Item>
              <Descriptions.Item label="记录时间" span={2}>{currentRecord.recordTime}</Descriptions.Item>
            </Descriptions>
          );
        })()}
      </Modal>
    </div>
  );
};

export default CarburizingProcess;
