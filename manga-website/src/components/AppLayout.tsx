import { useState } from 'react';
import { Outlet, useNavigate, Link } from 'react-router-dom';
import { Layout, Input, Button, Space, Dropdown, Typography, theme, Tooltip, message, Grid } from 'antd';
import {
  SearchOutlined,
  UserOutlined,
  ThunderboltOutlined,
  LoginOutlined,
  LogoutOutlined,
  ProfileOutlined,
  CoffeeOutlined,
  GiftOutlined,
  MenuOutlined,
  SafetyCertificateOutlined,
  FireOutlined,
} from '@ant-design/icons';
import { useAuthStore } from '../stores/authStore';
import { useMangaStore } from '../stores/mangaStore';

const { Header, Content, Footer } = Layout;
const { Text } = Typography;
const { useBreakpoint } = Grid;

export default function AppLayout() {
  const navigate = useNavigate();
  const { user, isLoggedIn, isAdmin, logout, getCreditBalance, getFreeRemaining, dailyCheckIn } = useAuthStore();
  const { searchKeyword, setSearchKeyword } = useMangaStore();
  const { token } = theme.useToken();
  const screens = useBreakpoint();
  const isMobile = !screens.md; // < 768px 视为移动端
  const [searchValue, setSearchValue] = useState(searchKeyword);
  const [searchExpanded, setSearchExpanded] = useState(false);

  const handleSearch = () => {
    setSearchKeyword(searchValue);
    navigate('/');
    setSearchExpanded(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleDailyCheckIn = () => {
    const result = dailyCheckIn();
    if (result.success) {
      message.success(result.message);
    } else {
      message.info(result.message);
    }
  };

  const userMenuItems = [
    {
      key: 'profile',
      icon: <ProfileOutlined />,
      label: '个人中心',
      onClick: () => navigate('/profile'),
    },
    {
      key: 'create',
      icon: <ThunderboltOutlined />,
      label: 'AI 创作',
      onClick: () => navigate('/create'),
    },
    {
      key: 'checkin',
      icon: <GiftOutlined />,
      label: '每日签到 (+2点数)',
      onClick: handleDailyCheckIn,
    },
    ...(isAdmin ? [
      { type: 'divider' as const },
      {
        key: 'audit',
        icon: <SafetyCertificateOutlined />,
        label: '📋 审核管理',
        onClick: () => navigate('/admin/audit'),
      },
    ] : []),
    { type: 'divider' as const },
    {
      key: 'challenge',
      icon: <FireOutlined />,
      label: '🔥 每周挑战',
      onClick: () => navigate('/challenge'),
    },
    { type: 'divider' as const },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: handleLogout,
    },
  ];

  const creditDisplay = isLoggedIn && (
    <Tooltip
      title={
        <div>
          <div>🆓 免费次数：每日 3 次</div>
          <div>🔋 可用点数：{getCreditBalance()} 点</div>
          <div style={{ marginTop: 4, fontSize: 12, opacity: 0.7 }}>签到可获得 +2 点数/天</div>
        </div>
      }
    >
      <Button size="small" type="text" icon={<CoffeeOutlined />} style={{ color: '#52c41a', fontWeight: 500 }}>
        {isMobile ? `${getFreeRemaining()}/${getCreditBalance()}` : `🆓 ${getFreeRemaining()} | 🔋 ${getCreditBalance()}`}
      </Button>
    </Tooltip>
  );

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: token.colorBgContainer,
          borderBottom: `1px solid ${token.colorBorderSecondary}`,
          padding: isMobile ? '0 12px' : '0 32px',
          position: 'sticky',
          top: 0,
          zIndex: 100,
          height: isMobile ? 56 : 64,
          gap: isMobile ? 8 : 0,
        }}
      >
        {/* Logo */}
        <Link
          to="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            textDecoration: 'none',
            flexShrink: 0,
          }}
        >
          <span style={{ fontSize: isMobile ? 22 : 28 }}>🤖</span>
          {!isMobile && (
            <Text strong style={{ fontSize: 20, color: token.colorPrimary }}>
              AI 漫画平台
            </Text>
          )}
        </Link>

        {/* 搜索框 — 移动端：可折叠 */}
        {isMobile ? (
          searchExpanded ? (
            <Space.Compact style={{ flex: 1, maxWidth: '100%' }}>
              <Input
                placeholder="搜索..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onPressEnter={handleSearch}
                prefix={<SearchOutlined />}
                allowClear
                autoFocus
                onBlur={() => { if (!searchValue) setSearchExpanded(false); }}
                onClear={() => { setSearchValue(''); setSearchKeyword(''); }}
              />
              <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch} />
            </Space.Compact>
          ) : (
            <Button
              type="text"
              icon={<SearchOutlined />}
              onClick={() => setSearchExpanded(true)}
              style={{ flex: 1, justifyContent: 'flex-start' }}
            >
              {searchKeyword || '搜索漫画...'}
            </Button>
          )
        ) : (
          <Space.Compact style={{ width: 360 }}>
            <Input
              placeholder="搜索漫画标题或作者..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onPressEnter={handleSearch}
              prefix={<SearchOutlined />}
              allowClear
              onClear={() => {
                setSearchValue('');
                setSearchKeyword('');
              }}
            />
            <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
              搜索
            </Button>
          </Space.Compact>
        )}

        {/* 用户操作 */}
        <Space size={isMobile ? 4 : 8}>
          {isLoggedIn ? (
            <>
              {creditDisplay}
              {!isMobile && (
                <Button
                  type="primary"
                  icon={<ThunderboltOutlined />}
                  onClick={() => navigate('/create')}
                >
                  AI 创作
                </Button>
              )}
              {isMobile && (
                <Button
                  type="primary"
                  icon={<ThunderboltOutlined />}
                  onClick={() => navigate('/create')}
                  size="small"
                />
              )}
              <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
                <Button icon={<UserOutlined />} style={{ cursor: 'pointer' }} size={isMobile ? 'small' : 'middle'}>
                  {!isMobile && user?.nickname}
                </Button>
              </Dropdown>
            </>
          ) : (
            <>
              {isMobile ? (
                <>
                  <Button icon={<LoginOutlined />} size="small" onClick={() => navigate('/login')} />
                  <Button type="primary" size="small" onClick={() => navigate('/register')}>注册</Button>
                </>
              ) : (
                <>
                  <Button icon={<LoginOutlined />} onClick={() => navigate('/login')}>
                    登录
                  </Button>
                  <Button type="primary" onClick={() => navigate('/register')}>
                    注册
                  </Button>
                </>
              )}
            </>
          )}
        </Space>
      </Header>

      <Content style={{ padding: isMobile ? '16px 12px' : '24px 32px', maxWidth: 1400, margin: '0 auto', width: '100%' }}>
        <Outlet />
      </Content>

      <Footer
        style={{
          textAlign: 'center',
          background: token.colorBgContainer,
          borderTop: `1px solid ${token.colorBorderSecondary}`,
          color: token.colorTextSecondary,
          padding: isMobile ? '12px 16px' : '24px 50px',
          fontSize: isMobile ? 12 : 14,
        }}
      >
        AI 漫画创作平台 © {new Date().getFullYear()} - 由 AI 生成 · 使用前请阅读内容规范
      </Footer>
    </Layout>
  );
}
