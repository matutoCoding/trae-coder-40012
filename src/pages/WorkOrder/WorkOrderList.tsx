import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Modal, Form, Input, InputNumber, Select, message, Button, Space, Tag, Progress, Tooltip } from 'antd';
import { ClipboardList, Plus, Eye, Trash2, FileText } from 'lucide-react';
import { useGearStore } from '@/store';
import { PageHeader, StatusTag } from '@/components/common/PageComponents';

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

const WorkOrderList: React.FC = () => {
  const navigate = useNavigate();
  const { workOrders, addWorkOrder, deleteWorkOrder, blankRecords, hobbingRecords, shavingRecords, carburizingRecords, grindingRecords, inspectionRecords, matchingRecords } = useGearStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  const handleSubmit = () => {
    form.validateFields().then((values) => {
      addWorkOrder(values);
      message.success('工单创建成功');
      setIsModalOpen(false);
      form.resetFields();
    });
  };

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: '确认删除工单？',
      content: '删除后关联的所有工序记录也将被删除，此操作不可恢复。',
      okText: '确认删除',
      cancelText: '取消',
      okButtonProps: { danger: true },
      onOk: () => {
        deleteWorkOrder(id);
        message.success('工单已删除');
      },
    });
  };

  const columns = [
    {
      title: '工单号',
      dataIndex: 'orderNo',
      width: 160,
      render: (v: string) => <span className="font-mono text-xs text-blue-600">{v}</span>,
    },
    { title: '产品名称', dataIndex: 'productName', width: 160 },
    { title: '齿轮型号', dataIndex: 'gearModel', width: 100 },
    { title: '数量', dataIndex: 'quantity', width: 70, align: 'center' as const },
    {
      title: '工序进度',
      dataIndex: 'processProgress',
      width: 260,
      render: (progress: Record<string, boolean>) => {
        const completed = Object.values(progress).filter(Boolean).length;
        const percent = Math.round((completed / 7) * 100);
        return (
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gray-500">{completed}/7 工序</span>
              <span className="text-xs font-semibold text-blue-600">{percent}%</span>
            </div>
            <Progress
              percent={percent}
              size="small"
              showInfo={false}
              strokeColor={{ from: '#4080FF', to: '#165DFF' }}
            />
            <div className="flex gap-0.5 mt-1.5">
              {processOrder.map((p) => (
                <Tooltip key={p} title={processNames[p]}>
                  <div
                    className="w-5 h-5 rounded flex items-center justify-center text-[10px] font-medium transition-colors"
                    style={{
                      background: progress[p] ? '#165DFF' : '#F2F3F5',
                      color: progress[p] ? '#fff' : '#86909C',
                    }}
                  >
                    {processNames[p][0]}
                  </div>
                </Tooltip>
              ))}
            </div>
          </div>
        );
      },
    },
    { title: '状态', dataIndex: 'status', width: 100, align: 'center' as const, render: (s: string) => <StatusTag status={s} /> },
    { title: '创建时间', dataIndex: 'createTime', width: 170 },
    {
      title: '操作',
      key: 'action',
      width: 180,
      fixed: 'right' as const,
      render: (_: any, record: any) => (
        <Space size={4}>
          <Button type="link" size="small" icon={<Eye size={14} />} onClick={() => navigate(`/workorders/${record.id}`)}>
            详情
          </Button>
          <Button type="link" size="small" danger icon={<Trash2 size={14} />} onClick={() => handleDelete(record.id)}>
            删除
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="workorder-list-page">
      <PageHeader
        title="工单管理"
        description="生产工单全生命周期管理与工序追溯"
        icon={<ClipboardList size={22} />}
        onAdd={() => setIsModalOpen(true)}
        addText="创建工单"
      />

      <div className="bg-white rounded-lg shadow-sm border border-gray-100">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText size={16} className="text-gray-500" />
            <span className="font-semibold text-gray-800">工单列表</span>
            <Tag color="blue" style={{ marginLeft: 8 }}>共 {workOrders.length} 条</Tag>
          </div>
          <Space>
            <Select
              defaultValue="all"
              style={{ width: 140 }}
              options={[
                { label: '全部状态', value: 'all' },
                { label: '待开始', value: 'pending' },
                { label: '生产中', value: 'processing' },
                { label: '已完成', value: 'completed' },
                { label: '已报废', value: 'rejected' },
              ]}
            />
          </Space>
        </div>
        <Table
          columns={columns}
          dataSource={workOrders}
          rowKey="id"
          pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (t) => `共 ${t} 条工单` }}
          scroll={{ x: 1200 }}
          onRow={(record) => ({
            onClick: (e) => {
              if (!(e.target as HTMLElement).closest('button, a')) {
                navigate(`/workorders/${record.id}`);
              }
            },
            style: { cursor: 'pointer' },
          })}
        />
      </div>

      <Modal
        title={<span className="font-semibold">创建新工单</span>}
        open={isModalOpen}
        onOk={handleSubmit}
        onCancel={() => setIsModalOpen(false)}
        okText="创建"
        cancelText="取消"
      >
        <Form form={form} layout="vertical">
          <Form.Item name="productName" label="产品名称" rules={[{ required: true, message: '请输入产品名称' }]}>
            <Input placeholder="如：主动圆柱齿轮" />
          </Form.Item>
          <div style={{ display: 'flex', gap: 16 }}>
            <Form.Item name="gearModel" label="齿轮型号" rules={[{ required: true }]} style={{ flex: 1 }}>
              <Input placeholder="如：M4Z30" />
            </Form.Item>
            <Form.Item name="quantity" label="生产数量" rules={[{ required: true }]} style={{ flex: 1 }}>
              <InputNumber min={1} className="!w-full" placeholder="如 50" />
            </Form.Item>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default WorkOrderList;
