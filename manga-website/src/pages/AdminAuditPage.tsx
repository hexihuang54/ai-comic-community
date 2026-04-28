import { useState, useEffect, useMemo } from 'react';
import {
  Card, Tabs, Typography, Tag, Button, Space, Modal, Input, message,
  Empty, Image, Row, Col, Statistic, Descriptions, Grid, Popconfirm, Pagination
} from 'antd';
import {
  CheckOutlined, CloseOutlined, EyeOutlined,
  ClockCircleOutlined, SafetyCertificateOutlined,
  CheckCircleOutlined, MinusCircleOutlined,
  ExclamationCircleOutlined, UserOutlined,
  TeamOutlined, CrownOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useMangaStore } from '../stores/mangaStore';
import { useAuthStore } from '../stores/authStore';
import type { AIManga, User } from '../types';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { useBreakpoint } = Grid;

type AuditTab = 'pending' | 'approved' | 'rejected';

export default function AdminAuditPage() {
  const navigate = useNavigate();
  const screens = useBreakpoint();
  const isMobile = !screens.md;
  const { mangas, loadMangas, updateMangaAuditStatus } = useMangaStore();
  const { user: currentUser, allUsers, loadAllUsers, updateUserRole } = useAuthStore();
  const [activeTab, setActiveTab] = useState<AuditTab>('pending');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);
  const [rejectModal, setRejectModal] = useState<{ open: boolean; manga: AIManga | null }>({ open: false, manga: null });
  const [rejectReason, setRejectReason] = useState('');
  const [detailModal, setDetailModal] = useState<{ open: boolean; manga: AIManga | null }>({ open: false, manga: null });

  useEffect(() => { loadMangas(); }, [loadMangas]);
  useEffect(() => { loadAllUsers(); }, [loadAllUsers]);

  // 按审核状态分组
  const { pendingList, approvedList, rejectedList } = useMemo(() => ({
    pendingList: mangas.filter((m) => m.auditStatus === 'pending'),
    approvedList: mangas.filter((m) => m.auditStatus === 'approved'),
    rejectedList: mangas.filter((m) => m.auditStatus === 'rejected'),
  }), [mangas]);

  // 审核通过
  const handleApprove = (mangaId: string, title: string) => {
    const ok = updateMangaAuditStatus(mangaId, 'approved');
    if (ok) message.success(`「${title}」审核通过`);
    else message.error('操作失败，请重试');
  };

  // 打开驳回弹窗
  const handleOpenReject = (manga: AIManga) => {
    setRejectModal({ open: true, manga });
    setRejectReason('');
  };

  // 确认驳回
  const handleConfirmReject = () => {
    if (!rejectModal.manga) return;
    if (!rejectReason.trim()) {
      message.warning('请填写驳回理由');
      return;
    }
    const ok = updateMangaAuditStatus(rejectModal.manga.id, 'rejected', rejectReason.trim());
    if (ok) message.success(`「${rejectModal.manga.title}」已驳回`);
    else message.error('操作失败，请重试');
    setRejectModal({ open: false, manga: null });
  };

  // 格式化时间
  const formatTime = (iso?: string) => {
    if (!iso) return '-';
    return new Date(iso).toLocaleString('zh-CN');
  };

  // 渲染单个作品卡片
  const renderMangaCard = (manga: AIManga) => {
    const statusColor = manga.auditStatus === 'approved' ? 'green' : manga.auditStatus === 'rejected' ? 'red' : 'orange';
    const statusText = manga.auditStatus === 'approved' ? '已通过' : manga.auditStatus === 'rejected' ? '已驳回' : '待审核';
    const statusIcon = manga.auditStatus === 'approved'
      ? <CheckCircleOutlined /> : manga.auditStatus === 'rejected'
      ? <MinusCircleOutlined /> : <ClockCircleOutlined />;

    return (
      <Card
        key={manga.id}
        hoverable
        style={{ borderRadius: 12, marginBottom: 16, overflow: 'hidden' }}
        styles={{ body: { padding: isMobile ? 12 : 20 } }}
      >
        <Row gutter={isMobile ? 12 : 24} wrap={isMobile}>
          {/* 封面 */}
          <Col xs={isMobile ? 8 : 5} sm={5} md={4}>
            <Image
              src={manga.coverUrl}
              alt={manga.title}
              style={{ borderRadius: 8, width: '100%', aspectRatio: '3/4', objectFit: 'cover' }}
              fallback="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjU2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiNjY2MiIGZvbnQtc2l6ZT0iMTgiPuWwgeacuuWSjOeJiDwvdGV4dD48L3N2Zz4="
              preview={{ mask: <EyeOutlined /> }}
            />
          </Col>

          {/* 信息 */}
          <Col xs={isMobile ? 16 : 19} sm={19} md={20}>
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 6 }}>
                  <Title level={isMobile ? 5 : 4} style={{ margin: 0 }}>{manga.title}</Title>
                  <Tag color={statusColor} icon={statusIcon}>{statusText}</Tag>
                </div>
                <Space size={isMobile ? 8 : 16} wrap>
                  <Text type="secondary">👤 {manga.author}</Text>
                  <Text type="secondary">📄 {manga.pages.length} 页</Text>
                  <Text type="secondary">🎨 {manga.mode === 'panel' ? '分镜式' : '一次性'}</Text>
                  <Text type="secondary">⏱ {new Date(manga.createdAt).toLocaleDateString('zh-CN')}</Text>
                </Space>
                <Paragraph type="secondary" ellipsis={{ rows: isMobile ? 1 : 2 }} style={{ marginTop: 8, marginBottom: 0 }}>
                  {manga.description}
                </Paragraph>

                {/* 审核详情 */}
                {manga.auditStatus === 'rejected' && manga.rejectReason && (
                  <div style={{ marginTop: 8, padding: '6px 10px', background: '#fff2f0', borderRadius: 6, border: '1px solid #ffccc7' }}>
                    <Text type="danger" style={{ fontSize: 12 }}>
                      <ExclamationCircleOutlined /> 驳回理由：{manga.rejectReason}
                    </Text>
                  </div>
                )}
                {manga.reviewedAt && (
                  <div style={{ marginTop: 4 }}>
                    <Text type="secondary" style={{ fontSize: 12 }}>审核时间：{formatTime(manga.reviewedAt)}</Text>
                  </div>
                )}
              </div>

              {/* 操作按钮 */}
              <div style={{ marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <Button size="small" icon={<EyeOutlined />} onClick={() => setDetailModal({ open: true, manga })}>
                  查看详情
                </Button>
                {manga.auditStatus === 'pending' && (
                  <>
                    <Popconfirm
                      title="确认审核通过"
                      description={`确定要通过「${manga.title}」吗？`}
                      onConfirm={() => handleApprove(manga.id, manga.title)}
                      okText="通过"
                      cancelText="取消"
                      okButtonProps={{ style: { background: '#52c41a' } }}
                    >
                      <Button size="small" type="primary" icon={<CheckOutlined />} style={{ background: '#52c41a', borderColor: '#52c41a' }}>
                        审核通过
                      </Button>
                    </Popconfirm>
                    <Button size="small" danger icon={<CloseOutlined />} onClick={() => handleOpenReject(manga)}>
                      驳回
                    </Button>
                  </>
                )}
                {manga.auditStatus !== 'pending' && (
                  <>
                    <Popconfirm
                      title="重新审核"
                      description={`确定要将「${manga.title}」改为审核通过？`}
                      onConfirm={() => handleApprove(manga.id, manga.title)}
                      okText="确定"
                      cancelText="取消"
                    >
                      <Button size="small" type="default" icon={<CheckOutlined />} style={{ borderColor: '#52c41a', color: '#52c41a' }}>
                        改为通过
                      </Button>
                    </Popconfirm>
                    <Button size="small" danger icon={<CloseOutlined />} onClick={() => handleOpenReject(manga)}>
                      改为驳回
                    </Button>
                  </>
                )}
              </div>
            </div>
          </Col>
        </Row>
      </Card>
    );
  };

  // 统计栏
  const statsRow = (
    <Row gutter={isMobile ? 8 : 16} style={{ marginBottom: isMobile ? 16 : 24 }}>
      <Col span={8}>
        <Card size="small" style={{ borderRadius: 10, background: '#fff7e6', border: '1px solid #ffd591', textAlign: 'center' }}
          onClick={() => setActiveTab('pending')}
          hoverable>
          <Statistic title="待审核" value={pendingList.length} prefix={<ClockCircleOutlined />} valueStyle={{ color: '#fa8c16' }} />
        </Card>
      </Col>
      <Col span={8}>
        <Card size="small" style={{ borderRadius: 10, background: '#f6ffed', border: '1px solid #b7eb8f', textAlign: 'center' }}
          onClick={() => setActiveTab('approved')}
          hoverable>
          <Statistic title="已通过" value={approvedList.length} prefix={<CheckCircleOutlined />} valueStyle={{ color: '#52c41a' }} />
        </Card>
      </Col>
      <Col span={8}>
        <Card size="small" style={{ borderRadius: 10, background: '#fff2f0', border: '1px solid #ffccc7', textAlign: 'center' }}
          onClick={() => setActiveTab('rejected')}
          hoverable>
          <Statistic title="已驳回" value={rejectedList.length} prefix={<MinusCircleOutlined />} valueStyle={{ color: '#ff4d4f' }} />
        </Card>
      </Col>
    </Row>
  );

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', paddingTop: isMobile ? 0 : 16 }}>
      <div style={{ marginBottom: isMobile ? 16 : 24 }}>
        <Title level={isMobile ? 4 : 3} style={{ marginBottom: 4 }}>
          <SafetyCertificateOutlined style={{ marginRight: 10, color: '#722ed1' }} />
          内容审核管理
        </Title>
        {!isMobile && <Text type="secondary">审核用户发布的 AI 漫画作品，确保内容符合平台规范</Text>}
      </div>

      {statsRow}

      <Card style={{ borderRadius: 12, boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}
        styles={{ body: { padding: isMobile ? 12 : 24 } }}>
        <Tabs
          activeKey={activeTab}
          onChange={(key) => { setActiveTab(key as AuditTab); setCurrentPage(1); }}
          size={isMobile ? 'small' : 'middle'}
          items={[
            {
              key: 'pending',
              label: (
                <span>
                  <ClockCircleOutlined />
                  {isMobile ? `待审(${pendingList.length})` : `待审核 (${pendingList.length})`}
                </span>
              ),
              children: (
                <div>
                  {pendingList.length === 0 ? (
                    <Empty description="暂无待审核作品" />
                  ) : (
                    <>
                      {pendingList.slice((currentPage - 1) * pageSize, currentPage * pageSize).map(renderMangaCard)}
                      {pendingList.length > 0 && (
                        <div style={{ textAlign: 'center', marginTop: 16 }}>
                          <Pagination
                            current={currentPage}
                            pageSize={pageSize}
                            total={pendingList.length}
                            onChange={(page, size) => { setCurrentPage(page); setPageSize(size); }}
                            showSizeChanger
                            pageSizeOptions={['5', '8', '12', '20']}
                            showTotal={(total) => `共 ${total} 项`}
                            size={isMobile ? 'small' : 'default'}
                          />
                        </div>
                      )}
                    </>
                  )}
                </div>
              ),
            },
            {
              key: 'approved',
              label: (
                <span>
                  <CheckCircleOutlined />
                  {isMobile ? `已通过(${approvedList.length})` : `已通过 (${approvedList.length})`}
                </span>
              ),
              children: (
                <div>
                  {approvedList.length === 0 ? (
                    <Empty description="暂无已通过作品" />
                  ) : (
                    <>
                      {approvedList.slice((currentPage - 1) * pageSize, currentPage * pageSize).map(renderMangaCard)}
                      {approvedList.length > 0 && (
                        <div style={{ textAlign: 'center', marginTop: 16 }}>
                          <Pagination
                            current={currentPage}
                            pageSize={pageSize}
                            total={approvedList.length}
                            onChange={(page, size) => { setCurrentPage(page); setPageSize(size); }}
                            showSizeChanger
                            pageSizeOptions={['5', '8', '12', '20']}
                            showTotal={(total) => `共 ${total} 项`}
                            size={isMobile ? 'small' : 'default'}
                          />
                        </div>
                      )}
                    </>
                  )}
                </div>
              ),
            },
            {
              key: 'rejected',
              label: (
                <span>
                  <MinusCircleOutlined />
                  {isMobile ? `已驳回(${rejectedList.length})` : `已驳回 (${rejectedList.length})`}
                </span>
              ),
              children: (
                <div>
                  {rejectedList.length === 0 ? (
                    <Empty description="暂无已驳回作品" />
                  ) : (
                    <>
                      {rejectedList.slice((currentPage - 1) * pageSize, currentPage * pageSize).map(renderMangaCard)}
                      {rejectedList.length > 0 && (
                        <div style={{ textAlign: 'center', marginTop: 16 }}>
                          <Pagination
                            current={currentPage}
                            pageSize={pageSize}
                            total={rejectedList.length}
                            onChange={(page, size) => { setCurrentPage(page); setPageSize(size); }}
                            showSizeChanger
                            pageSizeOptions={['5', '8', '12', '20']}
                            showTotal={(total) => `共 ${total} 项`}
                            size={isMobile ? 'small' : 'default'}
                          />
                        </div>
                      )}
                    </>
                  )}
                </div>
              ),
            },
            {
              key: 'users',
              label: (
                <span>
                  <TeamOutlined />
                  {isMobile ? `用户(${allUsers.length})` : `用户管理 (${allUsers.length})`}
                </span>
              ),
              children: (
                <div>
                  {allUsers.length === 0 ? (
                    <Empty description="暂无用户" />
                  ) : (
                    <>
                      {allUsers.slice((currentPage - 1) * pageSize, currentPage * pageSize).map((u) => {
                        const isSelf = u.id === currentUser?.id;
                        const isCurrentAdmin = u.role === 'admin';
                        return (
                          <Card
                            key={u.id}
                            size="small"
                            style={{ borderRadius: 10, marginBottom: 10, border: isCurrentAdmin ? '1px solid #d3adf7' : '1px solid #f0f0f0' }}
                          >
                            <Row align="middle" gutter={12} wrap={isMobile}>
                              <Col flex="auto">
                                <Space size={isMobile ? 4 : 12} wrap>
                                  <Text strong>{u.nickname}</Text>
                                  <Text type="secondary" style={{ fontSize: 12 }}>{u.email}</Text>
                                  <Tag color={isCurrentAdmin ? 'purple' : 'blue'} icon={isCurrentAdmin ? <CrownOutlined /> : <UserOutlined />}>
                                    {isCurrentAdmin ? '管理员' : '普通用户'}
                                  </Tag>
                                </Space>
                                <div style={{ marginTop: 4 }}>
                                  <Text type="secondary" style={{ fontSize: 11 }}>
                                    注册于 {new Date(u.createdAt).toLocaleDateString('zh-CN')} · 点数 {u.creditBalance}
                                  </Text>
                                </div>
                              </Col>
                              <Col>
                                {isSelf ? (
                                  <Tag color="default">当前账号</Tag>
                                ) : isCurrentAdmin ? (
                                  <Popconfirm
                                    title="降级为普通用户"
                                    description={`确定要取消「${u.nickname}」的管理员权限吗？`}
                                    onConfirm={() => {
                                      updateUserRole(u.id, 'user');
                                      message.success(`已取消「${u.nickname}」的管理员权限`);
                                    }}
                                    okText="确定降级"
                                    cancelText="取消"
                                    okButtonProps={{ danger: true }}
                                  >
                                    <Button size="small" danger>取消管理员</Button>
                                  </Popconfirm>
                                ) : (
                                  <Popconfirm
                                    title="提升为管理员"
                                    description={`确定要将「${u.nickname}」设为管理员吗？`}
                                    onConfirm={() => {
                                      updateUserRole(u.id, 'admin');
                                      message.success(`已将「${u.nickname}」设为管理员`);
                                    }}
                                    okText="确定提升"
                                    cancelText="取消"
                                    okButtonProps={{ style: { background: '#722ed1', borderColor: '#722ed1' } }}
                                  >
                                    <Button size="small" type="primary" style={{ background: '#722ed1', borderColor: '#722ed1' }}>设为管理员</Button>
                                  </Popconfirm>
                                )}
                              </Col>
                            </Row>
                          </Card>
                        );
                      })}
                      {allUsers.length > 0 && (
                        <div style={{ textAlign: 'center', marginTop: 16 }}>
                          <Pagination
                            current={currentPage}
                            pageSize={pageSize}
                            total={allUsers.length}
                            onChange={(page, size) => { setCurrentPage(page); setPageSize(size); }}
                            showSizeChanger
                            pageSizeOptions={['5', '8', '12', '20']}
                            showTotal={(total) => `共 ${total} 项`}
                            size={isMobile ? 'small' : 'default'}
                          />
                        </div>
                      )}
                    </>
                  )}
                </div>
              ),
            },
          ]}
        />
      </Card>

      {/* 驳回理由弹窗 */}
      <Modal
        title={
          <span><ExclamationCircleOutlined style={{ color: '#ff4d4f', marginRight: 8 }} />驳回作品</span>
        }
        open={rejectModal.open}
        onOk={handleConfirmReject}
        onCancel={() => setRejectModal({ open: false, manga: null })}
        okText="确认驳回"
        cancelText="取消"
        okButtonProps={{ danger: true }}
      >
        {rejectModal.manga && (
          <div>
            <p>作品：<Text strong>{rejectModal.manga.title}</Text></p>
            <p style={{ marginBottom: 12 }}>请填写驳回理由，用户将会看到此信息：</p>
            <TextArea
              placeholder="例如：包含违规内容、画面质量不达标、描述与图片不符..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={4}
              maxLength={200}
              showCount
            />
          </div>
        )}
      </Modal>

      {/* 详情弹窗 */}
      <Modal
        title={detailModal.manga?.title || '作品详情'}
        open={detailModal.open}
        onCancel={() => setDetailModal({ open: false, manga: null })}
        footer={null}
        width={isMobile ? '95%' : 700}
      >
        {detailModal.manga && (
          <div>
            <Descriptions column={isMobile ? 1 : 2} size="small" bordered style={{ marginBottom: 16 }}>
              <Descriptions.Item label="作者">{detailModal.manga.author}</Descriptions.Item>
              <Descriptions.Item label="创作模式">{detailModal.manga.mode === 'panel' ? '分镜式编辑' : '一次性生成'}</Descriptions.Item>
              <Descriptions.Item label="页数">{detailModal.manga.pages.length} 页</Descriptions.Item>
              <Descriptions.Item label="生成模型">{detailModal.manga.generationModel}</Descriptions.Item>
              <Descriptions.Item label="发布时间">{formatTime(detailModal.manga.createdAt)}</Descriptions.Item>
              <Descriptions.Item label="审核状态">
                <Tag color={detailModal.manga.auditStatus === 'approved' ? 'green' : detailModal.manga.auditStatus === 'rejected' ? 'red' : 'orange'}>
                  {{ 'pending': '待审核', 'approved': '已通过', 'rejected': '已驳回' }[detailModal.manga.auditStatus]}
                </Tag>
              </Descriptions.Item>
              {detailModal.manga.reviewedAt && (
                <Descriptions.Item label="审核时间">{formatTime(detailModal.manga.reviewedAt)}</Descriptions.Item>
              )}
              {detailModal.manga.rejectReason && (
                <Descriptions.Item label="驳回理由" span={2}>
                  <Text type="danger">{detailModal.manga.rejectReason}</Text>
                </Descriptions.Item>
              )}
            </Descriptions>
            <Paragraph type="secondary" style={{ marginBottom: 16 }}>
              {detailModal.manga.description}
            </Paragraph>
            <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 8 }}>
              {detailModal.manga.pages.slice(0, 5).map((page) => (
                <div key={page.pageNumber} style={{ flexShrink: 0, textAlign: 'center' }}>
                  <Image
                    src={page.imageUrl}
                    alt={`第${page.pageNumber}页`}
                    style={{ width: isMobile ? 120 : 160, height: isMobile ? 160 : 220, objectFit: 'cover', borderRadius: 8 }}
                    fallback="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYwIiBoZWlnaHQ9IjIyMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiNjY2MiIGZvbnQtc2l6ZT0iMTQiPuacgOmhtSDmtbc8L3RleHQ+PC9zdmc+"
                    preview={{ mask: <EyeOutlined /> }}
                  />
                  <div style={{ marginTop: 4, fontSize: 12, color: '#888' }}>第 {page.pageNumber} 页</div>
                </div>
              ))}
              {detailModal.manga.pages.length > 5 && (
                <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', width: 80, height: 160, background: '#f5f5f5', borderRadius: 8 }}>
                  <Text type="secondary">+{detailModal.manga.pages.length - 5} 页</Text>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
