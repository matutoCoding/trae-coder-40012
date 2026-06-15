import { useState } from 'react';
import { Table, Modal, Form, Input, InputNumber, Select, message, Row, Col, Descriptions, Tag, Divider, Card } from 'antd';
import { Puzzle, Eye, Volume2, VolumeX } from 'lucide-react';
import ReactECharts from 'echarts-for-react';
import { useGearStore } from '@/store';
import { PageHeader, StatusTag } from '@/components/common/PageComponents';
import { validateMatching } from '@/utils';

const MatchingPage: React.FC = () => {
  const { matchingRecords, workOrders, addMatchingRecord, getWorkOrderById } = useGearStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [detailModal, setDetailModal] = useState(false);
  const [currentRecord, setCurrentRecord] = useState<any>(null);
  const [form] = Form.useForm();

  const handleSubmit = () => {
    form.validateFields().then((values) => {
      const validation = validateMatching({ noiseDb: values.noiseDb, backlash: values.backlash });
      addMatchingRecord(values);
      message.success('配对啮合记录添加成功');
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
    { title: '主动轮编号', dataIndex: 'drivingGearNo', width: 150, render: (v: string) => <span className="font-mono text-xs">{v}</span> },
    { title: '从动轮编号', dataIndex: 'drivenGearNo', width: 150, render: (v: string) => <span className="font-mono text-xs">{v}</span> },
    {
      title: '侧隙 (mm)',
      dataIndex: 'backlash',
      width: 100,
      align: 'center' as const,
      render: (v: number) => (
        <Tag color={v >= 0.08 && v <= 0.18 ? 'green' : 'orange'}>
          <span className="font-mono">{v.toFixed(3)}</span>
        </Tag>
      ),
    },
    {
      title: '接触斑点',
      dataIndex: 'contactPattern',
      width: 180,
      ellipsis: true,
      render: (v: string) => <span className="text-xs text-gray-600">{v}</span>,
    },
    {
      title: '噪声',
      dataIndex: 'noiseDb',
      width: 120,
      align: 'center' as const,
      render: (v: number) => {
        const icon = v <= 72 ? <Volume2 size={14} className="inline mr-1" /> : <VolumeX size={14} className="inline mr-1 text-red-500" />;
        return (
          <span className={v <= 72 ? 'text-green-600' : 'text-red-500'}>
            {icon}
            <span className="font-bold">{v}</span> dB
          </span>
        );
      },
    },
    { title: '质检员', dataIndex: 'inspector', width: 120 },
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

  const noiseFftOption = {
    tooltip: { trigger: 'axis' },
    grid: { left: 60, right: 30, top: 40, bottom: 40 },
    xAxis: {
      type: 'category',
      data: ['63Hz', '125Hz', '250Hz', '500Hz', '1kHz', '2kHz', '4kHz', '8kHz'],
      axisLabel: { color: '#86909C' },
      name: '频率',
    },
    yAxis: {
      type: 'value',
      name: 'dB',
      min: 30,
      max: 90,
      axisLabel: { color: '#86909C' },
      splitLine: { lineStyle: { color: '#F2F3F5' } },
    },
    series: [{
      type: 'line',
      smooth: true,
      symbol: 'circle',
      symbolSize: 8,
      data: [42, 55, 63, 68, 65, 58, 48, 40],
      lineStyle: { color: '#722ED1', width: 2 },
      itemStyle: { color: '#722ED1' },
      areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: 'rgba(114,46,209,0.3)' }, { offset: 1, color: 'rgba(114,46,209,0)' }] } },
      markLine: {
        silent: true,
        data: [{ yAxis: 72, lineStyle: { color: '#F53F3F', type: 'dashed' }, label: { formatter: '噪声限值 72dB' } }],
      },
    }],
  };

  const contactPatternOption = {
    tooltip: { trigger: 'item', formatter: '{b}: {c}%' },
    series: [
      {
        type: 'treemap',
        roam: false,
        width: 220,
        height: 160,
        data: [
          {
            name: '啮合齿面',
            value: 100,
            itemStyle: { color: '#E5E6EB' },
            children: [
              { name: '接触斑点区', value: 60, itemStyle: { color: '#165DFF' } },
              { name: '非接触区', value: 40, itemStyle: { color: '#F2F3F5' } },
            ],
          },
        ],
        breadcrumb: { show: false },
        label: { show: true, fontSize: 11 },
      },
    ],
  };

  return (
    <div className="matching-page">
      <PageHeader
        title="配对啮合"
        description="齿轮配对选择、接触斑点检测与噪声检验"
        icon={<Puzzle size={22} />}
        onAdd={() => setIsModalOpen(true)}
        addText="新增配对记录"
      />

      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} lg={6}>
          <Card className="h-full" style={{ borderRadius: 8 }} styles={{ body: { padding: 16 } }}>
            <div className="text-xs text-gray-500 mb-2">配对完成数</div>
            <div className="font-bold text-2xl text-purple-600">{matchingRecords.length}</div>
            <div className="text-xs text-gray-400 mt-2">对</div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="h-full" style={{ borderRadius: 8 }} styles={{ body: { padding: 16 } }}>
            <div className="text-xs text-gray-500 mb-2">合格率</div>
            <div className="font-bold text-2xl text-green-600">
              {matchingRecords.length ? Math.round(matchingRecords.filter((r) => r.result === 'qualified').length / matchingRecords.length * 100) : 0}%
            </div>
            <div className="text-xs text-gray-400 mt-2">
              {matchingRecords.filter((r) => r.result === 'qualified').length}/{matchingRecords.length}
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="h-full" style={{ borderRadius: 8 }} styles={{ body: { padding: 16 } }}>
            <div className="text-xs text-gray-500 mb-2">平均侧隙</div>
            <div className="font-bold text-2xl text-blue-600 font-mono">
              {matchingRecords.length ? (matchingRecords.reduce((s, r) => s + r.backlash, 0) / matchingRecords.length).toFixed(3) : '0'}
            </div>
            <div className="text-xs text-gray-400 mt-2">mm / 推荐 0.08~0.18</div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="h-full" style={{ borderRadius: 8 }} styles={{ body: { padding: 16 } }}>
            <div className="text-xs text-gray-500 mb-2">平均噪声</div>
            <div className="font-bold text-2xl font-mono" style={{ color: matchingRecords.length && matchingRecords.reduce((s, r) => s + r.noiseDb, 0) / matchingRecords.length <= 72 ? '#00B42A' : '#F53F3F' }}>
              {matchingRecords.length ? (matchingRecords.reduce((s, r) => s + r.noiseDb, 0) / matchingRecords.length).toFixed(0) : '0'}
            </div>
            <div className="text-xs text-gray-400 mt-2">dB / 限值 ≤72</div>
          </Card>
        </Col>
      </Row>

      <Row gutter={16} className="mb-6">
        <Col xs={24} lg={14}>
          <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <span className="font-semibold text-gray-800">噪声频谱分析 (示例)</span>
              <Tag color="purple">FFT频域分析</Tag>
            </div>
            <ReactECharts option={noiseFftOption} style={{ height: 260 }} />
          </div>
        </Col>
        <Col xs={24} lg={10}>
          <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-100 h-full">
            <div className="flex items-center justify-between mb-4">
              <span className="font-semibold text-gray-800">接触斑点示意图 (示例)</span>
              <Tag color="blue">齿高75% / 齿长80%</Tag>
            </div>
            <div className="flex items-center justify-center">
              <ReactECharts option={contactPatternOption} style={{ height: 220, width: '100%' }} />
            </div>
          </div>
        </Col>
      </Row>

      <div className="bg-white rounded-lg shadow-sm border border-gray-100">
        <div className="px-5 py-4 border-b border-gray-100">
          <span className="font-semibold text-gray-800">配对啮合记录列表</span>
        </div>
        <Table
          columns={columns}
          dataSource={matchingRecords}
          rowKey="id"
          pagination={{ pageSize: 8, showSizeChanger: true, showTotal: (t) => `共 ${t} 条记录` }}
          scroll={{ x: 1300 }}
        />
      </div>

      <Modal
        title={<span className="font-semibold">新增齿轮配对啮合记录</span>}
        open={isModalOpen}
        onOk={handleSubmit}
        onCancel={() => setIsModalOpen(false)}
        okText="提交"
        cancelText="取消"
        width={720}
      >
        <Form form={form} layout="vertical">
          <Divider orientation="left" className="!my-3"><span className="text-xs text-gray-500">配对信息</span></Divider>
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item name="workOrderId" label="关联工单" rules={[{ required: true }]}>
                <Select
                  options={workOrders.filter((wo) => wo.processProgress.inspection && !wo.processProgress.matching).map((wo) => ({
                    label: `${wo.orderNo} - ${wo.productName}`,
                    value: wo.id,
                  }))}
                  placeholder="选择已完成检测的工单"
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="drivingGearNo" label="主动轮编号" rules={[{ required: true }]}>
                <Input placeholder="如 D-20260615-001" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="drivenGearNo" label="从动轮编号" rules={[{ required: true }]}>
                <Input placeholder="如 V-20260615-001" />
              </Form.Item>
            </Col>
          </Row>

          <Divider orientation="left" className="!my-3"><span className="text-xs text-gray-500">啮合检测</span></Divider>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="backlash" label="侧隙 (mm)" rules={[{ required: true }]}>
                <InputNumber step={0.001} precision={3} className="!w-full" placeholder="如 0.12" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="noiseDb" label="噪声 (dB)" rules={[{ required: true }]}>
                <InputNumber step={1} className="!w-full" placeholder="如 68" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="contactPattern" label="接触斑点描述" rules={[{ required: true }]}>
            <Input.TextArea
              rows={2}
              placeholder="如：齿高方向75%，齿长方向80%，无明显边缘接触"
            />
          </Form.Item>
          <Form.Item name="noiseAnalysis" label="噪声分析">
            <Input.TextArea
              rows={2}
              placeholder="如：噪声平稳，无异常啸叫、敲击声"
            />
          </Form.Item>

          <Divider orientation="left" className="!my-3"><span className="text-xs text-gray-500">检验信息</span></Divider>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="inspector" label="质检员" rules={[{ required: true }]}>
                <Select options={['质检员-李工', '质检员-陈工', '质检员-王工'].map((v) => ({ label: v, value: v }))} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="result" label="综合判定" rules={[{ required: true }]}>
                <Select
                  options={[
                    { label: '合格', value: 'qualified' },
                    { label: '不合格', value: 'unqualified' },
                  ]}
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      <Modal
        title={<span className="font-semibold">配对啮合检验详情</span>}
        open={detailModal}
        onCancel={() => setDetailModal(false)}
        footer={null}
        width={680}
      >
        {currentRecord && (() => {
          const wo = getWorkOrderById(currentRecord.workOrderId);
          return (
            <Descriptions bordered column={2} size="small">
              <Descriptions.Item label="关联工单" span={2}>
                <span className="text-blue-600 font-mono">{wo?.orderNo}</span> - {wo?.productName} ({wo?.gearModel})
              </Descriptions.Item>
              <Descriptions.Item label="主动轮编号"><span className="font-mono">{currentRecord.drivingGearNo}</span></Descriptions.Item>
              <Descriptions.Item label="从动轮编号"><span className="font-mono">{currentRecord.drivenGearNo}</span></Descriptions.Item>
              <Descriptions.Item label="侧隙">
                <Tag color={currentRecord.backlash >= 0.08 && currentRecord.backlash <= 0.18 ? 'green' : 'orange'}>
                  <span className="font-mono">{currentRecord.backlash.toFixed(3)} mm</span>
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="噪声值">
                <span className={currentRecord.noiseDb <= 72 ? 'text-green-600' : 'text-red-500'}>
                  <strong>{currentRecord.noiseDb} dB</strong>
                </span>
              </Descriptions.Item>
              <Descriptions.Item label="接触斑点" span={2}>
                <div className="text-gray-600 text-sm">{currentRecord.contactPattern}</div>
              </Descriptions.Item>
              <Descriptions.Item label="噪声分析" span={2}>
                <div className="text-gray-600 text-sm">{currentRecord.noiseAnalysis || '-'}</div>
              </Descriptions.Item>
              <Descriptions.Item label="质检员">{currentRecord.inspector}</Descriptions.Item>
              <Descriptions.Item label="检验结果"><StatusTag status={currentRecord.result} /></Descriptions.Item>
              <Descriptions.Item label="检验时间" span={2}>{currentRecord.recordTime}</Descriptions.Item>
            </Descriptions>
          );
        })()}
      </Modal>
    </div>
  );
};

export default MatchingPage;
