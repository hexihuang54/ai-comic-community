import { useState, useEffect, useRef } from 'react';
import { Button, Input, Space, Typography, message } from 'antd';
import { SendOutlined, EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons';
import * as danmakuMock from '../mock/danmaku';
import type { Danmaku } from '../types';

const { Text } = Typography;

interface DanmakuOverlayProps {
  mangaId: string;
  currentPage: number;
  username: string;
}

interface FlyingDanmaku extends Danmaku {
  x: number;
  y: number;
  speed: number;
}

export default function DanmakuOverlay({ mangaId, currentPage, username }: DanmakuOverlayProps) {
  const [visible, setVisible] = useState(true);
  const [input, setInput] = useState('');
  const [flyingList, setFlyingList] = useState<FlyingDanmaku[]>([]);
  const [danmakuList, setDanmakuList] = useState<Danmaku[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>();

  // 加载弹幕
  useEffect(() => {
    setDanmakuList(danmakuMock.getPageDanmaku(mangaId, currentPage));
  }, [mangaId, currentPage]);

  // 发送弹幕
  const handleSend = () => {
    if (!input.trim()) return;
    if (!username) {
      message.warning('请先登录');
      return;
    }
    const newDanmaku = danmakuMock.addDanmaku(mangaId, currentPage, username, input.trim());
    setDanmakuList((prev) => [...prev, newDanmaku]);
    // 添加到飞行列表
    setFlyingList((prev) => [
      ...prev,
      {
        ...newDanmaku,
        x: containerRef.current?.clientWidth || 800,
        y: Math.random() * 60 + 10, // 10%-70% 高度随机
        speed: Math.random() * 2 + 2, // 2-4 px/frame
      },
    ]);
    setInput('');
  };

  // 动画循环
  useEffect(() => {
    if (!visible) return;

    const animate = () => {
      setFlyingList((prev) =>
        prev
          .map((d) => ({ ...d, x: d.x - d.speed }))
          .filter((d) => d.x > -300) // 超出屏幕移除
      );
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [visible]);

  // 初始化时将历史弹幕加入飞行
  useEffect(() => {
    if (!visible || danmakuList.length === 0) return;
    const initial = danmakuList.map((d, i) => ({
      ...d,
      x: (containerRef.current?.clientWidth || 800) + i * 150,
      y: Math.random() * 60 + 10,
      speed: Math.random() * 2 + 2,
    }));
    setFlyingList((prev) => [...prev, ...initial]);
  }, [danmakuList, visible]);

  return (
    <div style={{ position: 'relative' }}>
      {/* 弹幕显示层 */}
      {visible && (
        <div
          ref={containerRef}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 60,
            overflow: 'hidden',
            pointerEvents: 'none',
            zIndex: 10,
          }}
        >
          {flyingList.map((d) => (
            <div
              key={d.id}
              style={{
                position: 'absolute',
                left: d.x,
                top: `${d.y}%`,
                color: d.color,
                fontSize: 16,
                fontWeight: 'bold',
                textShadow: '1px 1px 2px rgba(0,0,0,0.8), -1px -1px 2px rgba(0,0,0,0.8)',
                whiteSpace: 'nowrap',
                transform: 'translateY(-50%)',
              }}
            >
              {d.content}
            </div>
          ))}
        </div>
      )}

      {/* 弹幕控制栏 */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          background: 'rgba(0,0,0,0.7)',
          padding: '8px 12px',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          zIndex: 20,
        }}
      >
        <Input
          placeholder="发条弹幕吧..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onPressEnter={handleSend}
          maxLength={50}
          size="small"
          style={{ flex: 1, background: 'rgba(255,255,255,0.9)' }}
        />
        <Button
          type="primary"
          icon={<SendOutlined />}
          onClick={handleSend}
          size="small"
        >
          发送
        </Button>
        <Button
          icon={visible ? <EyeOutlined /> : <EyeInvisibleOutlined />}
          onClick={() => setVisible(!visible)}
          size="small"
          style={{ color: '#fff', borderColor: '#fff' }}
        />
      </div>
    </div>
  );
}
