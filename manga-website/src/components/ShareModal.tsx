import { useState } from 'react';
import { Modal, Button, Input, Space, Typography, message, Tooltip, Divider, Grid } from 'antd';
import {
  LinkOutlined, WechatOutlined, WeiboOutlined, QqOutlined,
  TwitterOutlined, CopyOutlined, ShareAltOutlined, CheckOutlined,
} from '@ant-design/icons';

const { Text } = Typography;
const { useBreakpoint } = Grid;

const supportsWebShare = typeof navigator !== 'undefined' && typeof navigator.share === 'function';

interface ShareModalProps {
  open: boolean;
  onClose: () => void;
  shareUrl: string;
  title: string;
  description?: string;
}

export default function ShareModal({ open, onClose, shareUrl, title, description }: ShareModalProps) {
  const screens = useBreakpoint();
  const isMobile = !screens.md;
  const [copied, setCopied] = useState(false);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      message.success('链接已复制到剪贴板');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      message.error('复制失败，请手动复制');
    }
  };

  const handleWebShare = async () => {
    if (supportsWebShare) {
      try {
        await navigator.share({ title, text: description || title, url: shareUrl });
        return;
      } catch { /* 用户取消 */ }
    }
    handleCopyLink();
  };

  const shareToSocial = (platform: string) => {
    const encodedUrl = encodeURIComponent(shareUrl);
    const encodedTitle = encodeURIComponent(title);
    const encodedDesc = encodeURIComponent(description || title);
    let url = '';

    switch (platform) {
      case 'weibo':
        url = `https://service.weibo.com/share/share.php?url=${encodedUrl}&title=${encodedTitle}${description ? `&pic=&searchPic=false` : ''}`;
        break;
      case 'qq':
        url = `https://connect.qq.com/widget/shareqq/index.html?url=${encodedUrl}&title=${encodedTitle}&desc=${encodedDesc}`;
        break;
      case 'twitter':
        url = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`;
        break;
      default:
        break;
    }
    if (url) window.open(url, '_blank', 'noopener,noreferrer');
  };

  const shareButtons = [
    { key: 'wechat', icon: <WechatOutlined />, label: '微信', color: '#07c160', onClick: () => { message.info('请复制链接后在微信中粘贴发送'); handleCopyLink(); } },
    { key: 'weibo', icon: <WeiboOutlined />, label: '微博', color: '#e6162d', onClick: () => shareToSocial('weibo') },
    { key: 'qq', icon: <QqOutlined />, label: 'QQ', color: '#12b7f5', onClick: () => shareToSocial('qq') },
    { key: 'twitter', icon: <TwitterOutlined />, label: 'Twitter', color: '#1da1f2', onClick: () => shareToSocial('twitter') },
  ];

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      title={
        <Space>
          <ShareAltOutlined />
          <span>分享作品</span>
        </Space>
      }
      width={isMobile ? '100%' : 420}
      style={isMobile ? { top: 'auto', bottom: 0, maxWidth: '100%', margin: 0 } : undefined}
      styles={isMobile ? { body: { padding: '16px' } } : undefined}
    >
      <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
        "{title}"
      </Text>

      {/* 分享链接 */}
      <div style={{ marginBottom: 20 }}>
        <Text strong style={{ display: 'block', marginBottom: 8, fontSize: 13 }}>分享链接</Text>
        <Space.Compact style={{ width: '100%' }}>
          <Input value={shareUrl} readOnly style={{ fontSize: 12 }} />
          <Button
            type="primary"
            icon={copied ? <CheckOutlined /> : <CopyOutlined />}
            onClick={handleCopyLink}
          >
            {copied ? '已复制' : '复制'}
          </Button>
        </Space.Compact>
      </div>

      <Divider plain style={{ fontSize: 12, color: '#999' }}>分享到</Divider>

      {/* 社交平台 */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: isMobile ? 24 : 32, marginBottom: 16 }}>
        {shareButtons.map((btn) => (
          <Tooltip title={btn.label} key={btn.key}>
            <Button
              shape="circle"
              size="large"
              icon={btn.icon}
              onClick={btn.onClick}
              style={{ color: btn.color, borderColor: btn.color, fontSize: 20 }}
            />
          </Tooltip>
        ))}
      </div>

      {/* 移动端一键分享 */}
      {isMobile && supportsWebShare && (
        <Button block type="primary" onClick={handleWebShare} icon={<ShareAltOutlined />}>
          一键分享
        </Button>
      )}
    </Modal>
  );
}
