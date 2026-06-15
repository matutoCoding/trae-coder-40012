import { useState } from 'react';
import { Table, Modal, Form, Input, InputNumber, Select, message, Row, Col, Descriptions, Tag, Divider } from 'antd';
import { CircleDot, Eye } from 'lucide-react';
import ReactECharts from 'echarts-for-react';
import { useGearStore } from '@/store';
import { PageHeader, StatusTag } from '@/components/common/PageComponents';
import { getStatusText, validateBlank } from '@/utils';

const BlankProcess: React.FC = () => {
  const { blankRecords, workOrders, addBlankRecord, getWorkOrderById } = useGearStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [detailModal, setDetailModal] = useState(false);
  const [currentRecord, setCurrentRecord] = useState<any>(null);
  const [form] = Form.useForm();

  const handleSubmit = () => {
    form.validateFields().then((values) => {
      const validation = validateBlank({ outerDiameter: values.outerDiameter, endFaceRunout: values.endFaceRunout, roughness: values.roughness });
      addBlankRecord(values);
      message.success('齿坯加工记录添加成功');
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
    { title: '批次号', dataIndex: 'batchNo', width: 140, render: (v: string) => <span className="font-mono text-xs">{v}</span> },
    {
      title: '关联工单',
      dataIndex: 'workOrderId',
      width: 150,
      render: (id: string) => {
        const wo = getWorkOrderById(id);
        return wo ? <span className="text-blue-600 font-mono text-xs">{wo.orderNo}</span> : '-';
      },
    },
    {
      title: '产品名称',
      dataIndex: 'workOrderId',
      render: (id: string) => getWorkOrderById(id)?.productName || '-',
    },
    {
      title: '外圆直径 (mm)',
      dataIndex: 'outerDiameter',
      align: 'center' as const,
      render: (v: number, r: any) => (
        <div>
          <span className="font-semibold" style={{ color: '#165DFF' }}>{v.toFixed(3)}</span>
          <div className="text-xs text-gray-400">公差: {r.outerDiameterTolerance}</div>
        </div>
      ),
    },
    { title: '端面跳动 (μm)', dataIndex: 'endFaceRunout', align: 'center' as const, render: (v: number) => (v * 1000).toFixed(1) },
    { title: '粗糙度 Ra (μm)', dataIndex: 'roughness', align: 'center' as const },
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

  const runoutChartOption = {
    tooltip: { trigger: 'axis' },
    grid: { left: 50, right: 20, top: 30, bottom: 30 },
    xAxis: { type: 'category', data: blankRecords.slice(-10).map((r, i) => `#${i + 1}`), axisLabel: { color: '#86909C' } },
    yAxis: {
      type: 'value',
      name: '端面跳动μm',
      axisLabel: { color: '#86909C' },
      splitLine: { lineStyle: { color: '#F2F3F5' } },
    },
    series: [{
      data: blankRecords.slice(-10).map((r) => r.endFaceRunout * 1000),
      type: 'line',
      smooth: true,
      symbol: 'circle',
      symbolSize: 8,
      lineStyle: { color: '#165DFF', width: 2 },
      itemStyle: { color: '#165DFF' },
      markLine: {
        data: [{ yAxis: 15, name: '合格线', lineStyle: { color: '#F53F3F', type: 'dashed' } }],
        label: { formatter: '合格线: 15μm' },
      },
      areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: 'rgba(22,93,255,0.3)' }, { offset: 1, color: 'rgba(22,93,255,0)' }] } },
    }],
  };

  const diameterDistOption = {
    tooltip: { trigger: 'axis' },
    grid: { left: 50, right: 20, top: 30, bottom: 30 },
    xAxis: { type: 'category', data: blankRecords.map((r) => r.batchNo.slice(-6)), axisLabel: { color: '#86909C', rotate: 30 } },
    yAxis: { type: 'value', name: '直径mm', axisLabel: { color: '#86909C' }, splitLine: { lineStyle: { color: '#F2F3F5' } } },
    series: [{
      data: blankRecords.map((r) => r.outerDiameter),
      type: 'bar',
      barWidth: 24,
      itemStyle: {
        color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: '#4080FF' }, { offset: 1, color: '#165DFF' }] },
        borderRadius: [4, 4, 0, 0],
      },
      markLine: {
        silent: true,
        data: [
          { yAxis: 128.03, lineStyle: { color: '#FF7D00' }, label: { formatter: '上限' } },
          { yAxis: 127.97, lineStyle: { color: '#FF7D00' }, label: { formatter: '下限' } },
        ],
      },
    }],
  };

  return (
    <div className="blank-process-page">
      <PageHeader
        title="齿坯加工"
        description="齿坯外圆车削参数记录与质量监控"
        icon={<CircleDot size={22} />}
        onAdd={() => setIsModalOpen(true)}
        addText="新增车削记录"
      />

      <Row gutter={16} className="mb-6">
        <Col xs={24} lg={12}>
          <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <span className="font-semibold text-gray-800">端面跳动趋势</span>
              <Tag color="blue">最近10件</Tag>
            </div>
            <ReactECharts option={runoutChartOption} style={{ height: 240 }} />
          </div>
        </Col>
        <Col xs={24} lg={12}>
          <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <span className="font-semibold text-gray-800">外圆直径分布</span>
              <Tag color="orange">公差带参考</Tag>
            </div>
            <ReactECharts option={diameterDistOption} style={{ height: 240 }} />
          </div>
        </Col>
      </Row>

      <div className="bg-white rounded-lg shadow-sm border border-gray-100">
        <div className="px-5 py-4 border-b border-gray-100">
          <span className="font-semibold text-gray-800">车削记录列表</span>
        </div>
        <Table
          columns={columns}
          dataSource={blankRecords}
          rowKey="id"
          pagination={{ pageSize: 8, showSizeChanger: true, showTotal: (t) => `共 ${t} 条记录` }}
          scroll={{ x: 1100 }}
        />
      </div>

      <Modal
        title={<span className="font-semibold">新增齿坯外圆车削记录</span>}
        open={isModalOpen}
        onOk={handleSubmit}
        onCancel={() => setIsModalOpen(false)}
        okText="提交"
        cancelText="取消"
        width={640}
      >
        <Divider orientation="left" className="!my-3"><span className="text-xs text-gray-500">基本信息</span></Divider>
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="workOrderId" label="关联工单" rules={[{ required: true }]}>
                <Select
                  options={workOrders
                    .filter((wo) => !wo.processProgress.blank)
                    .map((wo) => ({
                      label: `${wo.orderNo} - ${wo.productName}`,
                      value: wo.id,
                    }))}
                  placeholder="请选择工单"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="batchNo" label="批次号" rules={[{ required: true }]}>
                <Input placeholder="如 B20260615-01" />
              </Form.Item>
            </Col>
          </Row>

          <Divider orientation="left" className="!my-3"><span className="text-xs text-gray-500">加工参数</span></Divider>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="outerDiameter" label="外圆直径 (mm)" rules={[{ required: true }]}>
                <InputNumber step={0.001} precision={3} className="!w-full" placeholder="如 128.020" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="outerDiameterTolerance" label="公差带" rules={[{ required: true }]}>
                <Input placeholder="如 128±0.03" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="endFaceRunout" label="端面跳动 (mm)" rules={[{ required: true }]}>
                <InputNumber step={0.001} precision={4} className="!w-full" placeholder="如 0.008" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="roughness" label="粗糙度 Ra (μm)" rules={[{ required: true }]}>
                <Select
                  options={[0.4, 0.8, 1.6, 3.2, 6.3].map((v) => ({ label: `Ra ${v}`, value: v }))}
                  placeholder="请选择"
                />
              </Form.Item>
            </Col>
          </Row>

          <Divider orientation="left" className="!my-3"><span className="text-xs text-gray-500">人员信息</span></Divider>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="operator" label="操作员" rules={[{ required: true }]}>
                <Select
                  options={['张建国', '李卫东', '李明辉'].map((v) => ({ label: v, value: v }))}
                  placeholder="请选择"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="remark" label="备注">
                <Input placeholder="选填" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      <Modal
        title={<span className="font-semibold">齿坯加工记录详情</span>}
        open={detailModal}
        onCancel={() => setDetailModal(false)}
        footer={null}
        width={600}
      >
        {currentRecord && (() => {
          const wo = getWorkOrderById(currentRecord.workOrderId);
          return (
            <Descriptions bordered column={2} size="small">
              <Descriptions.Item label="批次号" span={2}><span className="font-mono">{currentRecord.batchNo}</span></Descriptions.Item>
              <Descriptions.Item label="关联工单"><span className="text-blue-600 font-mono">{wo?.orderNo}</span></Descriptions.Item>
              <Descriptions.Item label="产品名称">{wo?.productName}</Descriptions.Item>
              <Descriptions.Item label="齿轮型号">{wo?.gearModel}</Descriptions.Item>
              <Descriptions.Item label="工单状态"><StatusTag status={wo?.status || ''} /></Descriptions.Item>
              <Descriptions.Item label="外圆直径"><span className="text-blue-600 font-semibold">{currentRecord.outerDiameter} mm</span></Descriptions.Item>
              <Descriptions.Item label="公差带">{currentRecord.outerDiameterTolerance}</Descriptions.Item>
              <Descriptions.Item label="端面跳动">{(currentRecord.endFaceRunout * 1000).toFixed(1)} μm</Descriptions.Item>
              <Descriptions.Item label="粗糙度">Ra {currentRecord.roughness} μm</Descriptions.Item>
              <Descriptions.Item label="操作员">{currentRecord.operator}</Descriptions.Item>
              <Descriptions.Item label="记录时间">{currentRecord.recordTime}</Descriptions.Item>
              {currentRecord.remark && <Descriptions.Item label="备注" span={2}>{currentRecord.remark}</Descriptions.Item>}
            </Descriptions>
          );
        })()}
      </Modal>
    </div>
  );
};

export default BlankProcess;
