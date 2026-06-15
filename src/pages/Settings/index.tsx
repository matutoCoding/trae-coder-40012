import { Card, List, Switch, Avatar, Form, Input, Button, Select, Row, Col, Divider, message, Tag } from 'antd';
import { Settings, User, Bell, Shield, Database, Palette, Languages, Save } from 'lucide-react';
import { PageHeader } from '@/components/common/PageComponents';

const SettingsPage: React.FC = () => {
  const [form] = Form.useForm();

  const handleSave = () => {
    message.success('设置已保存');
  };

  const settingsMenu = [
    { icon: User, title: '账号信息', desc: '修改个人资料和密码' },
    { icon: Bell, title: '通知设置', desc: '管理消息和预警通知' },
    { icon: Shield, title: '权限管理', desc: '角色与数据权限配置' },
    { icon: Database, title: '数据管理', desc: '数据备份与导入导出' },
    { icon: Palette, title: '主题外观', desc: '界面主题和显示选项' },
    { icon: Languages, title: '语言地区', desc: '语言和时间格式' },
  ];

  return (
    <div className="settings-page">
      <PageHeader
        title="系统设置"
        description="系统参数配置、用户管理和个性化设置"
        icon={<Settings size={22} />}
      />

      <Row gutter={16}>
        <Col xs={24} lg={7}>
          <Card style={{ borderRadius: 8 }} bodyStyle={{ padding: 0 }}>
            <List
              dataSource={settingsMenu}
              renderItem={(item, index) => {
                const IconComp = item.icon;
                return (
                  <List.Item
                    className={`!px-5 !py-4 cursor-pointer hover:bg-blue-50/50 transition-colors ${index === 0 ? 'bg-blue-50 border-l-4 border-blue-500' : ''}`}
                  >
                    <List.Item.Meta
                      avatar={
                        <Avatar
                          size={40}
                          icon={<IconComp size={18} />}
                          style={{
                            background: index === 0 ? '#165DFF' : '#F2F3F5',
                            color: index === 0 ? '#fff' : '#4E5969',
                          }}
                        />
                      }
                      title={<span className="font-medium text-gray-800">{item.title}</span>}
                      description={<span className="text-xs text-gray-400">{item.desc}</span>}
                    />
                  </List.Item>
                );
              }}
            />
          </Card>
        </Col>

        <Col xs={24} lg={17}>
          <Card title={<span className="font-semibold">基础设置</span>} style={{ borderRadius: 8 }}>
            <Form
              form={form}
              layout="vertical"
              initialValues={{
                notifyEmail: true,
                notifySound: false,
                notifyBrowser: true,
                autoBackup: true,
              }}
            >
              <Divider orientation="left" className="!my-3"><span className="text-xs text-gray-500">个人信息</span></Divider>
              <Row gutter={24}>
                <Col span={12}>
                  <Form.Item label="姓名" name="userName">
                    <Input defaultValue="管理员" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="部门" name="department">
                    <Select
                      defaultValue="生产管理部"
                      options={[
                        { label: '生产管理部', value: '生产管理部' },
                        { label: '工艺技术部', value: '工艺技术部' },
                        { label: '质量检测部', value: '质量检测部' },
                        { label: '设备维护部', value: '设备维护部' },
                      ]}
                    />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={24}>
                <Col span={12}>
                  <Form.Item label="联系邮箱" name="email">
                    <Input defaultValue="admin@gearfactory.com" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="联系电话" name="phone">
                    <Input defaultValue="138-0000-0001" />
                  </Form.Item>
                </Col>
              </Row>

              <Divider orientation="left" className="!my-3"><span className="text-xs text-gray-500">系统选项</span></Divider>
              <Form.Item label="系统名称" name="sysName">
                <Input defaultValue="齿轮加工厂传动齿轮业务管理系统" />
              </Form.Item>

              <Row gutter={24}>
                <Col span={12}>
                  <Form.Item label="默认工单排序" name="orderSort">
                    <Select
                      defaultValue="time_desc"
                      options={[
                        { label: '创建时间（最新在前）', value: 'time_desc' },
                        { label: '创建时间（最早在前）', value: 'time_asc' },
                        { label: '更新时间', value: 'update_desc' },
                        { label: '状态排序', value: 'status' },
                      ]}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="页面记录条数" name="pageSize">
                    <Select
                      defaultValue={10}
                      options={[
                        { label: '8 条/页', value: 8 },
                        { label: '10 条/页', value: 10 },
                        { label: '20 条/页', value: 20 },
                        { label: '50 条/页', value: 50 },
                      ]}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Divider orientation="left" className="!my-3"><span className="text-xs text-gray-500">通知与预警</span></Divider>
              <div className="space-y-4">
                <Form.Item name="notifyEmail" valuePropName="checked" className="!mb-0">
                  <div className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded">
                    <div>
                      <div className="text-sm font-medium">邮件通知</div>
                      <div className="text-xs text-gray-400">质量异常时发送邮件提醒</div>
                    </div>
                    <Switch />
                  </div>
                </Form.Item>
                <Form.Item name="notifySound" valuePropName="checked" className="!mb-0">
                  <div className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded">
                    <div>
                      <div className="text-sm font-medium">声音提醒</div>
                      <div className="text-xs text-gray-400">产生预警时播放提示音</div>
                    </div>
                    <Switch />
                  </div>
                </Form.Item>
                <Form.Item name="notifyBrowser" valuePropName="checked" className="!mb-0">
                  <div className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded">
                    <div>
                      <div className="text-sm font-medium">浏览器推送</div>
                      <div className="text-xs text-gray-400">通过浏览器发送桌面通知</div>
                    </div>
                    <Switch />
                  </div>
                </Form.Item>
                <Form.Item name="autoBackup" valuePropName="checked" className="!mb-0">
                  <div className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded">
                    <div>
                      <div className="text-sm font-medium">自动数据备份</div>
                      <div className="text-xs text-gray-400">每日凌晨自动备份系统数据</div>
                    </div>
                    <Switch />
                  </div>
                </Form.Item>
              </div>

              <Divider orientation="left" className="!my-4"><span className="text-xs text-gray-500">系统状态</span></Divider>
              <div className="flex items-center gap-3 mb-4 flex-wrap">
                <Tag color="green">✓ 数据库连接正常</Tag>
                <Tag color="green">✓ 本地存储 12.3% 使用率</Tag>
                <Tag color="blue">版本 v1.0.0</Tag>
                <Tag color="purple">构建 20260615</Tag>
              </div>

              <div className="flex justify-end pt-4">
                <Button
                  type="primary"
                  icon={<Save size={14} />}
                  onClick={handleSave}
                  size="large"
                  style={{ background: '#165DFF' }}
                >
                  保存设置
                </Button>
              </div>
            </Form>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default SettingsPage;
