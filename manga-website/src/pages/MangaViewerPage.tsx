import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Button, Spin, Typography, Space, Tag, Tooltip, Empty, theme, Grid, Card, message, List, Avatar, Modal, Input, Form
} from 'antd';
import {
  LeftOutlined, RightOutlined, ArrowLeftOutlined,
  FullscreenOutlined, FullscreenExitOutlined,
  HomeOutlined, PictureOutlined, ShareAltOutlined,
  HeartOutlined, HeartFilled, FireOutlined, CommentOutlined,
  EditOutlined, PlayCircleOutlined,
} from '@ant-design/icons';
import { getMangaById } from '../mock/manga';
import { useInteractionStore } from '../stores/interactionStore';
import { useAuthStore } from '../stores/authStore';
import { useUnlockStore } from '../stores/unlockStore';
import { useEarningStore } from '../stores/earningStore';
import ShareModal from '../components/ShareModal';
import CommentSection from '../components/CommentSection';
import PaywallOverlay from '../components/PaywallOverlay';
import DanmakuOverlay from '../components/DanmakuOverlay';
import { getChainsByManga } from '../mock/chains';
import type { AIManga, MangaChain } from '../types';

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

export default function MangaViewerPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { token } = theme.useToken();
  const screens = useBreakpoint();
  const isMobile = !screens.md;
  const containerRef = useRef<HTMLDivElement>(null);

  const user = useAuthStore((s) => s.user);
  const currentUser = user?.nickname || '';
  const loadUnlocked = useUnlockStore((s) => s.loadUnlocked);
  const isUnlocked = useUnlockStore((s) => s.isUnlocked);
  const unlockManga = useUnlockStore((s) => s.unlock);
  const addEarning = useEarningStore((s) => s.addEarning);

  const {
    toggleLike, getLikeCount, hasLiked,
    addUrge, getUrgeCount, hasUrged,
    getComments,
  } = useInteractionStore();

  const [manga, setManga] = useState<AIManga | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [danmakuEnabled, setDanmakuEnabled] = useState(true);
  const [chainsOpen, setChainsOpen] = useState(false);
  const [chains, setChains] = useState<MangaChain[]>([]);

  const mangaId = manga?.id || '';
  const likeCount = mangaId ? getLikeCount(mangaId) : 0;
  const liked = mangaId ? hasLiked(mangaId, currentUser) : false;
  const urgeCount = mangaId ? getUrgeCount(mangaId) : 0;
  const urged = mangaId ? hasUrged(mangaId, currentUser) : false;
  const commentCount = mangaId ? getComments(mangaId).length : 0;

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

  // 加载解锁状态 & 初始化
  useEffect(() => {
    if (manga && user) {
      loadUnlocked(user.id);
    }
  }, [manga, user]);

  useEffect(() => {
    if (manga && user) {
      const isPaid = manga.isPaid && manga.pricePoints;
      const unlockedByUser = user && manga.uploadedBy !== user.nickname && isUnlocked(manga.id);
      setUnlocked(!!unlockedByUser);
      if (isPaid && !unlockedByUser) {
        setCurrentPage(0);
      }
    }
  }, [manga, user]);

  const totalPages = manga?.pages.length || 0;

  const goToPage = useCallback((page: number) => {
    if (page >= 0 && page < totalPages) {
      // 检查是否为付费内容且未解锁
      if (manga && manga.isPaid && manga.freePages !== undefined && manga.pricePoints) {
        const isAuthor = user?.nickname === manga.uploadedBy;
        const isFreePage = page < manga.freePages;
        if (!isAuthor && !isFreePage && !unlocked && !showPaywall) {
          setShowPaywall(true);
          return;
        }
      }
      setCurrentPage(page);
    }
  }, [totalPages, manga, user, unlocked, showPaywall]);

  const nextPage = useCallback(() => goToPage(currentPage + 1), [currentPage, goToPage]);
  const prevPage = useCallback(() => goToPage(currentPage - 1), [currentPage, goToPage]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); nextPage(); }
      else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); prevPage(); }
      else if (e.key === 'f' && e.ctrlKey) { e.preventDefault(); toggleFullscreen(); }
      else if (e.key === 'Escape' && isFullscreen) { setIsFullscreen(false); }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPage, totalPages, nextPage, prevPage, isFullscreen]);

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      if (containerRef.current?.requestFullscreen) containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      if (document.fullscreenElement) document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFSChange = () => { if (!document.fullscreenElement) setIsFullscreen(false); };
    document.addEventListener('fullscreenchange', handleFSChange);
    return () => document.removeEventListener('fullscreenchange', handleFSChange);
  }, []);

  const handleLike = () => {
    if (!mangaId || !currentUser) { message.info('请登录后点赞'); return; }
    const result = toggleLike(mangaId, currentUser);
    message.success(result.liked ? '已点赞' : '已取消点赞');
  };

  const handleUrge = () => {
    if (!mangaId || !currentUser) { message.info('请登录后催更'); return; }
    const result = addUrge(mangaId, currentUser);
    if (result.already) {
      message.info('你已经催更过了～');
    } else {
      message.success('催更成功！作者会收到通知');
    }
  };

  const handleUnlock = () => {
    if (!manga || !user) return;
    unlockManga(user.id, manga.id);
    // 记录创作者收益（平台抽30%，创作者得70%）
    const price = manga.pricePoints || 10;
    const creatorShare = Math.floor(price * 0.7);
    addEarning({
      mangaId: manga.id,
      mangaTitle: manga.title,
      authorNickname: manga.author,
      payerNickname: user.nickname,
      points: creatorShare,
    });
    setUnlocked(true);
    setShowPaywall(false);
    message.success('已解锁全部内容，继续阅读吧！');
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <Spin size="large" tip="加载漫画中..." />
      </div>
    );
  }

  if (!manga) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <Empty description="漫画不存在或已被删除">
          <Button type="primary" onClick={() => navigate('/')} icon={<HomeOutlined />}>返回首页</Button>
        </Empty>
      </div>
    );
  }

  const currentPageData = manga.pages[currentPage];
  const btnHeight = isMobile ? 48 : 80;
  const btnWidth = isMobile ? 40 : 56;

  return (
    <div ref={containerRef} style={{ background: isFullscreen ? '#000' : 'transparent' }}>
      {/* 顶部工具栏 */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: isMobile ? '8px 12px' : '12px 24px', marginBottom: isMobile ? 8 : 16,
        background: isFullscreen ? 'rgba(0,0,0,0.85)' : '#fff',
        borderRadius: isFullscreen ? 0 : 12, boxShadow: isFullscreen ? 'none' : '0 2px 8px rgba(0,0,0,0.06)',
        color: isFullscreen ? '#fff' : 'inherit', flexWrap: 'wrap', gap: 8,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 6 : 12 }}>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/')} type={isFullscreen ? 'default' : 'text'} ghost={isFullscreen} size={isMobile ? 'small' : 'middle'}>
            {isMobile ? '' : '返回'}
          </Button>
          <div>
            <Title level={isMobile ? 5 : 4} style={{ margin: 0, color: isFullscreen ? '#fff' : 'inherit', fontSize: isMobile ? 14 : undefined }}>
              {manga.title}
            </Title>
            <Space size={6} wrap>
              <Text style={{ color: isFullscreen ? 'rgba(255,255,255,0.65)' : '#999', fontSize: isMobile ? 11 : 14 }}>
                作者: {manga.author}
              </Text>
              <Tag color={manga.mode === 'panel' ? 'blue' : 'purple'} style={isMobile ? { fontSize: 11, padding: '0 4px' } : undefined}>
                {manga.mode === 'panel' ? '分镜式' : '一次性'}
              </Tag>
              {manga.isOfficial && <Tag color="gold" style={isMobile ? { fontSize: 11, padding: '0 4px' } : undefined}>官方</Tag>}
            </Space>
          </div>
        </div>

        <Space size={isMobile ? 4 : 8}>
          <Text strong style={{ fontSize: isMobile ? 14 : 16, color: isFullscreen ? '#fff' : 'inherit' }}>
            第 {currentPage + 1} / {totalPages} 页
          </Text>
          <Tooltip title="分享">
            <Button icon={<ShareAltOutlined />} onClick={() => setShareOpen(true)} ghost={isFullscreen} size={isMobile ? 'small' : 'middle'} />
          </Tooltip>
          <Tooltip title={isFullscreen ? '退出全屏 (Esc)' : '全屏 (Ctrl+F)'}>
            <Button icon={isFullscreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />} onClick={toggleFullscreen} ghost={isFullscreen} size={isMobile ? 'small' : 'middle'} />
          </Tooltip>
          <Tooltip title={danmakuEnabled ? '关闭弹幕' : '开启弹幕'}>
            <Button 
              icon={<PlayCircleOutlined />} 
              onClick={() => setDanmakuEnabled(!danmakuEnabled)} 
              type={danmakuEnabled ? 'primary' : 'default'}
              ghost={isFullscreen}
              size={isMobile ? 'small' : 'middle'}
            >
              {isMobile ? '' : '弹幕'}
            </Button>
          </Tooltip>
          <Tooltip title="接龙续写">
            <Button 
              icon={<EditOutlined />} 
              onClick={() => {
                setChains(getChainsByManga(manga.id));
                setChainsOpen(true);
              }}
              ghost={isFullscreen}
              size={isMobile ? 'small' : 'middle'}
            >
              {isMobile ? '' : '接龙'}
            </Button>
          </Tooltip>
        </Space>
      </div>

      {/* 主体阅读区域 */}
      <div style={{
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        gap: isMobile ? 4 : 16, minHeight: isFullscreen ? 'calc(100vh - 200px)' : (isMobile ? 300 : 500),
        position: 'relative',
      }}>
        <Button icon={<LeftOutlined style={{ fontSize: isMobile ? 18 : 24 }} />}
          onClick={prevPage} disabled={currentPage === 0}
          style={{ height: btnHeight, width: btnWidth, borderRadius: 12, opacity: currentPage === 0 ? 0.3 : 0.8, flexShrink: 0 }}
          ghost={isFullscreen} />

        <div style={{
          flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer',
          maxWidth: isFullscreen ? 'calc(100vh * 0.55)' : (isMobile ? '100%' : 620),
        }} onClick={() => currentPage < totalPages - 1 && nextPage()}>
          <div style={{ width: '100%', textAlign: 'center', position: 'relative' }}>
            <img src={currentPageData.imageUrl} alt={`${manga.title} - 第 ${currentPage + 1} 页`}
              style={{
                width: '100%', maxHeight: isFullscreen ? 'calc(100vh - 220px)' : (isMobile ? '55vh' : '75vh'),
                objectFit: 'contain', borderRadius: isFullscreen ? 0 : 8,
                boxShadow: isFullscreen ? '0 0 60px rgba(0,0,0,0.5)' : '0 8px 32px rgba(0,0,0,0.15)',
                transition: 'opacity 0.2s',
              }} />
            {danmakuEnabled && (
              <DanmakuOverlay
                mangaId={manga.id}
                currentPage={currentPage + 1}
                username={currentUser}
              />
            )}
            {!isMobile && (
              <div style={{ marginTop: 12, padding: '8px 16px', background: isFullscreen ? 'rgba(255,255,255,0.1)' : '#f5f5f5', borderRadius: 8, maxWidth: 600, margin: '12px auto 0' }}>
                <Text type="secondary" style={{ fontSize: 13, color: isFullscreen ? 'rgba(255,255,255,0.55)' : '#999' }} italic>
                  <BulbOutlined /> {currentPageData.prompt}
                </Text>
              </div>
            )}
          </div>
        </div>

        <Button icon={<RightOutlined style={{ fontSize: isMobile ? 18 : 24 }} />}
          onClick={nextPage} disabled={currentPage >= totalPages - 1}
          style={{ height: btnHeight, width: btnWidth, borderRadius: 12, opacity: currentPage >= totalPages - 1 ? 0.3 : 0.8, flexShrink: 0 }}
          ghost={isFullscreen} />
      </div>

      {/* 底部缩略图条 */}
      {!isFullscreen && (
        <div style={{ marginTop: isMobile ? 12 : 24, padding: isMobile ? '8px' : '16px', background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', overflowX: 'auto' }}>
          <div style={{ display: 'flex', gap: isMobile ? 6 : 10, minWidth: 'max-content' }}>
            {manga.pages.map((page, idx) => (
              <div key={page.pageNumber} onClick={() => goToPage(idx)}
                style={{
                  cursor: 'pointer', border: idx === currentPage ? `3px solid ${token.colorPrimary}` : '3px solid transparent',
                  borderRadius: 8, overflow: 'hidden', transition: 'all 0.2s',
                  opacity: idx === currentPage ? 1 : 0.6, flexShrink: 0,
                }}>
                <img src={page.imageUrl} alt={`第 ${page.pageNumber} 页`}
                  style={{ width: isMobile ? 56 : 80, height: isMobile ? 84 : 120, objectFit: 'cover', display: 'block' }} />
                <div style={{ textAlign: 'center', fontSize: 11, padding: '2px 0', background: idx === currentPage ? token.colorPrimary : '#f0f0f0', color: idx === currentPage ? '#fff' : '#666' }}>
                  {page.pageNumber}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 底部翻页 */}
      <div style={{ textAlign: 'center', marginTop: isMobile ? 8 : 16, padding: isMobile ? 8 : 16 }}>
        <Space size={isMobile ? 12 : 24}>
          <Button onClick={prevPage} disabled={currentPage === 0} icon={<LeftOutlined />} size={isMobile ? 'small' : 'large'} ghost={isFullscreen}>
            {isMobile ? '' : '上一页'}
          </Button>
          <Text style={{ color: isFullscreen ? 'rgba(255,255,255,0.45)' : '#999', fontSize: isMobile ? 11 : 14 }}>
            点击图片或按 ← → 翻页
          </Text>
          <Button onClick={nextPage} disabled={currentPage >= totalPages - 1} icon={<RightOutlined />} size={isMobile ? 'small' : 'large'} ghost={isFullscreen}>
            {isMobile ? '' : '下一页'}
          </Button>
        </Space>
      </div>

      {/* 互动栏 */}
      {!isFullscreen && (
        <Card style={{ borderRadius: 12, marginBottom: isMobile ? 16 : 24, marginTop: isMobile ? 12 : 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
            <Button
              size={isMobile ? 'middle' : 'large'}
              icon={liked ? <HeartFilled style={{ color: '#ff4d4f' }} /> : <HeartOutlined />}
              onClick={handleLike}
              style={{ borderColor: liked ? '#ff4d4f' : undefined, color: liked ? '#ff4d4f' : undefined }}
            >
              {liked ? '已点赞' : '点赞'} {likeCount > 0 && <span>({likeCount})</span>}
            </Button>
            <Button
              size={isMobile ? 'middle' : 'large'}
              icon={<FireOutlined style={{ color: urged ? '#fa8c16' : undefined }} />}
              onClick={handleUrge}
              style={{ borderColor: urged ? '#fa8c16' : undefined, color: urged ? '#fa8c16' : undefined }}
            >
              {urged ? '已催更' : '催更'} {urgeCount > 0 && <span>({urgeCount})</span>}
            </Button>
            <Button
              size={isMobile ? 'middle' : 'large'}
              icon={<CommentOutlined />}
              onClick={() => {
                const el = document.getElementById('comment-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              评论 {commentCount > 0 && <span>({commentCount})</span>}
            </Button>
            {!isMobile && (
              <Button
                size="large"
                icon={<ShareAltOutlined />}
                onClick={() => setShareOpen(true)}
                type="primary"
              >
                分享
              </Button>
            )}
            {manga.uploadedBy === user?.nickname && (
              <Button
                size={isMobile ? 'middle' : 'large'}
                icon={<EditOutlined />}
                onClick={() => navigate(`/manga/${manga.id}/update`)}
                type="default"
              >
                {isMobile ? '' : '更新'}
              </Button>
            )}
          </div>
        </Card>
      )}

      {/* 漫画简介 */}
      {!isFullscreen && (
        <div style={{ marginBottom: isMobile ? 16 : 24, padding: isMobile ? 16 : 20, background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <Title level={5} style={{ marginBottom: 8, fontSize: isMobile ? 14 : 16 }}>
            <PictureOutlined /> 作品简介
          </Title>
          <Text style={{ fontSize: isMobile ? 13 : 15, lineHeight: 1.8 }}>{manga.description}</Text>
          {manga.tags && manga.tags.length > 0 && (
            <div style={{ marginTop: 12 }}>
              {manga.tags.map((tag) => <Tag key={tag} style={{ marginBottom: 4 }}>{tag}</Tag>)}
            </div>
          )}
        </div>
      )}

      {/* 评论区 */}
      {!isFullscreen && (
        <Card
          id="comment-section"
          style={{ borderRadius: 12 }}
          title={<Space><CommentOutlined /> 评论 ({commentCount})</Space>}
        >
          <CommentSection mangaId={manga.id} currentUser={currentUser} />
        </Card>
      )}

      {/* 分享弹窗 */}
      {manga && (
        <ShareModal
          open={shareOpen}
          onClose={() => setShareOpen(false)}
          shareUrl={`${window.location.origin}/share/${manga.id}`}
          title={manga.title}
          description={manga.description}
        />
      )}

      {/* 付费墙弹窗 */}
      {manga && manga.isPaid && showPaywall && !unlocked && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: isMobile ? 16 : 24,
        }}>
          <PaywallOverlay
            manga={manga}
            onUnlock={handleUnlock}
            onBack={() => {
              setShowPaywall(false);
              setCurrentPage(Math.min((manga.freePages || 3) - 1, currentPage));
            }}
          />
        </div>
      )}

      {/* 接龙弹窗 */}
      <Modal
        title="📖 接龙续写"
        open={chainsOpen}
        onCancel={() => setChainsOpen(false)}
        footer={null}
        width={isMobile ? '95%' : 720}
      >
        <div style={{ marginBottom: 16 }}>
          <Text>基于《{manga.title}》的接龙作品：</Text>
        </div>
        {chains.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>📝</div>
            <Text type="secondary">暂无接龙作品，来做第一个续写者吧！</Text>
            <br /><br />
            <Button type="primary" onClick={() => message.info('接龙创作功能即将开放')}>🎨 开始接龙</Button>
          </div>
        ) : (
          <List
            dataSource={chains}
            renderItem={(chain) => (
              <List.Item style={{ padding: 12, background: '#f9f9f9', borderRadius: 8, marginBottom: 8 }}>
                <List.Item.Meta
                  avatar={<Avatar style={{ background: '#722ed1' }}>{chain.author[0]}</Avatar>}
                  title={<Text strong>{chain.chainTitle}</Text>}
                  description={`作者：${chain.author} · ${chain.pages.length} 页 · ❤️ ${chain.likes}`}
                />
              </List.Item>
            )}
          />
        )}
      </Modal>
    </div>
  );
}

function BulbOutlined() {
  return <span style={{ marginRight: 4, fontSize: 14 }}>💡</span>;
}
