import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Typography, Button, Space, Tag, List, message, Divider, Grid, Statistic, Row, Col } from 'antd';
import { TrophyOutlined, FireOutlined, ThunderboltOutlined, ArrowLeftOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { getCurrentChallenge, getAllChallenges, voteSubmission } from '../mock/challenges';
import type { WeeklyChallenge } from '../types';

const { Title, Text, Paragraph } = Typography;
const { useBreakpoint } = Grid;

export default function ChallengePage() {
  const navigate = useNavigate();
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  const [currentChallenge, setCurrentChallenge] = useState<WeeklyChallenge | null>(null);
  const [allChallenges, setAllChallenges] = useState<WeeklyChallenge[]>([]);

  useEffect(() => {
    setCurrentChallenge(getCurrentChallenge());
    setAllChallenges(getAllChallenges());
  }, []);

  const handleVote = (challengeId: string, mangaId: string) => {
    const ok = voteSubmission(challengeId, mangaId);
    if (ok) {
      message.success('投票成功！');
      setAllChallenges(getAllChallenges());
      setCurrentChallenge(getCurrentChallenge());
    }
  };

  const handleParticipate = () => {
    message.info('创作功能即将开放，敬请期待！');
    // navigate('/create'); // 未来可以跳转到创作页并带上挑战主题
  };

  return (
    <div>
      <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} type="text" style={{ marginBottom: 16 }}>
        返回
      </Button>

      <Title level={isMobile ? 4 : 2} style={{ marginBottom: 24 }}>
        <FireOutlined style={{ marginRight: 8, color: '#ff4d4f' }} />
        每周创作挑战
      </Title>

      {/* 当前挑战 */}
      {currentChallenge && (
        <Card
          style={{
            borderRadius: 16,
            marginBottom: 24,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: '#fff',
          }}
        >
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} md={16}>
              <div style={{ fontSize: 64, marginBottom: 16 }}>{currentChallenge.emoji}</div>
              <Tag color="gold" style={{ fontSize: 14, marginBottom: 8 }}>
                🔥 进行中
              </Tag>
              <Title level={3} style={{ color: '#fff', margin: '8px 0' }}>
                {currentChallenge.theme}
              </Title>
              <Paragraph style={{ color: 'rgba(255,255,255,0.9)', fontSize: 16 }}>
                {currentChallenge.description}
              </Paragraph>
              <Space size="large">
                <Statistic
                  title="参与作品"
                  value={currentChallenge.submissions.length}
                  suffix="部"
                  valueStyle={{ color: '#fff', fontSize: isMobile ? 20 : 24 }}
                />
                <Statistic
                  title="结束时间"
                  value={new Date(currentChallenge.endDate).toLocaleDateString('zh-CN')}
                  prefix={<ClockCircleOutlined />}
                  valueStyle={{ color: '#fff', fontSize: isMobile ? 14 : 16 }}
                />
              </Space>
            </Col>
            <Col xs={24} md={8} style={{ textAlign: 'center' }}>
              <Button
                type="primary"
                icon={<ThunderboltOutlined />}
                onClick={handleParticipate}
                size="large"
                block
                style={{
                  height: 64,
                  fontSize: 20,
                  borderRadius: 12,
                  background: '#fff',
                  color: '#764ba2',
                  border: 'none',
                  marginBottom: 12,
                }}
              >
                🎨 立即参与
              </Button>
              <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12 }}>
                使用模板创作功能，快速完成挑战作品
              </Text>
            </Col>
          </Row>
        </Card>
      )}

      {/* 参赛作品排行 */}
      {currentChallenge && currentChallenge.submissions.length > 0 && (
        <Card title={<Space><TrophyOutlined /> 作品排行</Space>} style={{ borderRadius: 12, marginBottom: 24 }}>
          <List
            dataSource={[...currentChallenge.submissions].sort((a, b) => b.votes - a.votes)}
            renderItem={(submission, index) => (
              <List.Item
                style={{
                  padding: 16,
                  background: index === 0 ? '#fff7e6' : index === 1 ? '#f0f5ff' : undefined,
                  borderRadius: 8,
                  marginBottom: 8,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                  <Space>
                    <Tag
                      color={index === 0 ? 'gold' : index === 1 ? 'silver' : 'default'}
                      style={{ fontSize: 16, padding: '4px 12px' }}
                    >
                      #{index + 1}
                    </Tag>
                    <div>
                      <Text strong style={{ fontSize: 16 }}>{submission.mangaTitle}</Text>
                      <br />
                      <Text type="secondary">作者：{submission.author}</Text>
                    </div>
                  </Space>
                  <Space>
                    <Statistic
                      value={submission.votes}
                      suffix="票"
                      valueStyle={{ fontSize: 18, color: '#ff4d4f' }}
                    />
                    <Button
                      type="primary"
                      size="small"
                      onClick={() => handleVote(currentChallenge.id, submission.mangaId)}
                    >
                      👍 投票
                    </Button>
                  </Space>
                </div>
              </List.Item>
            )}
          />
        </Card>
      )}

      {/* 历史挑战 */}
      <Card title={<Space><ClockCircleOutlined /> 历史挑战</Space>} style={{ borderRadius: 12 }}>
        <List
          grid={{ gutter: 16, xs: 1, sm: 2, md: 3 }}
          dataSource={allChallenges.filter((c) => c.id !== currentChallenge?.id)}
          renderItem={(challenge) => (
            <List.Item>
              <Card
                hoverable
                style={{ borderRadius: 12, textAlign: 'center' }}
              >
                <div style={{ fontSize: 48, marginBottom: 8 }}>{challenge.emoji}</div>
                <Title level={5} style={{ margin: '0 0 8px 0' }}>{challenge.theme}</Title>
                <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 8 }}>
                  {challenge.week}
                </Text>
                <Tag>{challenge.submissions.length} 部作品</Tag>
              </Card>
            </List.Item>
          )}
        />
      </Card>
    </div>
  );
}
