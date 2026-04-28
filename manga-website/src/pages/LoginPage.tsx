import { Link, useNavigate } from 'react-router-dom';
import { Form, Input, Button, Card, Typography, message, Divider, Grid } from 'antd';
import { MailOutlined, LockOutlined } from '@ant-design/icons';
import { useAuthStore } from '../stores/authStore';
import type { LoginForm as LoginFormType } from '../types';

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

export default function LoginPage() {
  const navigate = useNavigate();
  const screens = useBreakpoint();
  const isMobile = !screens.md;
  const login = useAuthStore((s) => s.login);
  const [form] = Form.useForm();

  const onFinish = (values: LoginFormType) => {
    const result = login(values.email, values.password);
    if (result.success) {
      message.success(result.message);
      navigate('/', { replace: true });
    } else {
      message.error(result.message);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 200px)', padding: isMobile ? '0 16px' : 0 }}>
      <Card
        style={{ width: '100%', maxWidth: 400, borderRadius: 12, boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}
        styles={{ body: { padding: isMobile ? '24px 20px' : '40px 32px' } }}
      >
        <div style={{ textAlign: 'center', marginBottom: isMobile ? 24 : 32 }}>
          <span style={{ fontSize: isMobile ? 36 : 48 }}>📚</span>
          <Title level={isMobile ? 4 : 3} style={{ marginTop: 12, marginBottom: 4 }}>
            欢迎回来
          </Title>
          <Text type="secondary">使用邮箱登录您的漫画平台账号</Text>
        </div>

        <Form form={form} layout="vertical" onFinish={onFinish} autoComplete="off" size={isMobile ? 'middle' : 'large'}>
          <Form.Item name="email" rules={[
            { required: true, message: '请输入邮箱' },
            { type: 'email', message: '请输入有效的邮箱地址' },
          ]}>
            <Input prefix={<MailOutlined />} placeholder="邮箱" />
          </Form.Item>
          <Form.Item name="password" rules={[{ required: true, message: '请输入密码' }]}>
            <Input.Password prefix={<LockOutlined />} placeholder="密码" />
          </Form.Item>
          <Form.Item style={{ marginBottom: 12 }}>
            <Button type="primary" htmlType="submit" block>登录</Button>
          </Form.Item>
        </Form>

        <Divider plain style={{ fontSize: 13, color: '#999' }}>还没有账号？</Divider>
        <Link to="/register">
          <Button block style={{ borderRadius: 6 }}>立即注册</Button>
        </Link>
      </Card>
    </div>
  );
}
