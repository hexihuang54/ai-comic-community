import { Card, Button, Typography, Space, Tag, Divider, Grid, message } from 'antd';
import { LockOutlined, CheckCircleOutlined, ThunderboltOutlined } from '@ant-design/icons';
import { useState } from 'react';
import type { AIManga } from '../types';
import { useAuthStore } from '../stores/authStore';

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

interface PaywallOverlayProps {
  manga: AIManga;
  onUnlock: () => void;
  onBack: () => void;
}

export default function PaywallOverlay({ manga, onUnlock, onBack }: PaywallOverlayProps) {
  const screens = useBreakpoint();
  const isMobile = !screens.md;
  const { user, getCreditBalance, spendPointsForUnlock, hasEnoughCredit } = useAuthStore();
  const [loading, setLoading] = useState(false);

  const price = manga.pricePoints || 10;
  const freePages = manga.freePages || 3;
  const paidPages = manga.pages.length - freePages;
  const hasEnough = hasEnoughCredit(price);

  const handlePay = async () => {
    if (!user) {
      message.warning('请先登录');
      return;
    }
    setLoading(true);
    const result = spendPointsForUnlock(price);
    if (result.success) {
      message.success(result.message);
      onUnlock();
    } else {
      message.error(result.message);
    }
    setLoading(false);
  };

  return (
    <Card
      style={{
        borderRadius: 16,
        textAlign: 'center',
        maxWidth: 500,
        margin: '0 auto',
        background: 'linear-gradient(135deg, #fff7e6 0%, #f0f5ff 100%)',
        border: '1px solid #ffd591',
      }}
      styles={{ body: { padding: isMobile ? 20 : 32 } }}
    >
      <div style={{ marginBottom: 16 }}>
        <LockOutlined style={{ fontSize: 48, color: '#faad14' }} />
      </div>
      <Title level={isMobile ? 4 : 3} style={{ marginBottom: 8 }}>
        🔒 付费内容
      </Title>
      <Text type="secondary">
        《{manga.title}》的后续内容需要付费解锁
      </Text>

      <div style={{ margin: '20px 0' }}>
        <Space wrap size="middle" direction="vertical" style={{ width: '100%' }}>
          <div>
            <Tag color="green" style={{ fontSize: 14, padding: '4px 12px' }}>
              <CheckCircleOutlined /> 免费部分：第 1 - {freePages} 页（已读）
            </Tag>
          </div>
          <div>
            <Tag color="gold" style={{ fontSize: 14, padding: '4px 12px' }}>
              <LockOutlined /> 付费部分：第 {freePages + 1} - {manga.pages.length} 页（共 {paidPages} 页）
            </Tag>
          </div>
        </Space>
      </div>

      <Divider />

      <div style={{ marginBottom: 20 }}>
        <Text strong style={{ fontSize: isMobile ? 28 : 36, color: '#fa8c16' }}>
          {price}
        </Text>
        <Text type="secondary" style={{ marginLeft: 4 }}>
          点数
        </Text>
        <div style={{ marginTop: 4 }}>
          <Text type="secondary" style={{ fontSize: 12 }}>
            当前余额：{getCreditBalance()} 点数
          </Text>
        </div>
      </div>

      <Space direction="vertical" style={{ width: '100%' }}>
        <Button
          type="primary"
          icon={<ThunderboltOutlined />}
          loading={loading}
          onClick={handlePay}
          disabled={!hasEnough}
          size={isMobile ? 'middle' : 'large'}
          block
          style={{
            height: isMobile ? 48 : 56,
            fontSize: isMobile ? 16 : 18,
            background: hasEnough ? '#fa8c16' : '#d9d9d9',
            borderColor: hasEnough ? '#fa8c16' : '#d9d9d9',
            borderRadius: 12,
          }}
        >
          {hasEnough ? '立即解锁阅读' : '点数不足，去充值'}
        </Button>

        <Button size={isMobile ? 'middle' : 'large'} block onClick={onBack} style={{ borderRadius: 12 }}>
          返回
        </Button>
      </Space>

      {!hasEnough && (
        <Text type="secondary" style={{ display: 'block', marginTop: 12, fontSize: 12 }}>
          提示：每日签到可获得 +2 点数，也可通过充值获取更多点数
        </Text>
      )}
    </Card>
  );
}
