import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Form, Input, Button, Card, Typography, Tabs, InputNumber, Switch, Select,
  message, List, Space, Empty, Tag, Divider, Alert, Statistic, Row, Col, Grid
} from 'antd';
import {
  PlusOutlined, DeleteOutlined, ThunderboltOutlined,
  EyeOutlined, RocketOutlined, ReloadOutlined,
  FileImageOutlined, BulbOutlined, CoffeeOutlined,
  DollarOutlined, SafetyCertificateOutlined, UserOutlined,
} from '@ant-design/icons';
import { useAuthStore } from '../stores/authStore';
import { useMangaStore } from '../stores/mangaStore';
import type { AIPage } from '../types';
import { MANGA_TEMPLATES, generatePagesFromTemplate, generateTitleAndDescription } from '../data/mangaTemplates';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { useBreakpoint } = Grid;

const CURRENT_MODEL = 'Pollinations.ai (免费)';
const COST_PER_PAGE = 0;
const COST_PER_BATCH = 0;

function mockGenerateImage(seed: string): string {
  const randomSeed = Math.floor(Math.random() * 1000);
  return `https://picsum.photos/seed/${seed}${randomSeed}/800/1200`;
}

export default function CreatePage() {
  const navigate = useNavigate();
  const screens = useBreakpoint();
  const isMobile = !screens.md;
  const user = useAuthStore((s) => s.user);
  const addManga = useMangaStore((s) => s.addManga);
  const { getFreeRemaining, getCreditBalance, consumeFree } = useAuthStore();
  const [activeMode, setActiveMode] = useState<'panel' | 'oneshot' | 'template'>('template');
  const [submitting, setSubmitting] = useState(false);

  // ========== 分镜模式状态 ==========
  const [panelTitle, setPanelTitle] = useState('');
  const [panelAuthor, setPanelAuthor] = useState(user?.nickname || '');
  const [panelDescription, setPanelDescription] = useState('');
  const [pages, setPages] = useState<AIPage[]>([
    { pageNumber: 1, prompt: '', imageUrl: '' },
  ]);
  const [generatingPage, setGeneratingPage] = useState<number | null>(null);
  // 付费设置
  const [panelIsPaid, setPanelIsPaid] = useState(false);
  const [panelFreePages, setPanelFreePages] = useState(3);
  const [panelPricePoints, setPanelPricePoints] = useState(10);

  // ========== 模板模式状态 ==========
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [templateFieldValues, setTemplateFieldValues] = useState<Record<string, string>>({});
  const [templateGenerated, setTemplateGenerated] = useState(false);
  const [templatePages, setTemplatePages] = useState<AIPage[]>([]);
  const [templateGenerating, setTemplateGenerating] = useState(false);
  const [templateAuthor, setTemplateAuthor] = useState(user?.nickname || '');
  const [templateIsPaid, setTemplateIsPaid] = useState(false);
  const [templateFreePages, setTemplateFreePages] = useState(3);
  const [templatePricePoints, setTemplatePricePoints] = useState(10);

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
    if (COST_PER_PAGE > 0) {
      message.warning('点数不足');
      return;
    }
    const freeResult = consumeFree();
    if (!freeResult.success) {
      message.warning(freeResult.message);
      return;
    }
    setGeneratingPage(pageNum);
    message.info(freeResult.message);
    setTimeout(() => {
      setPages((prev) =>
        prev.map((p) =>
          p.pageNumber === pageNum
            ? { ...p, imageUrl: mockGenerateImage(`panel${pageNum}`), regenerated: !!p.imageUrl }
            : p
        )
      );
      setGeneratingPage(null);
      message.success(`第 ${pageNum} 页生成完成`);
    }, 1500);
  };

  const handleRegeneratePage = (pageNum: number) => {
    const freeResult = consumeFree();
    if (!freeResult.success) {
      message.warning(freeResult.message);
      return;
    }
    message.info(freeResult.message);
    setGeneratingPage(pageNum);
    setTimeout(() => {
      setPages((prev) =>
        prev.map((p) =>
          p.pageNumber === pageNum
            ? { ...p, imageUrl: mockGenerateImage(`regen${pageNum}`), regenerated: true }
            : p
        )
      );
      setGeneratingPage(null);
      message.success(`第 ${pageNum} 页已重新生成`);
    }, 1500);
  };

  const handlePanelPublish = () => {
    if (!panelTitle.trim()) { message.warning('请输入漫画标题'); return; }
    if (!panelAuthor.trim()) { message.warning('请输入作者署名'); return; }
    if (!panelDescription.trim()) { message.warning('请输入漫画简介'); return; }
    const unprompted = pages.filter((p) => !p.prompt.trim());
    if (unprompted.length > 0) { message.warning(`第 ${unprompted[0].pageNumber} 页尚未输入提示词`); return; }
    const ungenerated = pages.filter((p) => !p.imageUrl);
    if (ungenerated.length > 0) { message.warning(`第 ${ungenerated[0].pageNumber} 页尚未生成图片`); return; }

    setSubmitting(true);
    try {
      addManga({
        title: panelTitle, author: panelAuthor, description: panelDescription,
        coverUrl: pages[0].imageUrl, pages: pages.map((p) => ({ ...p, auditStatus: 'pending' as const })),
        mode: 'panel', isOfficial: false, tags: [],
        auditStatus: 'pending', generationModel: CURRENT_MODEL, creditCost: pages.length * COST_PER_PAGE,
        uploadedBy: user?.nickname,
        isPaid: panelIsPaid,
        freePages: panelIsPaid ? panelFreePages : undefined,
        pricePoints: panelIsPaid ? panelPricePoints : undefined,
      });
      message.success('AI 漫画发布成功！作品正在审核中');
      setTimeout(() => navigate('/'), 1500);
    } catch { message.error('发布失败，请重试'); }
    finally { setSubmitting(false); }
  };

  // ========== 一次性模式 ==========
  const [oneshotTitle, setOneshotTitle] = useState('');
  const [oneshotAuthor, setOneshotAuthor] = useState(user?.nickname || '');
  const [oneshotDescription, setOneshotDescription] = useState('');
  const [storyPrompt, setStoryPrompt] = useState('');
  const [pageCount, setPageCount] = useState(4);
  const [generatedPages, setGeneratedPages] = useState<AIPage[]>([]);
  const [batchGenerating, setBatchGenerating] = useState(false);
  // 付费设置
  const [oneshotIsPaid, setOneshotIsPaid] = useState(false);
  const [oneshotFreePages, setOneshotFreePages] = useState(3);
  const [oneshotPricePoints, setOneshotPricePoints] = useState(10);

  const handleBatchGenerate = () => {
    if (!storyPrompt.trim()) { message.warning('请输入故事描述'); return; }
    if (!oneshotTitle.trim()) { message.warning('请输入漫画标题'); return; }
    if (COST_PER_BATCH > 0) { message.warning('点数不足'); return; }
    const freeResult = consumeFree();
    if (!freeResult.success) { message.warning(freeResult.message); return; }
    message.info(freeResult.message);

    setBatchGenerating(true);
    const newPages: AIPage[] = [];
    let completed = 0;
    for (let i = 0; i < pageCount; i++) {
      setTimeout(() => {
        completed++;
        newPages.push({ pageNumber: i + 1, prompt: `${storyPrompt} - 第${i + 1}页`, imageUrl: mockGenerateImage(`oneshot${i}`) });
        setGeneratedPages([...newPages]);
        if (completed === pageCount) { setBatchGenerating(false); message.success(`全部 ${pageCount} 页生成完成！`); }
      }, (i + 1) * 1200);
    }
  };

  const handleDeleteGeneratedPage = (pageNum: number) => {
    const newPages = generatedPages.filter((p) => p.pageNumber !== pageNum).map((p, idx) => ({ ...p, pageNumber: idx + 1 }));
    setGeneratedPages(newPages);
  };

  const handleRegenOneshotPage = (pageNum: number) => {
    const freeResult = consumeFree();
    if (!freeResult.success) { message.warning(freeResult.message); return; }
    message.info(freeResult.message);
    setGeneratedPages((prev) =>
      prev.map((p) => p.pageNumber === pageNum ? { ...p, imageUrl: mockGenerateImage(`rego${pageNum}`), regenerated: true } : p)
    );
    message.success(`第 ${pageNum} 页已重新生成`);
  };

  const handleOneshotPublish = () => {
    if (!oneshotTitle.trim()) { message.warning('请输入漫画标题'); return; }
    if (!oneshotAuthor.trim()) { message.warning('请输入作者署名'); return; }
    if (!oneshotDescription.trim()) { message.warning('请输入漫画简介'); return; }
    if (generatedPages.length === 0) { message.warning('请先生成漫画内容'); return; }

    setSubmitting(true);
    try {
      addManga({
        title: oneshotTitle, author: oneshotAuthor, description: oneshotDescription,
        coverUrl: generatedPages[0].imageUrl, pages: generatedPages.map((p) => ({ ...p, auditStatus: 'pending' as const })),
        mode: 'oneshot', isOfficial: false, tags: [],
        auditStatus: 'pending', generationModel: CURRENT_MODEL, creditCost: COST_PER_BATCH,
        uploadedBy: user?.nickname,
        isPaid: oneshotIsPaid,
        freePages: oneshotIsPaid ? oneshotFreePages : undefined,
        pricePoints: oneshotIsPaid ? oneshotPricePoints : undefined,
      });
      message.success('AI 漫画发布成功！作品正在审核中');
      setTimeout(() => navigate('/'), 1500);
    } catch { message.error('发布失败，请重试'); }
    finally { setSubmitting(false); }
  };

  // ========== 模板模式处理函数 ==========
  const handleTemplateFieldChange = (key: string, value: string) => {
    setTemplateFieldValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleGenerateFromTemplate = () => {
    const template = MANGA_TEMPLATES.find((t) => t.id === selectedTemplateId);
    if (!template) {
      message.warning('请先选择模板');
      return;
    }
    const missingFields = template.fields.filter((f) => !templateFieldValues[f.key]?.trim());
    if (missingFields.length > 0) {
      message.warning(`请填写：${missingFields.map((f) => f.label).join('、')}`);
      return;
    }
    setTemplateGenerating(true);
    message.info('正在为你生成漫画...');
    setTimeout(() => {
      const pages = generatePagesFromTemplate(template, templateFieldValues);
      const pagesWithNumber = pages.map((p, i) => ({ ...p, pageNumber: i + 1 }));
      setTemplatePages(pagesWithNumber);
      setTemplateGenerated(true);
      setTemplateGenerating(false);
      message.success('漫画生成成功！你可以预览并发布');
    }, 2000);
  };

  const handlePublishTemplateManga = () => {
    const template = MANGA_TEMPLATES.find((t) => t.id === selectedTemplateId);
    if (!template || templatePages.length === 0) return;
    const { title, description } = generateTitleAndDescription(template, templateFieldValues);
    if (!templateAuthor.trim()) { message.warning('请输入作者署名'); return; }
    setSubmitting(true);
    try {
      addManga({
        title, author: templateAuthor, description,
        coverUrl: templatePages[0].imageUrl,
        pages: templatePages.map((p) => ({ ...p, auditStatus: 'pending' as const })),
        mode: 'oneshot', isOfficial: false, tags: [template.name],
        auditStatus: 'pending', generationModel: CURRENT_MODEL, creditCost: templatePages.length * COST_PER_PAGE,
        uploadedBy: user?.nickname,
        isPaid: templateIsPaid,
        freePages: templateIsPaid ? templateFreePages : undefined,
        pricePoints: templateIsPaid ? templatePricePoints : undefined,
      });
      message.success('AI 漫画发布成功！作品正在审核中');
      setTimeout(() => navigate('/'), 1500);
    } catch { message.error('发布失败，请重试'); }
    finally { setSubmitting(false); }
  };

  // ========== 渲染 ==========
  const cardPadding = isMobile ? '16px' : '24px 32px';

  const panelExtra = (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
      {!isMobile && (
        <Tag color={pages.every((p) => p.imageUrl) ? 'green' : 'processing'}>
          {pages.filter((p) => p.imageUrl).length}/{pages.length} 页已生成
        </Tag>
      )}
      <Button type="primary" icon={<RocketOutlined />} onClick={handlePanelPublish} loading={submitting} size={isMobile ? 'small' : 'middle'}>
        发布作品
      </Button>
    </div>
  );

  const oneshotExtra = (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      {!isMobile && generatedPages.length > 0 && (
        <Tag color="green">{generatedPages.length} 页已生成</Tag>
      )}
      <Button type="primary" icon={<RocketOutlined />} onClick={handleOneshotPublish} loading={submitting} disabled={generatedPages.length === 0} size={isMobile ? 'small' : 'middle'}>
        发布作品
      </Button>
    </div>
  );

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', paddingTop: isMobile ? 0 : 16 }}>
      <div style={{ textAlign: 'center', marginBottom: isMobile ? 16 : 24 }}>
        <Title level={isMobile ? 4 : 2} style={{ marginBottom: 4 }}>
          <BulbOutlined style={{ marginRight: 12, color: '#faad14' }} />
          AI 漫画创作
        </Title>
        {!isMobile && <Text type="secondary">输入你的创意，AI 帮你变成漫画</Text>}
      </div>

      {/* 资源概览栏 */}
      <Card size="small" style={{ marginBottom: isMobile ? 12 : 16, borderRadius: 12, background: 'linear-gradient(135deg, #f6ffed 0%, #e6f7ff 100%)' }}>
        {isMobile ? (
          <div style={{ display: 'flex', justifyContent: 'space-around', textAlign: 'center' }}>
            <div>
              <div style={{ fontSize: 12, color: '#888' }}>今日免费</div>
              <div style={{ fontSize: 20, color: '#52c41a', fontWeight: 600 }}>{getFreeRemaining()}/3</div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: '#888' }}>可用点数</div>
              <div style={{ fontSize: 20, color: '#1677ff', fontWeight: 600 }}>{getCreditBalance()}</div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: '#888' }}>模型</div>
              <div style={{ fontSize: 12, color: '#52c41a' }}>Pollinations.ai</div>
            </div>
          </div>
        ) : (
          <Row gutter={16} align="middle">
            <Col flex="auto">
              <Space size="large">
                <Statistic title="今日免费" value={getFreeRemaining()} suffix="/ 3 次" valueStyle={{ color: '#52c41a', fontSize: 20 }} prefix={<CoffeeOutlined />} />
                <Statistic title="可用点数" value={getCreditBalance()} suffix="点" valueStyle={{ color: '#1677ff', fontSize: 20 }} prefix={<DollarOutlined />} />
                <Tag color="green" style={{ fontSize: 13 }}><SafetyCertificateOutlined /> 当前模型：{CURRENT_MODEL}</Tag>
              </Space>
            </Col>
          </Row>
        )}
      </Card>

      {/* 内容规范提示 */}
      <Alert
        message="内容规范提醒"
        description={isMobile ? '禁止暴力、色情、政治敏感等内容。发布后进入审核。' : '禁止生成暴力、血腥、色情、政治敏感等内容。所有作品发布后进入审核流程，违规内容将被下架，严重违规将冻结账号。请遵守社区规范，共创良好创作环境。'}
        type="warning"
        showIcon
        icon={<SafetyCertificateOutlined />}
        style={{ marginBottom: isMobile ? 12 : 16, borderRadius: 12 }}
        closable
      />

      <Card
        style={{ borderRadius: 12, boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}
        styles={{ body: { padding: cardPadding } }}
      >
        <Tabs
          activeKey={activeMode}
          onChange={(key) => { setActiveMode(key as 'panel' | 'oneshot' | 'template'); }}
          tabBarExtraContent={activeMode === 'panel' ? panelExtra : activeMode === 'oneshot' ? oneshotExtra : null}
          size={isMobile ? 'small' : 'middle'}
          items={[
            // ============ 模板创作 ============
            {
              key: 'template',
              label: <span><RocketOutlined />{isMobile ? '模板' : '模板创作'}</span>,
              children: (
                <div>
                  <Alert 
                    message="模板创作：选择一个故事模板，填空即可生成漫画。零门槛，人人都能当漫画家！" 
                    type="success" 
                    showIcon 
                    style={{ marginBottom: isMobile ? 16 : 24, borderRadius: 8 }} 
                  />

                  {/* 模板选择 */}
                  {!selectedTemplateId && (
                    <div>
                      <Title level={isMobile ? 5 : 4} style={{ marginBottom: 16 }}>
                        🎨 选择创作模板
                      </Title>
                      <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: `repeat(auto-fill, minmax(${isMobile ? 140 : 200}px, 1fr))`, 
                        gap: 16 
                      }}>
                        {MANGA_TEMPLATES.map((template) => (
                          <Card
                            key={template.id}
                            hoverable
                            onClick={() => {
                              setSelectedTemplateId(template.id);
                              setTemplateFieldValues({});
                              setTemplateGenerated(false);
                              setTemplatePages([]);
                            }}
                            style={{ borderRadius: 12, textAlign: 'center' }}
                          >
                            <div style={{ fontSize: 48, marginBottom: 8 }}>{template.emoji}</div>
                            <Title level={5} style={{ margin: '0 0 4px 0' }}>{template.name}</Title>
                            <Text type="secondary" style={{ fontSize: 12 }}>{template.description}</Text>
                            <div style={{ marginTop: 8 }}>
                              <Tag color="blue">{template.pages.length} 页</Tag>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 模板表单 */}
                  {selectedTemplateId && !templateGenerated && (
                    <Card style={{ borderRadius: 12, marginBottom: 16 }}>
                      <Button 
                        type="link" 
                        onClick={() => {
                          setSelectedTemplateId('');
                          setTemplateFieldValues({});
                        }}
                        style={{ padding: 0, marginBottom: 16 }}
                      >
                        ← 返回模板选择
                      </Button>
                      
                      {(() => {
                        const template = MANGA_TEMPLATES.find((t) => t.id === selectedTemplateId)!;
                        return (
                          <>
                            <Title level={isMobile ? 5 : 4} style={{ marginBottom: 16 }}>
                              {template.emoji} {template.name}
                            </Title>
                            <Form layout="vertical" size={isMobile ? 'middle' : 'large'}>
                              {template.fields.map((field) => (
                                <Form.Item key={field.key} label={field.label} required>
                                  {field.type === 'select' ? (
                                    <Select
                                      placeholder={field.placeholder}
                                      value={templateFieldValues[field.key] || undefined}
                                      onChange={(value: string) => handleTemplateFieldChange(field.key, value)}
                                    >
                                      {field.options?.map((opt) => (
                                        <Select.Option key={opt} value={opt}>{opt}</Select.Option>
                                      ))}
                                    </Select>
                                  ) : (
                                    <Input
                                      placeholder={field.placeholder}
                                      value={templateFieldValues[field.key] || ''}
                                      onChange={(e) => handleTemplateFieldChange(field.key, e.target.value)}
                                      maxLength={field.maxLength}
                                      showCount
                                    />
                                  )}
                                </Form.Item>
                              ))}
                              <Form.Item label="作者署名">
                                <Input
                                  prefix={<UserOutlined />}
                                  placeholder="你的笔名"
                                  value={templateAuthor}
                                  onChange={(e) => setTemplateAuthor(e.target.value)}
                                  maxLength={20}
                                  showCount
                                />
                              </Form.Item>
                            </Form>
                            <Button
                              type="primary"
                              icon={<ThunderboltOutlined />}
                              onClick={handleGenerateFromTemplate}
                              loading={templateGenerating}
                              size="large"
                              block
                              style={{ height: 56, fontSize: 18, marginTop: 24, borderRadius: 12 }}
                            >
                              {templateGenerating ? '正在生成中...' : '✨ 一键生成漫画'}
                            </Button>
                          </>
                        );
                      })()}
                    </Card>
                  )}

                  {/* 生成完成，预览和发布 */}
                  {templateGenerated && (
                    <div>
                      <Alert
                        message={`✅ 漫画生成成功！共 ${templatePages.length} 页`}
                        type="success"
                        showIcon
                        style={{ marginBottom: 16, borderRadius: 8 }}
                      />
                      
                      {/* 预览页面 */}
                      <Card title="页面预览" style={{ borderRadius: 12, marginBottom: 16 }}>
                        <List
                          grid={{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 4 }}
                          dataSource={templatePages}
                          renderItem={(page) => (
                            <List.Item>
                              <Card
                                size="small"
                                cover={
                                  <img src={page.imageUrl} alt={`第${page.pageNumber}页`} style={{ width: '100%', height: 200, objectFit: 'cover' }} />
                                }
                              >
                                <Card.Meta title={`第 ${page.pageNumber} 页`} description={page.prompt.slice(0, 50) + '...'} />
                              </Card>
                            </List.Item>
                          )}
                        />
                      </Card>

                      {/* 付费设置 */}
                      <Card title="付费设置" style={{ borderRadius: 12, marginBottom: 16 }}>
                        <Form layout="vertical">
                          <Form.Item label="付费阅读">
                            <Space direction="vertical" style={{ width: '100%' }}>
                              <Switch
                                checked={templateIsPaid}
                                onChange={setTemplateIsPaid}
                                checkedChildren="开启付费"
                                unCheckedChildren="免费阅读"
                              />
                              <Text type="secondary" style={{ fontSize: 12 }}>
                                开启后，读者需付费解锁后续章节，你将获得收益
                              </Text>
                              {templateIsPaid && (
                                <Row gutter={16} style={{ marginTop: 8 }}>
                                  <Col span={12}>
                                    <Text style={{ fontSize: 12 }}>免费页数</Text>
                                    <InputNumber
                                      min={1}
                                      max={templatePages.length - 1 || 1}
                                      value={templateFreePages}
                                      onChange={(v) => setTemplateFreePages(v || 1)}
                                      style={{ width: '100%' }}
                                      addonAfter="页"
                                    />
                                  </Col>
                                  <Col span={12}>
                                    <Text style={{ fontSize: 12 }}>解锁价格</Text>
                                    <InputNumber
                                      min={1}
                                      max={999}
                                      value={templatePricePoints}
                                      onChange={(v) => setTemplatePricePoints(v || 1)}
                                      style={{ width: '100%' }}
                                      addonAfter="点数"
                                    />
                                  </Col>
                                </Row>
                              )}
                            </Space>
                          </Form.Item>
                        </Form>
                      </Card>

                      <Button
                        type="primary"
                        icon={<RocketOutlined />}
                        onClick={handlePublishTemplateManga}
                        loading={submitting}
                        size="large"
                        block
                        style={{ height: 56, fontSize: 18, borderRadius: 12 }}
                      >
                        🚀 发布漫画
                      </Button>
                    </div>
                  )}
                </div>
              ),
            },
            // ============ 分镜式编辑器 ============
            {
              key: 'panel',
              label: <span><FileImageOutlined />{isMobile ? '分镜' : '分镜式编辑'}</span>,
              children: (
                <div>
                  <Alert message="分镜式编辑：逐页输入提示词，精确控制每一页的内容。适合对画面有明确想法的创作者。" type="info" showIcon style={{ marginBottom: isMobile ? 16 : 24, borderRadius: 8 }} />

                  <Form layout="vertical" size={isMobile ? 'middle' : 'large'}>
                    <Form.Item label="漫画标题" required>
                      <Input placeholder="给你的 AI 漫画起个名字..." value={panelTitle} onChange={(e) => setPanelTitle(e.target.value)} maxLength={50} showCount />
                    </Form.Item>
                    <Form.Item label="作者署名">
                      <Input
                        prefix={<UserOutlined />}
                        placeholder="你的笔名/署名"
                        value={panelAuthor}
                        onChange={(e) => setPanelAuthor(e.target.value)}
                        maxLength={20}
                        showCount
                      />
                      <Text type="secondary" style={{ fontSize: 12 }}>默认取你的昵称，可以修改为笔名</Text>
                    </Form.Item>
                    <Form.Item label="漫画简介" required>
                      <TextArea placeholder="简要介绍一下这部漫画的故事..." value={panelDescription} onChange={(e) => setPanelDescription(e.target.value)} rows={isMobile ? 2 : 2} maxLength={200} showCount />
                    </Form.Item>
                    <Form.Item label="付费阅读">
                      <Space direction="vertical" style={{ width: '100%' }}>
                        <Switch
                          checked={panelIsPaid}
                          onChange={setPanelIsPaid}
                          checkedChildren="开启付费"
                          unCheckedChildren="免费阅读"
                        />
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          开启后，读者需付费解锁后续章节，你将获得收益
                        </Text>
                        {panelIsPaid && (
                          <Row gutter={16} style={{ marginTop: 8 }}>
                            <Col span={12}>
                              <Text style={{ fontSize: 12 }}>免费页数</Text>
                              <InputNumber
                                min={1}
                                max={pages.length - 1 || 1}
                                value={panelFreePages}
                                onChange={(v) => setPanelFreePages(v || 1)}
                                style={{ width: '100%' }}
                                addonAfter="页"
                              />
                            </Col>
                            <Col span={12}>
                              <Text style={{ fontSize: 12 }}>解锁价格</Text>
                              <InputNumber
                                min={1}
                                max={999}
                                value={panelPricePoints}
                                onChange={(v) => setPanelPricePoints(v || 1)}
                                style={{ width: '100%' }}
                                addonAfter="点数"
                              />
                            </Col>
                          </Row>
                        )}
                      </Space>
                    </Form.Item>
                  </Form>

                  <Divider>漫画分页</Divider>

                  <List
                    dataSource={pages}
                    renderItem={(page) => (
                      <List.Item
                        key={page.pageNumber}
                        style={{ flexDirection: 'column', alignItems: 'stretch', padding: isMobile ? '12px' : '20px', background: '#fafafa', borderRadius: 12, marginBottom: 12, border: '1px solid #f0f0f0' }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                          <Tag color="blue" style={{ fontSize: isMobile ? 12 : 14, padding: '2px 10px' }}>第 {page.pageNumber} 页</Tag>
                          <Space size="small">
                            {page.imageUrl && (
                              <Button type="link" icon={<ReloadOutlined />} onClick={() => handleRegeneratePage(page.pageNumber)} loading={generatingPage === page.pageNumber} size="small">
                                {isMobile ? '' : '重新生成'}
                              </Button>
                            )}
                            <Button type="link" danger icon={<DeleteOutlined />} onClick={() => handleDeletePage(page.pageNumber)} size="small">
                              {isMobile ? '' : '删除'}
                            </Button>
                          </Space>
                        </div>

                        {/* Prompt + 生成按钮 */}
                        <div style={{ display: 'flex', gap: isMobile ? 8 : 12, alignItems: 'flex-start', flexDirection: isMobile ? 'column' : 'row' }}>
                          <TextArea
                            placeholder="描述这一页的画面内容..."
                            value={page.prompt} onChange={(e) => handlePromptChange(page.pageNumber, e.target.value)}
                            rows={isMobile ? 2 : 3} style={{ flex: 1 }} maxLength={300} showCount
                          />
                          <Button
                            type="primary" icon={<ThunderboltOutlined />}
                            onClick={() => handleGeneratePage(page.pageNumber)}
                            loading={generatingPage === page.pageNumber}
                            style={isMobile ? { width: '100%', height: 44 } : { height: 78, minWidth: 100 }}
                          >
                            <div>{page.imageUrl ? '重新生成' : 'AI 生成'}</div>
                            <div style={{ fontSize: 10, opacity: 0.8 }}>🆓 免费</div>
                          </Button>
                        </div>

                        {page.imageUrl && (
                          <div style={{ marginTop: 16, textAlign: 'center' }}>
                            <img src={page.imageUrl} alt={`第 ${page.pageNumber} 页`}
                              style={{ maxWidth: '100%', maxHeight: isMobile ? 300 : 400, borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                            {page.regenerated && <Tag color="orange" style={{ marginTop: 8 }}>已重新生成</Tag>}
                          </div>
                        )}
                      </List.Item>
                    )}
                  />

                  <div style={{ textAlign: 'center', marginTop: 16 }}>
                    <Button type="dashed" icon={<PlusOutlined />} onClick={handleAddPage} size={isMobile ? 'middle' : 'large'}
                      style={{ width: '100%', height: isMobile ? 48 : 56, borderRadius: 12 }}>
                      添加新页面
                    </Button>
                    <Text type="secondary" style={{ display: 'block', marginTop: 8 }}>当前共 {pages.length} 页</Text>
                  </div>
                </div>
              ),
            },

            // ============ 一次性生成 ============
            {
              key: 'oneshot',
              label: <span><RocketOutlined />{isMobile ? '一键' : '一次性生成'}</span>,
              children: (
                <div>
                  <Alert message="一次性生成：输入完整故事描述，AI 自动拆解为多页漫画。适合快速创作和灵感探索。" type="info" showIcon style={{ marginBottom: isMobile ? 16 : 24, borderRadius: 8 }} />

                  <Form layout="vertical" size={isMobile ? 'middle' : 'large'}>
                    <Form.Item label="漫画标题" required>
                      <Input placeholder="给你的 AI 漫画起个名字..." value={oneshotTitle} onChange={(e) => setOneshotTitle(e.target.value)} maxLength={50} showCount />
                    </Form.Item>
                    <Form.Item label="作者署名">
                      <Input
                        prefix={<UserOutlined />}
                        placeholder="你的笔名/署名"
                        value={oneshotAuthor}
                        onChange={(e) => setOneshotAuthor(e.target.value)}
                        maxLength={20}
                        showCount
                      />
                      <Text type="secondary" style={{ fontSize: 12 }}>默认取你的昵称，可以修改为笔名</Text>
                    </Form.Item>
                    <Form.Item label="漫画简介" required>
                      <TextArea placeholder="简要介绍一下这部漫画的故事..." value={oneshotDescription} onChange={(e) => setOneshotDescription(e.target.value)} rows={2} maxLength={200} showCount />
                    </Form.Item>
                    <Form.Item label="付费阅读">
                      <Space direction="vertical" style={{ width: '100%' }}>
                        <Switch
                          checked={oneshotIsPaid}
                          onChange={setOneshotIsPaid}
                          checkedChildren="开启付费"
                          unCheckedChildren="免费阅读"
                        />
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          开启后，读者需付费解锁后续章节，你将获得收益
                        </Text>
                        {oneshotIsPaid && (
                          <Row gutter={16} style={{ marginTop: 8 }}>
                            <Col span={12}>
                              <Text style={{ fontSize: 12 }}>免费页数</Text>
                              <InputNumber
                                min={1}
                                max={generatedPages.length - 1 || 1}
                                value={oneshotFreePages}
                                onChange={(v) => setOneshotFreePages(v || 1)}
                                style={{ width: '100%' }}
                                addonAfter="页"
                              />
                            </Col>
                            <Col span={12}>
                              <Text style={{ fontSize: 12 }}>解锁价格</Text>
                              <InputNumber
                                min={1}
                                max={999}
                                value={oneshotPricePoints}
                                onChange={(v) => setOneshotPricePoints(v || 1)}
                                style={{ width: '100%' }}
                                addonAfter="点数"
                              />
                            </Col>
                          </Row>
                        )}
                      </Space>
                    </Form.Item>
                  </Form>

                  <Divider>故事描述</Divider>

                  <Form layout="vertical" size={isMobile ? 'middle' : 'large'}>
                    <Form.Item label="完整故事描述" required>
                      <TextArea placeholder="详细描述你的故事：世界观设定、人物角色、情节发展... AI 会根据你的描述拆解为多页漫画。" value={storyPrompt} onChange={(e) => setStoryPrompt(e.target.value)} rows={isMobile ? 4 : 6} maxLength={1000} showCount />
                    </Form.Item>
                    <Form.Item label="生成页数">
                      <InputNumber min={3} max={10} value={pageCount} onChange={(v) => setPageCount(v || 4)} style={{ width: isMobile ? '100%' : 200 }} addonAfter="页" />
                      <Text type="secondary" style={{ marginLeft: 12, display: isMobile ? 'block' : 'inline', marginTop: isMobile ? 4 : 0 }}>建议 4-6 页为最佳阅读体验</Text>
                    </Form.Item>
                  </Form>

                  <div style={{ textAlign: 'center', marginBottom: 24 }}>
                    <Button type="primary" size={isMobile ? 'middle' : 'large'} icon={<ThunderboltOutlined />}
                      onClick={handleBatchGenerate} loading={batchGenerating}
                      style={{ height: isMobile ? 44 : 52, padding: isMobile ? '0 24px' : '0 48px', borderRadius: 12, fontSize: isMobile ? 14 : 16 }}>
                      <div>{batchGenerating ? 'AI 正在创作中...' : 'AI 一键生成全部页面'}</div>
                      <div style={{ fontSize: 11, opacity: 0.8 }}>🆓 免费 · 消耗1次</div>
                    </Button>
                  </div>

                  {generatedPages.length > 0 && (
                    <>
                      <Divider>生成结果预览</Divider>
                      <List
                        grid={{ gutter: isMobile ? 8 : 16, xs: 1, sm: 2, md: 2, lg: 3, xl: 3 }}
                        dataSource={generatedPages}
                        renderItem={(page) => (
                          <List.Item key={page.pageNumber}>
                            <Card hoverable size="small"
                              cover={
                                <div style={{ position: 'relative' }}>
                                  <img alt={`第 ${page.pageNumber} 页`} src={page.imageUrl} style={{ width: '100%', height: isMobile ? 160 : 220, objectFit: 'cover' }} />
                                  <Tag color="blue" style={{ position: 'absolute', top: 8, left: 8 }}>第 {page.pageNumber} 页</Tag>
                                </div>
                              }
                              actions={[
                                <Button key="regen" type="link" icon={<ReloadOutlined />} onClick={() => handleRegenOneshotPage(page.pageNumber)} size="small">{isMobile ? '' : '重生成'}</Button>,
                                <Button key="delete" type="link" danger icon={<DeleteOutlined />} onClick={() => handleDeleteGeneratedPage(page.pageNumber)} size="small">{isMobile ? '' : '删除'}</Button>,
                              ]}>
                              <Paragraph ellipsis={{ rows: 2 }} style={{ fontSize: 13, margin: 0 }}>{page.prompt}</Paragraph>
                            </Card>
                          </List.Item>
                        )}
                      />
                    </>
                  )}
                </div>
              ),
            },
          ]}
        />
      </Card>
    </div>
  );
}
