import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Row, Col, Card, Table, Tag, Select, Space, Button, Modal, Form, Input, DatePicker, message, Descriptions, Timeline } from 'antd';
import { AlertTriangle, CheckCircle, Clock, User, FileText, XCircle } from 'lucide-react';
import { useGearStore } from '@/store';
import { PageHeader } from '@/components/common/PageComponents';
import type { QualityAlert } from '@/types';
import dayjs from 'dayjs';

const processNames: Record<string, string> = {
  blank: '齿坯加工',
  hobbing: '滚齿插齿',
  shaving: '剃齿珩齿',
  carburizing: '渗碳淬火',
  grinding: '磨齿精加工',
  inspection: '齿形检测',
  matching: '配对啮合',
};

const statusColors: Record<string, string> = {
  pending: 'red',
  processing: 'orange',
  closed: 'green',
};

const statusTexts: Record<string, string> = {
  pending: '待处理',
  processing: '处理中',
  closed: '已关闭',
};

const levelColors: Record<string, string> = {
  严重: 'red',
  中等: 'orange',
  轻微: 'blue',
};

const QualityAlerts: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { alerts, workOrders, handleAlert, closeAlert, updateAlertStatus } = useGearStore();

  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedProcess, setSelectedProcess] = useState<string>('all');
  const [selectedModel, setSelectedModel] = useState<string>('all');
  const [selectedWorkOrderId, setSelectedWorkOrderId] = useState<string>('all');
  const [selectedAlert, setSelectedAlert] = useState<QualityAlert | null>(null);

  const [handleModalOpen, setHandleModalOpen] = useState(false);
  const [closeModalOpen, setCloseModalOpen] = useState(false);
  const [handleForm] = Form.useForm();
  const [closeForm] = Form.useForm();

  const allModels = useMemo(
    () => [...new Set(workOrders.map((wo) => wo.gearModel))],
    [workOrders]
  );

  const getWorkOrder = (workOrderId: string) => workOrders.find((w) => w.id === workOrderId);

  const filteredAlerts = useMemo(() => {
    return alerts.filter((a) => {
      if (selectedStatus !== 'all' && a.status !== selectedStatus) return false;
      if (selectedProcess !== 'all' && a.process !== selectedProcess) return false;
      if (selectedWorkOrderId !== 'all' && a.workOrderId !== selectedWorkOrderId) return false;
      if (selectedWorkOrderId === 'all' && selectedModel !== 'all') {
        const wo = getWorkOrder(a.workOrderId);
        if (!wo || wo.gearModel !== selectedModel) return false;
      }
      return true;
    });
  }, [alerts, selectedStatus, selectedProcess, selectedModel, selectedWorkOrderId, workOrders]);

  useEffect(() => {
    const alertId = searchParams.get('alertId');
    const workOrderId = searchParams.get('workOrderId');
    const process = searchParams.get('process');

    if (workOrderId) {
      setSelectedWorkOrderId(workOrderId);
      const wo = workOrders.find((w) => w.id === workOrderId);
      if (wo) {
        setSelectedModel(wo.gearModel);
      }
    }
    if (process) {
      setSelectedProcess(process);
    }
    if (alertId) {
      const alert = alerts.find((a) => a.id === alertId);
      if (alert) {
        setSelectedAlert(alert);
        if (selectedWorkOrderId === 'all' && alert.workOrderId) {
          setSelectedWorkOrderId(alert.workOrderId);
        }
      }
    }
  }, [searchParams, alerts, workOrders]);

  const handleViewDetail = (alert: QualityAlert) => {
    setSelectedAlert(alert);
    const newParams: Record<string, string> = {};
    if (selectedWorkOrderId !== 'all') newParams.workOrderId = selectedWorkOrderId;
    if (selectedProcess !== 'all') newParams.process = selectedProcess;
    newParams.alertId = alert.id;
    setSearchParams(newParams);
  };

  const handleCloseDetail = () => {
    setSelectedAlert(null);
    const newParams: Record<string, string> = {};
    if (selectedWorkOrderId !== 'all') newParams.workOrderId = selectedWorkOrderId;
    if (selectedProcess !== 'all') newParams.process = selectedProcess;
    setSearchParams(newParams);
  };

  const openHandleModal = () => {
    if (selectedAlert) {
      handleForm.setFieldsValue({
        handler: selectedAlert.handler || '',
        measure: selectedAlert.measure || '',
        remark: selectedAlert.remark || '',
      });
    }
    setHandleModalOpen(true);
  };

  const openCloseModal = () => {
    if (selectedAlert) {
      closeForm.setFieldsValue({
        rechecker: '',
        recheckResult: 'passed',
        remark: '',
      });
    }
    setCloseModalOpen(true);
  };

  const submitHandle = () => {
    handleForm.validateFields().then((values) => {
      if (selectedAlert) {
        handleAlert(selectedAlert.id, values);
        const updated = alerts.find((a) => a.id === selectedAlert.id);
        if (updated) setSelectedAlert({ ...updated, ...values, status: 'processing' });
        message.success('处理记录已保存');
        setHandleModalOpen(false);
        handleForm.resetFields();
      }
    });
  };

  const submitClose = () => {
    closeForm.validateFields().then((values) => {
      if (selectedAlert) {
        closeAlert(selectedAlert.id, values);
        const updated = alerts.find((a) => a.id === selectedAlert.id);
        if (updated) setSelectedAlert({ ...updated, ...values, status: 'closed' });
        message.success('异常已关闭');
        setCloseModalOpen(false);
        closeForm.resetFields();
      }
    });
  };

  const columns = [
    { title: '预警时间', dataIndex: 'time', width: 170 },
    {
      title: '状态',
      dataIndex: 'status',
      width: 90,
      align: 'center' as const,
      render: (v: string) => <Tag color={statusColors[v]}>{statusTexts[v]}</Tag>,
    },
    {
      title: '级别',
      dataIndex: 'level',
      width: 80,
      align: 'center' as const,
      render: (v: string) => <Tag color={levelColors[v] || 'blue'}>{v}</Tag>,
    },
    {
      title: '工序',
      dataIndex: 'process',
      width: 100,
      render: (v: string) => <Tag>{processNames[v] || v}</Tag>,
    },
    { title: '预警内容', dataIndex: 'message' },
    {
      title: '所属工单',
      dataIndex: 'workOrderId',
      width: 150,
      render: (v: string) => {
        const wo = getWorkOrder(v);
        return wo ? (
          <span className="text-blue-600 cursor-pointer hover:underline" onClick={() => window.open(`/workorders/${v}`, '_blank')}>
            {wo.orderNo}
          </span>
        ) : v;
      },
    },
    { title: '处理人', dataIndex: 'handler', width: 100 },
    {
      title: '操作',
      key: 'action',
      width: 100,
      align: 'center' as const,
      render: (_: any, record: QualityAlert) => (
        <a onClick={() => handleViewDetail(record)}>详情</a>
      ),
    },
  ];

  const buildTimelineItems = (alert: QualityAlert) => {
    const items: any[] = [
      {
        color: '#F53F3F',
        dot: <AlertTriangle size={16} />,
        children: (
          <div>
            <p className="font-semibold text-red-600">异常产生</p>
            <p className="text-sm text-gray-500">{alert.time}</p>
            <p className="text-sm mt-1">{alert.message}</p>
          </div>
        ),
      },
    ];

    if (alert.status === 'processing' || alert.status === 'closed') {
      items.push({
        color: '#FF7D00',
        dot: <User size={16} />,
        children: (
          <div>
            <p className="font-semibold text-orange-600">开始处理</p>
            <p className="text-sm text-gray-500">{alert.handleTime}</p>
            <p className="text-sm mt-1">处理人：{alert.handler}</p>
            {alert.measure && <p className="text-sm mt-1">整改措施：{alert.measure}</p>}
          </div>
        ),
      });
    }

    if (alert.status === 'closed') {
      items.push({
        color: alert.recheckResult === 'passed' ? '#00B42A' : '#F53F3F',
        dot: alert.recheckResult === 'passed' ? <CheckCircle size={16} /> : <XCircle size={16} />,
        children: (
          <div>
            <p className={`font-semibold ${alert.recheckResult === 'passed' ? 'text-green-600' : 'text-red-600'}`}>
              复检{alert.recheckResult === 'passed' ? '通过' : '未通过'}
            </p>
            <p className="text-sm text-gray-500">{alert.recheckTime}</p>
            <p className="text-sm mt-1">复检人：{alert.rechecker}</p>
            {alert.remark && <p className="text-sm mt-1">备注：{alert.remark}</p>}
          </div>
        ),
      });
    }

    return items;
  };

  const pendingCount = alerts.filter((a) => a.status === 'pending').length;
  const processingCount = alerts.filter((a) => a.status === 'processing').length;
  const closedCount = alerts.filter((a) => a.status === 'closed').length;

  return (
    <div className="quality-alerts-page">
      <PageHeader
        title="质量异常闭环"
        description="管理所有质量预警，跟踪处理进度，形成异常发现-整改-复检的完整闭环"
        icon={<AlertTriangle size={22} className="text-orange-500" />}
      />

      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={8} md={6}>
          <Card styles={{ body: { padding: 16 } }} style={{ borderRadius: 8, borderLeft: '4px solid #F53F3F' }}>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-500">待处理</div>
                <div className="text-2xl font-bold text-red-500 mt-1">{pendingCount}</div>
              </div>
              <Clock size={28} className="text-red-400" />
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={8} md={6}>
          <Card styles={{ body: { padding: 16 } }} style={{ borderRadius: 8, borderLeft: '4px solid #FF7D00' }}>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-500">处理中</div>
                <div className="text-2xl font-bold text-orange-500 mt-1">{processingCount}</div>
              </div>
              <User size={28} className="text-orange-400" />
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={8} md={6}>
          <Card styles={{ body: { padding: 16 } }} style={{ borderRadius: 8, borderLeft: '4px solid #00B42A' }}>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-500">已关闭</div>
                <div className="text-2xl font-bold text-green-500 mt-1">{closedCount}</div>
              </div>
              <CheckCircle size={28} className="text-green-400" />
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={8} md={6}>
          <Card styles={{ body: { padding: 16 } }} style={{ borderRadius: 8, borderLeft: '4px solid #165DFF' }}>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-500">预警总数</div>
                <div className="text-2xl font-bold text-blue-500 mt-1">{alerts.length}</div>
              </div>
              <FileText size={28} className="text-blue-400" />
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col xs={24} lg={selectedAlert ? 14 : 24}>
          <Card
            title={<span className="font-semibold">异常列表</span>}
            style={{ borderRadius: 8 }}
            styles={{ body: { padding: 16 } }}
            extra={
              <Space>
                {selectedWorkOrderId !== 'all' && (
                  <Tag closable color="blue" onClose={() => {
                    setSelectedWorkOrderId('all');
                    const newParams: Record<string, string> = {};
                    if (selectedProcess !== 'all') newParams.process = selectedProcess;
                    if (selectedAlert) newParams.alertId = selectedAlert.id;
                    setSearchParams(newParams);
                  }}>
                    工单: {getWorkOrder(selectedWorkOrderId)?.orderNo || selectedWorkOrderId}
                  </Tag>
                )}
                <Select
                  value={selectedStatus}
                  onChange={setSelectedStatus}
                  style={{ width: 110 }}
                  options={[
                    { label: '全部状态', value: 'all' },
                    { label: '待处理', value: 'pending' },
                    { label: '处理中', value: 'processing' },
                    { label: '已关闭', value: 'closed' },
                  ]}
                />
                <Select
                  value={selectedProcess}
                  onChange={(v) => {
                    setSelectedProcess(v);
                    const newParams: Record<string, string> = {};
                    if (selectedWorkOrderId !== 'all') newParams.workOrderId = selectedWorkOrderId;
                    if (v !== 'all') newParams.process = v;
                    if (selectedAlert) newParams.alertId = selectedAlert.id;
                    setSearchParams(newParams);
                  }}
                  style={{ width: 120 }}
                  options={[
                    { label: '全部工序', value: 'all' },
                    ...Object.entries(processNames).map(([k, v]) => ({ label: v, value: k })),
                  ]}
                />
                <Select
                  value={selectedModel}
                  onChange={(v) => {
                    setSelectedModel(v);
                    if (v !== 'all') {
                      setSelectedWorkOrderId('all');
                    }
                  }}
                  style={{ width: 120 }}
                  options={[{ label: '全部型号', value: 'all' }, ...allModels.map((m) => ({ label: m, value: m }))]}
                />
              </Space>
            }
          >
            <Table
              columns={columns}
              dataSource={filteredAlerts}
              rowKey="id"
              pagination={{ pageSize: 8, showSizeChanger: true, showTotal: (total) => `共 ${total} 条` }}
              size="middle"
              onRow={(record) => ({
                onClick: () => handleViewDetail(record),
                style: { cursor: 'pointer' },
              })}
            />
          </Card>
        </Col>

        {selectedAlert && (
          <Col xs={24} lg={10}>
            <Card
              title={<span className="font-semibold">异常详情</span>}
              style={{ borderRadius: 8 }}
              styles={{ body: { padding: 16 } }}
              extra={
                <Button type="text" onClick={handleCloseDetail}>
                  关闭
                </Button>
              }
            >
              <Descriptions column={1} size="small" className="mb-4">
                <Descriptions.Item label="预警级别">
                  <Tag color={levelColors[selectedAlert.level] || 'blue'}>{selectedAlert.level}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="状态">
                  <Tag color={statusColors[selectedAlert.status]}>{statusTexts[selectedAlert.status]}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="所属工序">{processNames[selectedAlert.process] || selectedAlert.process}</Descriptions.Item>
                <Descriptions.Item label="所属工单">
                  {(() => {
                    const wo = getWorkOrder(selectedAlert.workOrderId);
                    return wo ? `${wo.orderNo} (${wo.gearModel})` : selectedAlert.workOrderId;
                  })()}
                </Descriptions.Item>
                <Descriptions.Item label="异常参数">{selectedAlert.field}</Descriptions.Item>
                <Descriptions.Item label="当前值">{selectedAlert.value}</Descriptions.Item>
                <Descriptions.Item label="预警内容">{selectedAlert.message}</Descriptions.Item>
                {selectedAlert.handler && <Descriptions.Item label="处理人">{selectedAlert.handler}</Descriptions.Item>}
                {selectedAlert.measure && <Descriptions.Item label="整改措施">{selectedAlert.measure}</Descriptions.Item>}
                {selectedAlert.recheckResult && (
                  <Descriptions.Item label="复检结果">
                    {selectedAlert.recheckResult === 'passed' ? (
                      <Tag color="green">复检通过</Tag>
                    ) : (
                      <Tag color="red">复检未通过</Tag>
                    )}
                  </Descriptions.Item>
                )}
              </Descriptions>

              <div className="mb-4">
                <h4 className="text-sm font-semibold mb-3 text-gray-700">处理时间轴</h4>
                <Timeline items={buildTimelineItems(selectedAlert)} />
              </div>

              <Space className="w-full" style={{ justifyContent: 'flex-end' }}>
                {selectedAlert.status === 'pending' && (
                  <Button type="primary" onClick={openHandleModal}>
                    开始处理
                  </Button>
                )}
                {selectedAlert.status === 'processing' && (
                  <>
                    <Button onClick={openHandleModal}>修改处理</Button>
                    <Button type="primary" onClick={openCloseModal}>
                      复检关闭
                    </Button>
                  </>
                )}
                {selectedAlert.status === 'closed' && (
                  <Button onClick={() => {
                    if (selectedAlert) {
                      useGearStore.getState().updateAlertStatus(selectedAlert.id, 'processing');
                      const updated = alerts.find((a) => a.id === selectedAlert.id);
                      if (updated) setSelectedAlert({ ...updated, status: 'processing' });
                      message.success('已重新打开');
                    }
                  }}>
                    重新打开
                  </Button>
                )}
              </Space>
            </Card>
          </Col>
        )}
      </Row>

      <Modal
        title="处理异常"
        open={handleModalOpen}
        onOk={submitHandle}
        onCancel={() => setHandleModalOpen(false)}
        okText="保存处理"
        cancelText="取消"
        width={520}
      >
        <Form form={handleForm} layout="vertical">
          <Form.Item name="handler" label="处理人" rules={[{ required: true, message: '请输入处理人' }]}>
            <Input placeholder="请输入处理人姓名" />
          </Form.Item>
          <Form.Item name="measure" label="整改措施" rules={[{ required: true, message: '请输入整改措施' }]}>
            <Input.TextArea rows={3} placeholder="请描述整改措施" />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={2} placeholder="可选备注信息" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="复检关闭"
        open={closeModalOpen}
        onOk={submitClose}
        onCancel={() => setCloseModalOpen(false)}
        okText="确认关闭"
        cancelText="取消"
        width={520}
      >
        <Form form={closeForm} layout="vertical">
          <Form.Item name="rechecker" label="复检人" rules={[{ required: true, message: '请输入复检人' }]}>
            <Input placeholder="请输入复检人姓名" />
          </Form.Item>
          <Form.Item name="recheckResult" label="复检结果" rules={[{ required: true, message: '请选择复检结果' }]}>
            <Select
              options={[
                { label: '复检通过', value: 'passed' },
                { label: '复检未通过', value: 'failed' },
              ]}
            />
          </Form.Item>
          <Form.Item name="remark" label="复检备注">
            <Input.TextArea rows={2} placeholder="可选复检备注" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default QualityAlerts;
