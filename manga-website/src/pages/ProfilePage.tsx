import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Descriptions, Typography, List, Button, Popconfirm, message, Empty, Tag, Statistic, Row, Col, Grid, Space } from 'antd';
import {
  DeleteOutlined, ReadOutlined, UserOutlined, MailOutlined,
  CalendarOutlined, FileTextOutlined, CoffeeOutlined, DollarOutlined,
  ShareAltOutlined, BarChartOutlined, EditOutlined,
} from '@ant-design/icons';
import { useAuthStore } from '../stores/authStore';
import { getUserMangas, deleteManga } from '../mock/manga';
import { useMangaStore } from '../stores/mangaStore';
import ShareModal from '../components/ShareModal';
import type { AIManga } from '../types';

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

const auditTagMap: Record<string, { color: string; label: string }> = {
  approved: { color: 'green', label: '已审核' },
  pending: { color: 'orange', label: '审核中' },
  rejected: { color: 'red', label: '未通过' },
};

export default function ProfilePage() {
  const navigate = useNavigate();
  const screens = useBreakpoint();
  const isMobile = !screens.md;
  const user = useAuthStore((s) => s.user);
  const { getFreeRemaining, getCreditBalance } = useAuthStore();
  const refreshMangas = useMangaStore((s) => s.refreshMangas);
  const [userMangas, setUserMangas] = useState<AIManga[]>([]);
  const [loading, setLoading] = useState(true);
  const [shareOpen, setShareOpen] = useState(false);
  const [shareManga, setShareManga] = useState<AIManga | null>(null);

  useEffect(() => {
    if (user) {
      setUserMangas(getUserMangas(user.nickname));
      setLoading(false);
    }
  }, [user]);

  const handleDelete = (id: string) => {
    const result = deleteManga(id);
    if (result) {
      message.success('删除成功');
      setUserMangas((prev) => prev.filter((m) => m.id !== id));
      refreshMangas();
    } else {
      message.error('删除失败');
    }
  };

  const handleShare = (manga: AIManga) => {
    setShareManga(manga);
    setShareOpen(true);
  };

  if (!user) return null;

  return (
    <div>
      <Title level={isMobile ? 4 : 2} style={{ marginBottom: isMobile ? 16 : 24 }}>
        个人中心
      </Title>

      {/* 用户信息卡片 */}
      <Card
        style={{ marginBottom: isMobile ? 20 : 32, borderRadius: 12 }}
        styles={{ body: { padding: isMobile ? '20px' : '32px' } }}
      >
        <Descriptions
          title={
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: isMobile ? 28 : 36 }}>👤</span>
              <span>用户信息</span>
            </div>
          }
          column={1}
          labelStyle={{ fontWeight: 500, color: '#666', width: isMobile ? 80 : 120 }}
        >
          <Descriptions.Item label={<><UserOutlined /> 昵称</>}>
            <Text strong style={{ fontSize: isMobile ? 14 : 16 }}>{user.nickname}</Text>
          </Descriptions.Item>
          <Descriptions.Item label={<><MailOutlined /> 邮箱</>}>
            {user.email}
          </Descriptions.Item>
          <Descriptions.Item label={<><CalendarOutlined /> 注册时间</>}>
            {isMobile ? new Date(user.createdAt).toLocaleDateString('zh-CN') : new Date(user.createdAt).toLocaleString('zh-CN')}
          </Descriptions.Item>
        </Descriptions>

        {/* 资源概览 */}
        <div style={{ marginTop: isMobile ? 16 : 24, padding: isMobile ? '12px 16px' : '20px 24px', background: '#fafafa', borderRadius: 12 }}>
          <Row gutter={isMobile ? 12 : 24}>
            <Col span={12}>
              <Statistic title="今日免费生成" value={getFreeRemaining()} suffix="/ 3 次" prefix={<CoffeeOutlined />}
                valueStyle={{ color: '#52c41a', fontSize: isMobile ? 18 : 24 }} />
            </Col>
            <Col span={12}>
              <Statistic title="可用点数" value={getCreditBalance()} suffix="点" prefix={<DollarOutlined />}
                valueStyle={{ color: '#1677ff', fontSize: isMobile ? 18 : 24 }} />
            </Col>
          </Row>
        </div>
      </Card>

      {/* 收益面板入口 */}
      <Card
        style={{ marginBottom: isMobile ? 20 : 32, borderRadius: 12, cursor: 'pointer' }}
        onClick={() => navigate('/creator/earnings')}
        hoverable
        styles={{ body: { padding: isMobile ? '16px 20px' : '24px 32px' } }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Space>
            <span style={{ fontSize: isMobile ? 24 : 32 }}>💰</span>
            <div>
              <Title level={isMobile ? 5 : 4} style={{ margin: 0 }}>创作者收益面板</Title>
              <Text type="secondary">查看付费解锁收益、作品排行、明细数据</Text>
            </div>
          </Space>
          <BarChartOutlined style={{ fontSize: 24, color: '#1677ff' }} />
        </div>
      </Card>

      {/* 我的 AI 作品 */}
      <Card
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: isMobile ? 18 : 22 }}>🤖</span>
            <span>我的 AI 作品 ({userMangas.length})</span>
          </div>
        }
        style={{ borderRadius: 12 }}
        styles={{ body: { padding: isMobile ? '8px 12px' : '16px 24px' } }}
      >
        {userMangas.length === 0 ? (
          <Empty description="还没有创作过 AI 漫画作品">
            <Button type="primary" onClick={() => navigate('/create')}>去创作</Button>
          </Empty>
        ) : (
          <List
            dataSource={userMangas}
            loading={loading}
            renderItem={(manga) => {
              const auditInfo = auditTagMap[manga.auditStatus] || auditTagMap.pending;
              const isRejected = manga.auditStatus === 'rejected';

              return (
                <List.Item
                  key={manga.id}
                  style={{ opacity: isRejected ? 0.5 : 1, flexWrap: 'wrap' }}
                  actions={[
                    <Button key="update" icon={<EditOutlined />} type="link" onClick={() => navigate(`/manga/${manga.id}/update`)} size={isMobile ? 'small' : 'middle'}>
                      {isMobile ? '' : '更新'}
                    </Button>,
                    <Button key="share" icon={<ShareAltOutlined />} type="link" onClick={() => handleShare(manga)} size={isMobile ? 'small' : 'middle'}>
                      {isMobile ? '' : '分享'}
                    </Button>,
                    <Button key="read" icon={<ReadOutlined />} type="link" onClick={() => navigate(`/manga/${manga.id}`)} size={isMobile ? 'small' : 'middle'}>
                      {isMobile ? '' : '阅读'}
                    </Button>,
                    <Popconfirm key="delete" title="确定删除此作品？" description="删除后无法恢复"
                      onConfirm={() => handleDelete(manga.id)} okText="确定" cancelText="取消" okButtonProps={{ danger: true }}>
                      <Button icon={<DeleteOutlined />} type="link" danger size={isMobile ? 'small' : 'middle'}>
                        {isMobile ? '' : '删除'}
                      </Button>
                    </Popconfirm>,
                  ]}
                >
                  <List.Item.Meta
                    avatar={
                      <img src={manga.coverUrl} alt={manga.title}
                        style={{ width: isMobile ? 56 : 80, height: isMobile ? 78 : 112, objectFit: 'cover', borderRadius: 8, flexShrink: 0 }} />
                    }
                    title={
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                        <Text strong style={{ fontSize: isMobile ? 14 : 16 }}>{manga.title}</Text>
                        <Tag color={manga.mode === 'panel' ? 'blue' : 'purple'} style={isMobile ? { fontSize: 11, padding: '0 4px' } : undefined}>
                          {manga.mode === 'panel' ? '分镜式' : '一次性'}
                        </Tag>
                        <Tag style={isMobile ? { fontSize: 11, padding: '0 4px' } : undefined}><FileTextOutlined /> {manga.pages.length} 页</Tag>
                        <Tag color={auditInfo.color} style={isMobile ? { fontSize: 11, padding: '0 4px' } : undefined}>{auditInfo.label}</Tag>
                      </div>
                    }
                    description={
                      <div style={{ fontSize: isMobile ? 12 : 13 }}>
                        <Text type="secondary">作者: {manga.author}</Text>
                        {!isMobile && (
                          <>
                            <br />
                            <Text type="secondary" style={{ fontSize: 12 }}>生成模型: {manga.generationModel}</Text>
                          </>
                        )}
                        <br />
                        <Text type="secondary" style={{ fontSize: isMobile ? 11 : 13 }} ellipsis>
                          {manga.description}
                        </Text>
                      </div>
                    }
                  />
                </List.Item>
              );
            }}
          />
        )}
      </Card>

      {/* 分享弹窗 */}
      {shareManga && (
        <ShareModal
          open={shareOpen}
          onClose={() => setShareOpen(false)}
          shareUrl={`${window.location.origin}/share/${shareManga.id}`}
          title={shareManga.title}
          description={shareManga.description}
        />
      )}
    </div>
  );
}
