import { useEffect, useState } from 'react';
import { Card, Typography, Space, Table, Tag, Statistic, Row, Col, Empty, Button, Grid } from 'antd';
import { ArrowLeftOutlined, DollarOutlined, LineChartOutlined, TrophyOutlined, CalendarOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useEarningStore } from '../stores/earningStore';
import { useMangaStore } from '../stores/mangaStore';
import type { AIManga } from '../types';

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

export default function CreatorEarningsPage() {
  const navigate = useNavigate();
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  const user = useAuthStore((s) => s.user);
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const mangas = useMangaStore((s) => s.filteredMangas);
  const loadEarnings = useEarningStore((s) => s.loadEarnings);
  const earnings = useEarningStore((s) => s.earnings);
  const totalPoints = useEarningStore((s) => s.totalPoints);

  const [loading, setLoading] = useState(true);
  const [myMangas, setMyMangas] = useState<AIManga[]>([]);

  // 模拟数据：如果没有真实收益记录，生成一些假数据
  const hasRealEarnings = earnings.length > 0;
  const [demoEarnings, setDemoEarnings] = useState<typeof earnings>([]);

  useEffect(() => {
    if (!isLoggedIn) { navigate('/login'); return; }
    if (!user) return;

    const myWorks = mangas.filter((m) => m.uploadedBy === user.nickname || m.author === user.nickname);
    setMyMangas(myWorks);
    loadEarnings(user.nickname);

    // 如果没有真实收益，生成模拟数据展示效果
    if (!hasRealEarnings && myWorks.length > 0) {
      const demo = myWorks.map((manga, idx) => [
        {
          id: `demo-${manga.id}-1`,
          mangaId: manga.id,
          mangaTitle: manga.title,
          authorNickname: user.nickname,
          payerNickname: '小明用户',
          points: Math.floor((manga.pricePoints || 10) * 0.7),
          createdAt: new Date(Date.now() - idx * 86400000).toISOString(),
        },
        {
          id: `demo-${manga.id}-2`,
          mangaId: manga.id,
          mangaTitle: manga.title,
          authorNickname: user.nickname,
          payerNickname: '动漫爱好者',
          points: Math.floor((manga.pricePoints || 10) * 0.7),
          createdAt: new Date(Date.now() - idx * 86400000 - 3600000).toISOString(),
        },
      ]).flat();
      setDemoEarnings(demo);
    }

    setLoading(false);
  }, [user, isLoggedIn]);

  const displayEarnings = hasRealEarnings ? earnings : demoEarnings;
  const displayTotalPoints = hasRealEarnings ? totalPoints : demoEarnings.reduce((s, e) => s + e.points, 0);

  // 按作品分组统计
  const mangaEarningsMap = new Map<string, { count: number; points: number }>();
  displayEarnings.forEach((e) => {
    const existing = mangaEarningsMap.get(e.mangaId);
    if (existing) {
      existing.count += 1;
      existing.points += e.points;
    } else {
      mangaEarningsMap.set(e.mangaId, { count: 1, points: e.points });
    }
  });

  const columns = [
    {
      title: '漫画标题',
      dataIndex: 'mangaTitle',
      key: 'mangaTitle',
      ellipsis: true,
    },
    {
      title: '付费用户',
      dataIndex: 'payerNickname',
      key: 'payerNickname',
      width: isMobile ? 100 : 150,
    },
    {
      title: '收益',
      dataIndex: 'points',
      key: 'points',
      width: 100,
      render: (points: number) => (
        <Tag color="orange" style={{ fontSize: 14 }}>+{points} 点</Tag>
      ),
    },
    {
      title: '时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: isMobile ? 120 : 180,
      render: (date: string) => new Date(date).toLocaleString('zh-CN', {
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      }),
    },
  ];

  if (!isLoggedIn) return null;

  return (
    <div>
      <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} type="text" style={{ marginBottom: 16 }}>
        返回
      </Button>

      <Title level={isMobile ? 4 : 3} style={{ marginBottom: 24 }}>
        <DollarOutlined style={{ marginRight: 8, color: '#fa8c16' }} />
        创作者收益面板
      </Title>

      {/* 总览统计 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="累计收益"
              value={displayTotalPoints}
              suffix="点数"
              prefix={<DollarOutlined />}
              valueStyle={{ color: '#fa8c16' }}
            />
            <Text type="secondary" style={{ fontSize: 12 }}>
              ≈ ¥{(displayTotalPoints / 10).toFixed(2)}（10点=1元）
            </Text>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="付费订单"
              value={displayEarnings.length}
              suffix="笔"
              prefix={<LineChartOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
            <Text type="secondary" style={{ fontSize: 12 }}>
              来自 {new Set(displayEarnings.map((e) => e.payerNickname)).size} 位读者
            </Text>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="作品数"
              value={myMangas.length}
              suffix="部"
              prefix={<TrophyOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
            <Text type="secondary" style={{ fontSize: 12 }}>
              其中 {mangaEarningsMap.size} 部有收益
            </Text>
          </Card>
        </Col>
      </Row>

      {/* 各作品收益统计 */}
      {mangaEarningsMap.size > 0 && (
        <Card
          title={<Space><TrophyOutlined /> 作品收益排行</Space>}
          style={{ marginBottom: 24 }}
        >
          <Space direction="vertical" style={{ width: '100%' }}>
            {Array.from(mangaEarningsMap.entries())
              .sort((a, b) => b[1].points - a[1].points)
              .map(([mangaId, data], index) => {
                const manga = myMangas.find((m) => m.id === mangaId);
                return (
                  <Card
                    key={mangaId}
                    size="small"
                    style={{ borderRadius: 8 }}
                  >
                    <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                      <Space>
                        <Tag color={index === 0 ? 'gold' : index === 1 ? 'silver' : 'default'}>
                          #{index + 1}
                        </Tag>
                        <Text strong>{manga?.title || '未知作品'}</Text>
                      </Space>
                      <Space>
                        <Text type="secondary">
                          <CalendarOutlined /> {data.count} 笔
                        </Text>
                        <Tag color="orange" style={{ fontSize: 14 }}>
                          +{data.points} 点
                        </Tag>
                      </Space>
                    </Space>
                  </Card>
                );
              })}
          </Space>
        </Card>
      )}

      {/* 收益明细 */}
      <Card title={<Space><LineChartOutlined /> 收益明细</Space>}>
        {loading ? (
          <Empty description="加载中..." />
        ) : displayEarnings.length === 0 ? (
          <Empty
            description="暂无收益"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          >
            <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
              发布付费漫画作品，等待读者解锁即可获得收益
            </Text>
          </Empty>
        ) : (
          <Table
            columns={columns}
            dataSource={displayEarnings}
            rowKey="id"
            pagination={{ pageSize: 10 }}
            size={isMobile ? 'small' : 'middle'}
          />
        )}
      </Card>

      {!hasRealEarnings && displayEarnings.length > 0 && (
        <Text type="secondary" style={{ display: 'block', marginTop: 16, textAlign: 'center', fontSize: 12 }}>
          ℹ️ 当前显示的是模拟数据，当有真实付费订单后将显示实际收益
        </Text>
      )}
    </div>
  );
}
