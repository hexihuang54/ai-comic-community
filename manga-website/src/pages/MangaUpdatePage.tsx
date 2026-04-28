import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Button, Card, Typography, Input, message, Space, Divider, Alert, Tag, List, Grid, Spin
} from 'antd';
import {
  PlusOutlined, ArrowLeftOutlined, ThunderboltOutlined, DeleteOutlined,
  BulbOutlined, EditOutlined, ReloadOutlined
} from '@ant-design/icons';
import { getMangaById } from '../mock/manga';
import { useMangaStore } from '../stores/mangaStore';
import type { AIPage } from '../types';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { useBreakpoint } = Grid;

function mockGenerateImage(seed: string): string {
  const randomSeed = Math.floor(Math.random() * 1000);
  return `https://picsum.photos/seed/${seed}${randomSeed}/800/1200`;
}

export default function MangaUpdatePage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  const appendPages = useMangaStore((s) => s.appendPages);

  const [manga, setManga] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [pages, setPages] = useState<AIPage[]>([
    { pageNumber: 1, prompt: '', imageUrl: '' },
  ]);
  const [generatingPage, setGeneratingPage] = useState<number | null>(null);
  const [updateNote, setUpdateNote] = useState('');

  useEffect(() => {
    if (id) {
      setLoading(true);
      const found = getMangaById(id);
      if (!found) {
        message.error('作品不存在');
        navigate('/');
        return;
      }
      setManga(found);
      setLoading(false);
    }
  }, [id]);

  const handleAddPage = () => {
    setPages((prev) => [
      ...prev,
      { pageNumber: prev.length + 1, prompt: '', imageUrl: '' },
    ]);
  };

  const handleDeletePage = (pageNum: number) => {
    if (pages.length <= 1) {
      message.warning('至少保留一页');
      return;
    }
    const newPages = pages
      .filter((p) => p.pageNumber !== pageNum)
      .map((p, idx) => ({ ...p, pageNumber: idx + 1 }));
    setPages(newPages);
  };

  const handlePromptChange = (pageNum: number, prompt: string) => {
    setPages((prev) =>
      prev.map((p) => (p.pageNumber === pageNum ? { ...p, prompt } : p))
    );
  };

  const handleGeneratePage = (pageNum: number) => {
    const page = pages.find((p) => p.pageNumber === pageNum);
    if (!page || !page.prompt.trim()) {
      message.warning('请先输入该页的提示词');
      return;
    }
    setGeneratingPage(pageNum);
    setTimeout(() => {
      setPages((prev) =>
        prev.map((p) =>
          p.pageNumber === pageNum
            ? { ...p, imageUrl: mockGenerateImage(`update-${id}-${pageNum}`), regenerated: !!p.imageUrl }
            : p
        )
      );
      setGeneratingPage(null);
      message.success('第 ' + pageNum + ' 页图片生成成功！');
    }, 1500);
  };

  const handleSubmit = () => {
    if (!manga || !id) return;
    if (pages.length === 0) {
      message.warning('请至少添加一页内容');
      return;
    }
    const incompletePages = pages.filter((p) => !p.prompt.trim() || !p.imageUrl);
    if (incompletePages.length > 0) {
      message.warning('请确保所有页面都有描述和图片');
      return;
    }

    setSubmitting(true);
    const newPages = pages.map((p) => ({ prompt: p.prompt, imageUrl: p.imageUrl }));
    appendPages(id, newPages);
    message.success('新内容已提交，作品正在重新审核中');
    setSubmitting(false);
    setTimeout(() => navigate(`/manga/${id}`), 1500);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <Spin size="large" tip="加载作品信息..." />
      </div>
    );
  }

  if (!manga) return null;

  const existingPages = manga.pages || [];
  const allGenerated = pages.length > 0 && pages.every((p) => p.prompt && p.imageUrl);

  return (
    <div>
      <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} type="text" style={{ marginBottom: 16 }}>
        返回
      </Button>

      <Title level={isMobile ? 4 : 2} style={{ marginBottom: isMobile ? 8 : 12 }}>
        <EditOutlined style={{ marginRight: 8, color: '#fa8c16' }} />
        追加内容 — {manga.title}
      </Title>

      <Alert
        message={`当前已有 ${existingPages.length} 页，新增内容提交后需重新审核`}
        type="info"
        showIcon
        style={{ marginBottom: isMobile ? 16 : 24, borderRadius: 8 }}
      />

      {/* 新增页面列表 */}
      <Card
        title={
          <Space>
            <BulbOutlined /> 新增页面
            <Tag color="blue">{pages.length} 页</Tag>
          </Space>
        }
        style={{ borderRadius: 12, marginBottom: isMobile ? 16 : 24 }}
      >
        <List
          dataSource={pages}
          renderItem={(page) => (
            <List.Item
              key={page.pageNumber}
              style={{ flexDirection: 'column', alignItems: 'stretch', padding: isMobile ? '12px' : '20px', background: '#fafafa', borderRadius: 12, marginBottom: 12, border: '1px solid #f0f0f0' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <Tag color="blue" style={{ fontSize: isMobile ? 12 : 14, padding: '2px 10px' }}>
                  第 {existingPages.length + page.pageNumber} 页（新增）
                </Tag>
                <Space size="small">
                  {page.imageUrl && (
                    <Button
                      type="link"
                      icon={<ReloadOutlined />}
                      onClick={() => handleGeneratePage(page.pageNumber)}
                      loading={generatingPage === page.pageNumber}
                      size="small"
                    >
                      {isMobile ? '' : '重新生成'}
                    </Button>
                  )}
                  <Button
                    type="link"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => handleDeletePage(page.pageNumber)}
                    size="small"
                    disabled={pages.length <= 1}
                  >
                    {isMobile ? '' : '删除'}
                  </Button>
                </Space>
              </div>

              {/* Prompt + 生成按钮 */}
              <div style={{ display: 'flex', gap: isMobile ? 8 : 12, alignItems: 'flex-start', flexDirection: isMobile ? 'column' : 'row' }}>
                <TextArea
                  placeholder="描述这一页的画面内容..."
                  value={page.prompt}
                  onChange={(e) => handlePromptChange(page.pageNumber, e.target.value)}
                  rows={isMobile ? 2 : 3}
                  style={{ flex: 1 }}
                  maxLength={300}
                  showCount
                />
                <Button
                  type="primary"
                  icon={<ThunderboltOutlined />}
                  onClick={() => handleGeneratePage(page.pageNumber)}
                  loading={generatingPage === page.pageNumber}
                  style={isMobile ? { width: '100%', height: 44 } : { height: 78, minWidth: 100 }}
                >
                  <div>{page.imageUrl ? '重新生成' : 'AI 生成'}</div>
                  <div style={{ fontSize: 10, opacity: 0.8 }}>🆓 免费</div>
                </Button>
              </div>

              {/* 图片预览 */}
              {page.imageUrl && (
                <div style={{ marginTop: 12 }}>
                  <img
                    src={page.imageUrl}
                    alt={`第 ${page.pageNumber} 页预览`}
                    style={{
                      width: isMobile ? '100%' : 200,
                      maxHeight: 280,
                      objectFit: 'contain',
                      borderRadius: 8,
                      border: '1px solid #e8e8e8',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    }}
                  />
                </div>
              )}
            </List.Item>
          )}
        />

        <Button
          icon={<PlusOutlined />}
          onClick={handleAddPage}
          block
          style={{ borderStyle: 'dashed', height: 48, marginTop: 8 }}
        >
          添加新页面
        </Button>
      </Card>

      {/* 更新说明 */}
      <Card title={<Space><EditOutlined /> 更新说明（可选）</Space>} style={{ borderRadius: 12, marginBottom: isMobile ? 16 : 24 }}>
        <TextArea
          placeholder="简单说明一下这次更新的内容，例如：添加了后续剧情发展..."
          value={updateNote}
          onChange={(e) => setUpdateNote(e.target.value)}
          rows={2}
          maxLength={200}
          showCount
        />
      </Card>

      {/* 提交 */}
      <Card style={{ borderRadius: 12 }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <Text type="secondary" style={{ fontSize: 12 }}>
            提交后，新页面将进入审核状态，审核通过后读者才能看到新增内容。
          </Text>
          <Button
            type="primary"
            icon={<ThunderboltOutlined />}
            onClick={handleSubmit}
            loading={submitting}
            disabled={pages.length === 0 || !allGenerated}
            size="large"
            block
          >
            提交更新
          </Button>
        </Space>
      </Card>
    </div>
  );
}
