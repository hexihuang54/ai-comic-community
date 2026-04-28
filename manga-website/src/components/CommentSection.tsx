import { useState } from 'react';
import { Input, Button, List, Typography, Space, Popconfirm, message, Empty } from 'antd';
import { SendOutlined, DeleteOutlined, CommentOutlined } from '@ant-design/icons';
import { useInteractionStore } from '../stores/interactionStore';
import type { Comment } from '../types';

const { Text } = Typography;
const { TextArea } = Input;

interface CommentSectionProps {
  mangaId: string;
  currentUser?: string;  // 当前用户名，公开页可为空字符串
}

export default function CommentSection({ mangaId, currentUser }: CommentSectionProps) {
  const { getComments, addComment, deleteComment } = useInteractionStore();
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const comments = getComments(mangaId);

  const handleSubmit = () => {
    const trimmed = content.trim();
    if (!trimmed) { message.warning('请输入评论内容'); return; }
    setSubmitting(true);
    try {
      addComment(mangaId, currentUser || '匿名用户', trimmed);
      setContent('');
      message.success('评论成功');
    } catch { message.error('评论失败'); }
    finally { setSubmitting(false); }
  };

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    if (diff < 60000) return '刚刚';
    if (diff < 3600000) return `${Math.floor(diff / 60000)} 分钟前`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} 小时前`;
    return d.toLocaleDateString('zh-CN');
  };

  return (
    <div>
      {/* 评论输入 */}
      <div style={{ marginBottom: 16 }}>
        <TextArea
          placeholder={currentUser ? '写下你的评论...' : '输入昵称和评论...'}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={3}
          maxLength={500}
          showCount
          style={{ borderRadius: 8 }}
        />
        <div style={{ textAlign: 'right', marginTop: 8 }}>
          <Button
            type="primary"
            icon={<SendOutlined />}
            onClick={handleSubmit}
            loading={submitting}
            disabled={!content.trim()}
          >
            发表评论
          </Button>
        </div>
      </div>

      {/* 评论列表 */}
      {comments.length === 0 ? (
        <Empty description="暂无评论，来发表第一条吧" image={Empty.PRESENTED_IMAGE_SIMPLE} />
      ) : (
        <List
          dataSource={[...comments].reverse()}
          renderItem={(comment) => (
            <List.Item
              key={comment.id}
              style={{ padding: '12px 0' }}
              actions={
                currentUser && comment.username === currentUser
                  ? [
                      <Popconfirm
                        key="del"
                        title="确定删除这条评论？"
                        onConfirm={() => deleteComment(mangaId, comment.id)}
                        okText="确定"
                        cancelText="取消"
                      >
                        <Button type="link" danger size="small" icon={<DeleteOutlined />} />
                      </Popconfirm>,
                    ]
                  : undefined
              }
            >
              <List.Item.Meta
                title={
                  <Space size={8}>
                    <Text strong style={{ fontSize: 14 }}>{comment.username}</Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>{formatTime(comment.createdAt)}</Text>
                  </Space>
                }
                description={
                  <Text style={{ fontSize: 14, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                    {comment.content}
                  </Text>
                }
              />
            </List.Item>
          )}
        />
      )}
    </div>
  );
}
