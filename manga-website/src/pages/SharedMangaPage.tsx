import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Button, Spin, Typography, Tag, Empty, Card, Divider, Space, message, Grid
} from 'antd';
import {
  HeartOutlined, HeartFilled, FireOutlined,
  ShareAltOutlined, HomeOutlined, CommentOutlined,
} from '@ant-design/icons';
import { getMangaById } from '../mock/manga';
import { useInteractionStore } from '../stores/interactionStore';
import { useAuthStore } from '../stores/authStore';
import CommentSection from '../components/CommentSection';
import ShareModal from '../components/ShareModal';
import type { AIManga } from '../types';

const { Title, Text, Paragraph } = Typography;
const { useBreakpoint } = Grid;

export default function SharedMangaPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const screens = useBreakpoint();
  const isMobile = !screens.md;
  const user = useAuthStore((s) => s.user);
  const username = user?.nickname || '';

  const [manga, setManga] = useState<AIManga | null>(null);
  const [loading, setLoading] = useState(true);
  const [shareOpen, setShareOpen] = useState(false);

  const {
    toggleLike, getLikeCount, hasLiked,
    addUrge, getUrgeCount, hasUrged,
  } = useInteractionStore();

  const likeCount = id ? getLikeCount(id) : 0;
  const liked = id ? hasLiked(id, username) : false;
  const urgeCount = id ? getUrgeCount(id) : 0;
  const urged = id ? hasUrged(id, username) : false;

  useEffect(() => {
    if (id) {
      setLoading(true);
      setTimeout(() => {
        const found = getMangaById(id);
        setManga(found || null);
        setLoading(false);
      }, 300);
    }
  }, [id]);

  const handleLike = () => {
    if (!id || !username) { message.info('请登录后点赞'); return; }
    const result = toggleLike(id, username);
    message.success(result.liked ? '已点赞' : '已取消点赞');
  };

  const handleUrge = () => {
    if (!id || !username) { message.info('请登录后催更'); return; }
    const result = addUrge(id, username);
    if (result.already) {
      message.info('你已经催更过了～');
    } else {
      message.success('催更成功！作者会收到通知');
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <Spin size="large" tip="加载中..." />
      </div>
    );
  }

  if (!manga) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <Empty description="作品不存在或已被删除">
          <Button type="primary" onClick={() => navigate('/')} icon={<HomeOutlined />}>返回首页</Button>
        </Empty>
      </div>
    );
  }

  const shareUrl = `${window.location.origin}/share/${manga.id}`;

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      {/* 顶部横幅 */}
      <Card
        style={{ borderRadius: 12, overflow: 'hidden', marginBottom: isMobile ? 16 : 24 }}
        styles={{ body: { padding: 0 } }}
      >
        <div style={{ position: 'relative', height: isMobile ? 240 : 360, overflow: 'hidden' }}>
          <img src={manga.coverUrl} alt={manga.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            background: 'linear-gradient(transparent, rgba(0,0,0,0.75))',
            padding: isMobile ? '40px 20px 20px' : '60px 32px 24px',
            color: '#fff',
          }}>
            <Title level={isMobile ? 4 : 2} style={{ color: '#fff', marginBottom: 8 }}>
              {manga.title}
            </Title>
            <Space size={12} wrap>
              <Text style={{ color: 'rgba(255,255,255,0.85)' }}>作者: {manga.author}</Text>
              <Tag color={manga.mode === 'panel' ? 'blue' : 'purple'}>
                {manga.mode === 'panel' ? '分镜式' : '一次性'}
              </Tag>
              <Tag>{manga.pages.length} 页</Tag>
              <Tag color="green">{manga.generationModel}</Tag>
            </Space>
          </div>
        </div>
      </Card>

      {/* 互动按钮栏 */}
      <Card style={{ borderRadius: 12, marginBottom: isMobile ? 16 : 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
          <Button
            size="large"
            icon={liked ? <HeartFilled style={{ color: '#ff4d4f' }} /> : <HeartOutlined />}
            onClick={handleLike}
            style={{ borderColor: liked ? '#ff4d4f' : undefined, color: liked ? '#ff4d4f' : undefined }}
          >
            {liked ? '已点赞' : '点赞'} {likeCount > 0 && `(${likeCount})`}
          </Button>
          <Button
            size="large"
            icon={<FireOutlined style={{ color: urged ? '#fa8c16' : undefined }} />}
            onClick={handleUrge}
            style={{ borderColor: urged ? '#fa8c16' : undefined, color: urged ? '#fa8c16' : undefined }}
          >
            {urged ? '已催更' : '催更'} {urgeCount > 0 && `(${urgeCount})`}
          </Button>
          <Button
            size="large"
            icon={<ShareAltOutlined />}
            onClick={() => setShareOpen(true)}
            type="primary"
          >
            分享
          </Button>
        </div>
      </Card>

      {/* 作品简介 */}
      <Card style={{ borderRadius: 12, marginBottom: isMobile ? 16 : 24 }}>
        <Title level={5} style={{ marginBottom: 12 }}>📖 作品简介</Title>
        <Paragraph style={{ fontSize: 15, lineHeight: 1.8 }}>{manga.description}</Paragraph>
        {manga.tags && manga.tags.length > 0 && (
          <div style={{ marginTop: 12 }}>
            {manga.tags.map((tag) => <Tag key={tag}>{tag}</Tag>)}
          </div>
        )}
      </Card>

      {/* 页面预览 */}
      <Card style={{ borderRadius: 12, marginBottom: isMobile ? 16 : 24 }}
        title={<Space><CommentOutlined /> 内容预览</Space>}>
        <div style={{ display: 'flex', gap: isMobile ? 8 : 12, overflowX: 'auto', paddingBottom: 8 }}>
          {manga.pages.slice(0, 6).map((page) => (
            <div key={page.pageNumber} style={{ flexShrink: 0 }}>
              <img
                src={page.imageUrl}
                alt={`第 ${page.pageNumber} 页`}
                style={{
                  width: isMobile ? 100 : 140,
                  height: isMobile ? 150 : 210,
                  objectFit: 'cover',
                  borderRadius: 8,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                }}
              />
              <div style={{ textAlign: 'center', fontSize: 12, color: '#999', marginTop: 4 }}>
                第 {page.pageNumber} 页
              </div>
            </div>
          ))}
        </div>
        <div style={{ textAlign: 'center', marginTop: 12 }}>
          <Button type="link" onClick={() => navigate(`/manga/${manga.id}`)} icon={<CommentOutlined />}>
            查看完整漫画 ({manga.pages.length} 页)
          </Button>
        </div>
      </Card>

      {/* 评论区 */}
      <Card
        style={{ borderRadius: 12 }}
        title={<Space><CommentOutlined /> 评论 ({useInteractionStore.getState().getComments(manga.id).length})</Space>}
      >
        <CommentSection mangaId={manga.id} currentUser={username} />
      </Card>

      {/* 分享弹窗 */}
      <ShareModal
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        shareUrl={shareUrl}
        title={manga.title}
        description={manga.description}
      />
    </div>
  );
}
