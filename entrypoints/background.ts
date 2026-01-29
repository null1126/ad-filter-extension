import { MessageType } from '@/constant/enum';

/**
 * 百度URL匹配模式
 * 用于查询所有百度相关的标签页
 */
const BAIDU_URLS: string[] = ['*://*.baidu.com/*', '*://www.baidu.com/*', '*://baidu.com/*'];

/**
 * 后台脚本（Service Worker）
 * 负责：
 * 1. 管理扩展的持久化状态（过滤开关状态、广告数量）
 * 2. 协调popup和content script之间的通信
 * 3. 在状态变更时通知所有百度标签页的内容脚本
 */
export default defineBackground(() => {
  /**
   * 消息监听器
   * 处理来自popup和content script的消息
   */
  browser.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    // 处理广告数量更新消息（来自content script）
    if (message.type === MessageType.AD_COUNT_UPDATE) {
      browser.storage.local
        .set({ adCount: message.count })
        .then(() => sendResponse({ success: true }))
        .catch((err) => sendResponse({ success: false, error: err.message }));
      return true;
    }

    // 处理获取过滤器状态消息（来自popup）
    if (message.type === MessageType.GET_FILTER_STATE) {
      browser.storage.local
        .get(['isFilterEnabled', 'adCount'])
        .then((result) => {
          sendResponse({
            enabled: result.isFilterEnabled ?? true,
            adCount: result.adCount || 0,
          });
        })
        .catch(() => sendResponse({ enabled: true, adCount: 0 }));
      return true;
    }

    // 处理设置过滤器状态消息（来自popup）
    if (message.type === MessageType.SET_FILTER_STATE) {
      const enabled = message.enabled;
      // 1. 保存状态到本地存储
      browser.storage.local
        .set({ isFilterEnabled: enabled })
        .then(() => browser.tabs.query({ url: BAIDU_URLS }))
        .then((tabs) => {
          // 2. 通知所有百度标签页的内容脚本更新过滤状态
          tabs.forEach((tab) => {
            if (tab.id) {
              browser.tabs
                .sendMessage(tab.id, {
                  type: MessageType.TOGGLE_FILTER,
                  enabled,
                })
                .catch(() => {});
            }
          });
          sendResponse({ success: true });
        })
        .catch((err) => sendResponse({ success: false, error: err.message }));
      return true;
    }

    return false;
  });
});
