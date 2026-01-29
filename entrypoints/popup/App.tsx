import '@/assets/styles/App.scss';

import { useCallback, useEffect, useState } from 'react';

import { MessageType } from '@/constant/enum';

/**
 * Popup 组件
 * 扩展的弹窗界面，提供：
 * 1. 广告过滤开关控制
 * 2. 已过滤广告数量显示
 */
function App() {
  /** 过滤器是否启用 */
  const [isFilterEnabled, setIsFilterEnabled] = useState(true);
  /** 已过滤的广告数量 */
  const [adCount, setAdCount] = useState(0);

  /**
   * 从后台脚本加载当前过滤状态和广告数量
   */
  const loadState = useCallback(async () => {
    try {
      const response = await browser.runtime.sendMessage({
        type: MessageType.GET_FILTER_STATE,
      });
      if (response) {
        setIsFilterEnabled(response.enabled ?? true);
        setAdCount(response.adCount || 0);
      }
    } catch (err) {
      console.error('[Popup] 获取状态失败:', err);
    }
  }, []);

  /**
   * 组件挂载时：
   * 1. 立即加载一次状态
   * 2. 设置定时器，每2秒更新一次广告数量（用于实时显示）
   */
  useEffect(() => {
    loadState();
    const interval = setInterval(() => {
      browser.runtime
        .sendMessage({ type: MessageType.GET_FILTER_STATE })
        .then((response) => response && setAdCount(response.adCount || 0))
        .catch(() => {});
    }, 2000);
    return () => clearInterval(interval);
  }, [loadState]);

  /**
   * 切换过滤开关的处理函数
   * 采用乐观更新策略：先更新UI，再发送消息
   * 如果失败则回滚状态
   */
  const handleToggle = useCallback(async () => {
    const newState = !isFilterEnabled;
    setIsFilterEnabled(newState);

    try {
      const response = await browser.runtime.sendMessage({
        type: MessageType.SET_FILTER_STATE,
        enabled: newState,
      });

      // 如果设置失败，回滚状态
      if (!response?.success) {
        setIsFilterEnabled(!newState);
      }
    } catch (err) {
      console.error('[Popup] 设置状态失败:', err);
      setIsFilterEnabled(!newState);
    }
  }, [isFilterEnabled]);

  return (
    <div className="popup-container">
      <h1>百度广告过滤器</h1>
      <div className="filter-control">
        <label className="switch" aria-label="广告过滤开关">
          <input
            type="checkbox"
            checked={isFilterEnabled}
            onChange={handleToggle}
            aria-label="广告过滤开关"
          />
          <span className="slider"></span>
        </label>
        <span className="filter-label">{isFilterEnabled ? '已启用' : '已禁用'}</span>
      </div>
      <div className="ad-stats">
        <p className="ad-count">已过滤广告数量: {adCount}</p>
      </div>
    </div>
  );
}

export default App;
