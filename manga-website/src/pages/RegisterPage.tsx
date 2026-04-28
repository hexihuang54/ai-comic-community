import { Link, useNavigate } from 'react-router-dom';
import { Form, Input, Button, Card, Typography, message, Divider, Grid } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import { useAuthStore } from '../stores/authStore';
import type { RegisterForm as RegisterFormType } from '../types';

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

export default function RegisterPage() {
  const navigate = useNavigate();
  const screens = useBreakpoint();
  const isMobile = !screens.md;
  const register = useAuthStore((s) => s.register);
  const [form] = Form.useForm();

  const onFinish = (values: RegisterFormType) => {
    const result = register(values.nickname, values.email, values.password);
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
          <span style={{ fontSize: isMobile ? 36 : 48 }}>✨</span>
          <Title level={isMobile ? 4 : 3} style={{ marginTop: 12, marginBottom: 4 }}>
            注册账号
          </Title>
          <Text type="secondary">使用邮箱注册，设置你的昵称</Text>
        </div>

        <Form form={form} layout="vertical" onFinish={onFinish} autoComplete="off" size={isMobile ? 'middle' : 'large'}>
          <Form.Item name="email" rules={[
            { required: true, message: '请输入邮箱' },
            { type: 'email', message: '请输入有效的邮箱地址' },
          ]}>
            <Input prefix={<MailOutlined />} placeholder="邮箱（用于登录）" />
          </Form.Item>
          <Form.Item name="nickname" rules={[
            { required: true, message: '请输入昵称' },
            { min: 2, message: '昵称至少2个字符' },
            { max: 16, message: '昵称最多16个字符' },
          ]}>
            <Input prefix={<UserOutlined />} placeholder="昵称" />
          </Form.Item>
          <Form.Item name="password" rules={[
            { required: true, message: '请输入密码' },
            { min: 6, message: '密码至少6个字符' },
          ]}>
            <Input.Password prefix={<LockOutlined />} placeholder="密码" />
          </Form.Item>
          <Form.Item name="confirmPassword" dependencies={['password']} rules={[
            { required: true, message: '请确认密码' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('password') === value) { return Promise.resolve(); }
                return Promise.reject(new Error('两次密码输入不一致'));
              },
            }),
          ]}>
            <Input.Password prefix={<LockOutlined />} placeholder="确认密码" />
          </Form.Item>
          <Form.Item style={{ marginBottom: 12 }}>
            <Button type="primary" htmlType="submit" block>注册</Button>
          </Form.Item>
        </Form>

        <Divider plain style={{ fontSize: 13, color: '#999' }}>已有账号？</Divider>
        <Link to="/login">
          <Button block style={{ borderRadius: 6 }}>立即登录</Button>
        </Link>
      </Card>
    </div>
  );
}
