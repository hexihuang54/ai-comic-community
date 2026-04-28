import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Col, Row, Typography, Empty, Tag, Button, Grid, Space } from 'antd';
import { ReadOutlined, ThunderboltOutlined, FileTextOutlined, ShareAltOutlined, HeartOutlined, CommentOutlined } from '@ant-design/icons';
import { useMangaStore } from '../stores/mangaStore';
import { useInteractionStore } from '../stores/interactionStore';
import ShareModal from '../components/ShareModal';
import type { AIManga } from '../types';

const { Title, Paragraph, Text } = Typography;
const { useBreakpoint } = Grid;

const auditTagMap: Record<string, { color: string; label: string }> = {
  approved: { color: 'green', label: '已审核' },
  pending: { color: 'orange', label: '审核中' },
  rejected: { color: 'red', label: '未通过' },
};

export default function HomePage() {
  const navigate = useNavigate();
  const screens = useBreakpoint();
  const isMobile = !screens.md;
  const { filteredMangas, searchKeyword, loadMangas } = useMangaStore();
  const { getLikeCount, getComments } = useInteractionStore();
  const [shareOpen, setShareOpen] = useState(false);
  const [shareManga, setShareManga] = useState<AIManga | null>(null);

  useEffect(() => {
    loadMangas();
  }, [loadMangas]);

  const handleShare = (manga: AIManga, e: React.MouseEvent) => {
    e.stopPropagation();
    setShareManga(manga);
    setShareOpen(true);
  };

  if (filteredMangas.length === 0 && searchKeyword) {
    return (
      <div style={{ textAlign: 'center', padding: isMobile ? '40px 0' : '80px 0' }}>
        <Empty description={`没有找到与"${searchKeyword}"相关的 AI 漫画`}>
          <Button type="primary" onClick={() => navigate('/')}>
            查看全部作品
          </Button>
        </Empty>
      </div>
    );
  }

  const coverHeight = isMobile ? 220 : 320;
  const gutter: [number, number] = isMobile ? [12, 12] : [24, 24];

  return (
    <div>
      {/* 顶部栏 */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: isMobile ? 20 : 32,
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div>
          <Title level={isMobile ? 4 : 2} style={{ marginBottom: 4 }}>
            <ThunderboltOutlined style={{ marginRight: 8, color: '#faad14' }} />
            {searchKeyword ? `搜索结果: "${searchKeyword}"` : 'AI 漫画作品'}
          </Title>
          <Text type="secondary" style={{ fontSize: isMobile ? 13 : 14 }}>
            共 {filteredMangas.length} 部 AI 生成漫画作品
          </Text>
        </div>
        <Button
          type="primary"
          size={isMobile ? 'middle' : 'large'}
          icon={<ThunderboltOutlined />}
          onClick={() => navigate('/create')}
          style={{ borderRadius: 12, height: isMobile ? 38 : 44, fontSize: isMobile ? 14 : 15 }}
        >
          立即创作 AI 漫画
        </Button>
      </div>

      {/* 漫画卡片网格 */}
      <Row gutter={gutter}>
        {filteredMangas.map((manga) => {
          const auditInfo = auditTagMap[manga.auditStatus] || auditTagMap.pending;
          const isRejected = manga.auditStatus === 'rejected';
          const likes = getLikeCount(manga.id);
          const commentCount = getComments(manga.id).length;

          return (
            <Col key={manga.id} xs={12} sm={12} md={8} lg={6}>
              <Card
                hoverable
                onClick={() => navigate(`/manga/${manga.id}`)}
                style={{
                  height: '100%',
                  borderRadius: 12,
                  overflow: 'hidden',
                  opacity: isRejected ? 0.5 : 1,
                }}
                cover={
                  <div style={{ position: 'relative', overflow: 'hidden', height: coverHeight }}>
                    <img
                      alt={manga.title}
                      src={manga.coverUrl}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transition: 'transform 0.3s',
                      }}
                      onMouseEnter={(e) => {
                        (e.target as HTMLImageElement).style.transform = 'scale(1.05)';
                      }}
                      onMouseLeave={(e) => {
                        (e.target as HTMLImageElement).style.transform = 'scale(1)';
                      }}
                    />
                    {/* 角标标签 */}
                    <div style={{ position: 'absolute', top: 8, right: 8, display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-end' }}>
                      {manga.isOfficial ? (
                        <Tag color="gold" style={isMobile ? { fontSize: 11, padding: '0 4px' } : undefined}>官方</Tag>
                      ) : (
                        <Tag color="orange" style={isMobile ? { fontSize: 11, padding: '0 4px' } : undefined}>用户创作</Tag>
                      )}
                    </div>
                    {/* 左下角：页数 + 审核状态 */}
                    <div style={{ position: 'absolute', bottom: 8, left: 8, display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                      <Tag color="rgba(0,0,0,0.55)" style={isMobile ? { fontSize: 11, padding: '0 4px' } : undefined}>
                        <FileTextOutlined /> {manga.pages.length} 页
                      </Tag>
                      <Tag color={auditInfo.color} style={isMobile ? { fontSize: 11, padding: '0 4px' } : undefined}>{auditInfo.label}</Tag>
                    </div>
                  </div>
                }
                actions={[
                  <Button
                    key="share"
                    type="text"
                    size="small"
                    icon={<ShareAltOutlined />}
                    onClick={(e) => handleShare(manga, e)}
                    style={{ color: '#1677ff' }}
                  />,
                  <Tag
                    key="mode"
                    color={manga.mode === 'panel' ? 'blue' : 'purple'}
                    style={{ margin: '0 4px', fontSize: isMobile ? 11 : 12 }}
                  >
                    {manga.mode === 'panel' ? '分镜式' : '一次性'}
                  </Tag>,
                ]}
              >
                <Card.Meta
                  title={
                    <Text strong style={{ fontSize: isMobile ? 13 : 16 }}>
                      {manga.title}
                    </Text>
                  }
                  description={
                    <div style={{ fontSize: isMobile ? 11 : 13 }}>
                      <div style={{ marginBottom: 4 }}>
                        <Text type="secondary" style={{ fontSize: isMobile ? 11 : 13 }}>作者: {manga.author}</Text>
                      </div>
                      {/* 互动数据 */}
                      <div style={{ marginBottom: 4, display: 'flex', gap: isMobile ? 10 : 14 }}>
                        <Text type="secondary" style={{ fontSize: isMobile ? 11 : 12 }}>
                          <HeartOutlined style={{ marginRight: 2, color: '#ff4d4f' }} />{likes}
                        </Text>
                        <Text type="secondary" style={{ fontSize: isMobile ? 11 : 12 }}>
                          <CommentOutlined style={{ marginRight: 2, color: '#1677ff' }} />{commentCount}
                        </Text>
                      </div>
                      {!isMobile && (
                        <div style={{ marginBottom: 4 }}>
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            生成模型: {manga.generationModel}
                          </Text>
                        </div>
                      )}
                      <Paragraph
                        ellipsis={{ rows: isMobile ? 1 : 2 }}
                        style={{ color: '#666', fontSize: isMobile ? 11 : 13, marginBottom: 0 }}
                      >
                        {manga.description}
                      </Paragraph>
                    </div>
                  }
                />
              </Card>
            </Col>
          );
        })}
      </Row>

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
