import { MessageType } from '@/constant/enum';
import { AD_SELECTORS, DELAY_TIMES } from '@/utils/ad-filter-constants';
import {
  checkResultElementIsAd,
  clearAllFilterStyles,
  containsAdKeyword,
  hasAdLink,
  hideElement as hideElementUtil,
  showElement as showElementUtil,
} from '@/utils/ad-filter-utils';

/**
 * 内容脚本（Content Script）
 *
 * 功能：
 * 1. 在百度搜索结果页面注入，实时检测和过滤广告
 * 2. 使用CSS预隐藏和JavaScript动态过滤双重策略，避免DOM闪烁
 * 3. 监听DOM变化，动态过滤新加载的广告
 * 4. 统计已过滤的广告数量并同步到后台脚本
 *
 * 执行时机：document_start（在页面DOM构建之前执行，确保CSS能及时注入）
 */
export default defineContentScript({
  matches: [
    '*://*.baidu.com/*',
    '*://www.baidu.com/*',
    '*://baidu.com/*',
    '*://*.baidu.com/**/*',
    '*://www.baidu.com/**/*',
  ],
  runAt: 'document_start',
  main() {
    /**
     * 更新CSS样式，根据过滤状态动态控制
     *
     * 策略：
     * - 启用时：注入CSS规则，使用!important强制隐藏已知广告选择器
     * - 禁用时：清空CSS规则，恢复所有广告显示
     *
     * 作用：
     * 1. 在页面加载早期就隐藏广告，避免闪烁
     * 2. 配合JavaScript实现更精确的控制
     *
     * @param enabled - 是否启用过滤
     */
    function updateCSSStyle(enabled: boolean) {
      let style = document.getElementById('baidu-ad-filter-style') as HTMLStyleElement;

      if (!style) {
        style = document.createElement('style');
        style.id = 'baidu-ad-filter-style';
        // 尝试注入到head，如果head不存在则注入到document
        if (document.head) {
          document.head.appendChild(style);
        } else if (document.documentElement) {
          document.documentElement.appendChild(style);
        } else {
          // 如果document都还没准备好，等待一下
          setTimeout(() => updateCSSStyle(enabled), 10);
          return;
        }
      }

      // 根据过滤状态更新CSS
      if (enabled) {
        style.textContent = `
            ${AD_SELECTORS.gp2k11k},
            [data-baidu-ad-filtered='true'],
            ${AD_SELECTORS.tenonMaterial},
            ${AD_SELECTORS.tenonId},
            ${AD_SELECTORS.tenonBrandTip} {
              display: none !important;
              height: 0 !important;
              margin: 0 !important;
              padding: 0 !important;
              overflow: hidden !important;
              visibility: hidden !important;
            }
          `;
      } else {
        style.textContent = '';
      }
    }

    /**
     * 状态管理变量
     */
    /** 过滤功能是否启用 */
    let isFilterEnabled = true;
    /** 累计过滤的广告总数 */
    let adCount = 0;
    /** 防抖定时器ID */
    let filterTimer: number | null = null;
    /** 已隐藏的元素集合（用于跟踪隐藏状态，避免重复隐藏） */
    const hiddenElements = new Set<HTMLElement>();
    /** 已统计的元素集合（用于避免重复计数） */
    const countedElements = new Set<HTMLElement>();
    /** 是否已完成初始化 */
    let isInitialized = false;

    /**
     * 包装工具函数，传入hiddenElements参数
     * 这样可以在工具函数中自动更新hiddenElements集合
     */
    const hideElement = (element: HTMLElement) => hideElementUtil(element, hiddenElements);
    const showElement = showElementUtil;

    /**
     * 立即注入CSS
     * 在document_start阶段就注入CSS，确保广告在渲染前就被隐藏
     */
    updateCSSStyle(true);
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => updateCSSStyle(true));
    }

    /**
     * 核心过滤函数
     *
     * 功能：
     * 1. 遍历页面中的所有广告元素（三种类型）
     * 2. 对每个新发现的广告进行隐藏和计数
     * 3. 更新广告总数并同步到后台脚本
     *
     * 过滤类型：
     * 1. gp2k11k类型：最常见的百度广告容器，通过prank属性获取广告数量
     * 2. 品牌广告：tenon相关的品牌广告元素
     * 3. result元素：搜索结果中的广告，使用启发式规则判断
     */
    function filterAds() {
      if (!isFilterEnabled) return;

      /** 本次新隐藏的元素数量 */
      let newFilteredCount = 0;
      /** 本次新发现的广告数量（用于判断是否需要更新统计） */
      let newAdCount = 0;

      /**
       * 过滤类型1：gp2k11k元素
       * 这是百度最常见的广告容器类型
       * 广告数量通过子元素的prank属性获取
       */
      const adElements = document.querySelectorAll(AD_SELECTORS.gp2k11k);

      adElements.forEach((element) => {
        const htmlElement = element as HTMLElement;
        /** 是否是新发现的元素（未隐藏过） */
        const isNewElement = !hiddenElements.has(htmlElement);
        /** 是否是新统计的元素（未计数过） */
        const isNewCounted = !countedElements.has(htmlElement);

        /**
         * 计算广告数量
         * 优先从prank属性获取，如果没有则默认为1
         */
        const childWithPrank = element.querySelector('[prank]');
        const prankValue = childWithPrank?.getAttribute('prank');
        const elementAdCount = prankValue ? Math.max(1, parseInt(prankValue, 10) || 1) : 1;

        if (isNewCounted) {
          adCount += elementAdCount;
          countedElements.add(htmlElement);
          newAdCount += elementAdCount;
        }

        if (isNewElement) {
          hideElement(htmlElement);
          newFilteredCount++;
        }
      });

      /**
       * 过滤类型2：品牌广告
       * 百度品牌广告通常包含特定的类名、ID或文本标识
       */
      const tenonAds = document.querySelectorAll(AD_SELECTORS.tenonAll);

      tenonAds.forEach((adElement) => {
        const htmlAdElement = adElement as HTMLElement;
        const isNewElement = !hiddenElements.has(htmlAdElement);
        const isNewCounted = !countedElements.has(htmlAdElement);

        /** 检查是否为品牌广告 */
        const adText = adElement.textContent || '';
        const isBrandAd =
          adText.includes('品牌广告') ||
          adElement.classList.contains('tenon_pc_comp_brand_tip') ||
          adElement.querySelector('.tenon_pc_comp_brand_tip') !== null;

        if (isBrandAd) {
          if (isNewCounted) {
            adCount += 1;
            countedElements.add(htmlAdElement);
            newAdCount += 1;
          }
          if (isNewElement) {
            hideElement(htmlAdElement);
            newFilteredCount++;
          }
        }
      });

      /**
       * 过滤类型3：result元素
       * 搜索结果中的广告，使用多种启发式规则判断
       * 需要传入索引位置，因为前4个结果有特殊的检测逻辑
       */
      const resultElements = document.querySelectorAll(AD_SELECTORS.result);

      resultElements.forEach((resultElement, index) => {
        const htmlResultElement = resultElement as HTMLElement;
        const isNewElement = !hiddenElements.has(htmlResultElement);
        const isNewCounted = !countedElements.has(htmlResultElement);

        /** 使用工具函数检测是否为广告 */
        const isAd = checkResultElementIsAd(resultElement, index);

        if (isAd) {
          if (isNewCounted) {
            adCount += 1;
            countedElements.add(htmlResultElement);
            newAdCount += 1;
          }
          if (isNewElement) {
            hideElement(htmlResultElement);
            newFilteredCount++;
          }
        }
      });

      /**
       * 更新统计
       * 只有当有新发现或新隐藏的元素时才更新后台脚本
       * 避免不必要的消息传递
       */
      if (newFilteredCount > 0 || newAdCount > 0) {
        browser.runtime
          .sendMessage({
            type: MessageType.AD_COUNT_UPDATE,
            count: adCount,
          })
          .catch(() => {
            // 静默失败，不影响主流程
          });
      }
    }

    /**
     * 防抖过滤函数
     * 用于限制filterAds的调用频率，避免频繁执行影响性能
     */
    function debouncedFilterAds() {
      if (filterTimer) clearTimeout(filterTimer);
      filterTimer = window.setTimeout(filterAds, DELAY_TIMES.filter);
    }

    /**
     * 消息监听器
     * 处理来自后台脚本的消息
     */
    browser.runtime.onMessage.addListener((message, _sender, sendResponse) => {
      /**
       * 处理切换过滤状态消息
       * 当用户在popup中切换开关时，后台脚本会发送此消息
       */
      if (message.type === MessageType.TOGGLE_FILTER) {
        isFilterEnabled = message.enabled;
        updateCSSStyle(isFilterEnabled);

        if (isFilterEnabled) {
          // 启用过滤：标记已隐藏元素，执行过滤，初始化（如果需要）
          hiddenElements.forEach((el) => el.setAttribute('data-baidu-ad-filtered', 'true'));
          filterAds();
          if (!isInitialized) initFilter();
        } else {
          // 禁用过滤：清空CSS，清除所有过滤样式，恢复元素显示
          updateCSSStyle(false);
          clearAllFilterStyles();
          hiddenElements.forEach(showElement);
          hiddenElements.clear();
        }
        sendResponse({ success: true });
      } else if (message.type === MessageType.GET_AD_COUNT) {
        /** 返回当前广告数量 */
        sendResponse({ count: adCount });
      }
      return true;
    });

    /**
     * 初始化过滤
     * 在页面加载后多次执行过滤，以捕获动态加载的广告内容
     * 使用多个延迟时间（500ms, 2000ms, 5000ms）确保覆盖不同加载时机
     */
    function initFilter() {
      if (isInitialized || !isFilterEnabled) return;
      isInitialized = true;
      hiddenElements.clear();
      DELAY_TIMES.init.forEach((delay) => setTimeout(filterAds, delay));
    }

    /**
     * 初始化函数
     * 根据文档状态决定何时开始过滤
     */
    const init = () => {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initFilter);
      } else {
        initFilter();
      }
    };

    /**
     * 启动流程
     * 1. 从后台脚本获取保存的过滤状态
     * 2. 根据状态更新CSS和本地变量
     * 3. 开始初始化过滤流程
     */
    browser.runtime
      .sendMessage({ type: MessageType.GET_FILTER_STATE })
      .then((response) => {
        if (response?.enabled !== undefined) {
          isFilterEnabled = response.enabled;
          updateCSSStyle(isFilterEnabled);
        }
        init();
      })
      .catch(() => {
        // 如果获取状态失败，使用默认值并继续初始化
        updateCSSStyle(isFilterEnabled);
        init();
      });

    /**
     * 监听页面导航
     * 当用户在百度搜索结果页面中导航（如翻页、搜索新关键词）时，
     * 需要重置状态并重新初始化过滤
     */
    let lastUrl = location.href;
    new MutationObserver(() => {
      const url = location.href;
      if (url !== lastUrl) {
        lastUrl = url;
        setTimeout(() => {
          hiddenElements.clear();
          countedElements.clear();
          adCount = 0;
          isInitialized = false;
          initFilter();
        }, 1000);
      }
    }).observe(document, { subtree: true, childList: true });

    /**
     * 立即隐藏元素（用于MutationObserver）
     * 当检测到新广告时立即隐藏，避免闪烁
     *
     * @param element - 要隐藏的元素
     */
    function hideElementImmediately(element: HTMLElement) {
      if (!isFilterEnabled) return;
      hideElement(element);
    }

    /**
     * 检查新节点是否包含广告
     *
     * 用于MutationObserver回调，快速检测新插入的DOM节点
     * 如果发现广告，立即隐藏并返回true
     *
     * @param node - 要检查的DOM节点
     * @returns 如果发现广告则返回true
     */
    function checkNewNodeForAds(node: Node): boolean {
      if (node.nodeType !== Node.ELEMENT_NODE) return false;

      const element = node as Element;
      /** 是否发现广告 */
      let hasAd = false;

      /**
       * 检查gp2k11k类型的广告
       */
      if (element.matches(AD_SELECTORS.gp2k11k)) {
        hideElementImmediately(element as HTMLElement);
        return true;
      }
      element.querySelectorAll(AD_SELECTORS.gp2k11k).forEach((el) => {
        if (!hiddenElements.has(el as HTMLElement)) {
          hideElementImmediately(el as HTMLElement);
          hasAd = true;
        }
      });

      /**
       * 检查品牌广告
       */
      if (element.matches(AD_SELECTORS.tenonAll) || element.id === 'tenon-13142') {
        const text = element.textContent || '';
        if (text.includes('品牌广告') || element.classList.contains('tenon_pc_comp_brand_tip')) {
          hideElementImmediately(element as HTMLElement);
          return true;
        }
      }
      element.querySelectorAll(AD_SELECTORS.tenonAll).forEach((el) => {
        if (!hiddenElements.has(el as HTMLElement)) {
          const text = el.textContent || '';
          if (text.includes('品牌广告') || el.classList.contains('tenon_pc_comp_brand_tip')) {
            hideElementImmediately(el as HTMLElement);
            hasAd = true;
          }
        }
      });

      /**
       * 检查result元素中的广告
       * 通过检查是否包含广告链接来判断
       */
      if (element.matches(AD_SELECTORS.result)) {
        if (hasAdLink(element)) {
          hideElementImmediately(element as HTMLElement);
          return true;
        }
      }
      element.querySelectorAll(AD_SELECTORS.result).forEach((resultEl) => {
        if (!hiddenElements.has(resultEl as HTMLElement) && hasAdLink(resultEl)) {
          hideElementImmediately(resultEl as HTMLElement);
          hasAd = true;
        }
      });

      return hasAd;
    }

    /**
     * MutationObserver：监听DOM变化，动态过滤新加载的广告
     *
     * 监听内容：
     * 1. 新增节点（childList）
     * 2. 文本内容变化（characterData）
     * 3. 属性变化（attributes，特别是class和id）
     *
     * 策略：
     * - 如果检测到明确的广告变化，立即执行过滤（短延迟）
     * - 如果只是结构变化，使用防抖过滤（避免频繁执行）
     */
    const observer = new MutationObserver((mutations) => {
      // 如果过滤已禁用，不处理任何变化
      if (!isFilterEnabled) {
        return;
      }

      /** 是否需要执行过滤 */
      let shouldFilter = false;
      /** 是否有明确的广告变化 */
      let hasAdChanges = false;

      mutations.forEach((mutation) => {
        /**
         * 监听新增的节点
         * 当百度动态插入广告时，会触发此事件
         */
        if (mutation.addedNodes.length > 0) {
          mutation.addedNodes.forEach((node) => {
            if (checkNewNodeForAds(node)) {
              shouldFilter = true;
              hasAdChanges = true;
            }
            // 如果添加了result元素，也触发检查（可能是搜索结果更新）
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as Element;
              if (
                element.matches(AD_SELECTORS.result) ||
                element.querySelector(AD_SELECTORS.result)
              ) {
                shouldFilter = true;
              }
            }
          });
        }

        /**
         * 监听文本内容变化
         * 当广告文本动态更新时，检查是否包含广告关键词
         */
        if (mutation.type === 'characterData') {
          const parent = mutation.target.parentElement;
          if (parent?.matches(AD_SELECTORS.result) && !hiddenElements.has(parent as HTMLElement)) {
            const text = mutation.target.textContent?.trim() || '';
            if (containsAdKeyword(text)) {
              hideElementImmediately(parent as HTMLElement);
              shouldFilter = true;
              hasAdChanges = true;
            }
          }
        }

        /**
         * 监听class变化
         * 当元素的class动态变化时，检查是否变成了广告
         */
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          const element = mutation.target as Element;
          if (element.matches(AD_SELECTORS.result) && !hiddenElements.has(element as HTMLElement)) {
            if (hasAdLink(element)) {
              hideElementImmediately(element as HTMLElement);
              shouldFilter = true;
              hasAdChanges = true;
            } else {
              // 即使不是广告，class变化也可能影响布局，触发检查
              shouldFilter = true;
            }
          }
        }
      });

      /**
       * 根据变化类型决定过滤策略
       * - 有明确广告变化：短延迟立即过滤
       * - 只有结构变化：防抖过滤
       */
      if (shouldFilter) {
        if (hasAdChanges) {
          setTimeout(filterAds, DELAY_TIMES.debounce);
        } else {
          debouncedFilterAds();
        }
      }
    });

    /**
     * MutationObserver配置选项
     */
    const observeOptions = {
      childList: true, // 监听子节点的添加和删除
      subtree: true, // 监听所有后代节点
      characterData: true, // 监听文本内容变化
      attributes: true, // 监听属性变化
      attributeFilter: ['class', 'id'], // 只监听class和id属性的变化（性能优化）
    };

    /**
     * 启动Observer
     * 等待document.body准备好后再开始观察
     */
    const startObserver = () => {
      if (document.body) {
        observer.observe(document.body, observeOptions);
      } else {
        // 如果body还没准备好，1秒后重试
        setTimeout(startObserver, 1000);
      }
    };
    startObserver();

    /**
     * 定期检查
     *
     * 作为MutationObserver的补充机制，定期扫描页面中是否有遗漏的广告
     * 主要用于捕获MutationObserver可能遗漏的情况（如通过iframe加载的广告）
     *
     * 检查范围：
     * 1. 未标记的gp2k11k元素
     * 2. 未标记的品牌广告
     * 3. 未标记的result元素（包含广告链接的）
     */
    const periodicCheckInterval = setInterval(() => {
      if (!isFilterEnabled) return;

      const newGp2k11k = document.querySelectorAll(
        `${AD_SELECTORS.gp2k11k}:not([data-baidu-ad-filtered])`
      );
      const newTenonAds = Array.from(
        document.querySelectorAll(`${AD_SELECTORS.tenonAll}:not([data-baidu-ad-filtered])`)
      );
      const newResults = Array.from(
        document.querySelectorAll(`${AD_SELECTORS.result}:not([data-baidu-ad-filtered])`)
      );

      const hasNewAds =
        newGp2k11k.length > 0 ||
        newTenonAds.some(
          (el) =>
            el.textContent?.includes('品牌广告') || el.classList.contains('tenon_pc_comp_brand_tip')
        ) ||
        newResults.some(hasAdLink);

      if (hasNewAds) {
        filterAds();
      }
    }, DELAY_TIMES.periodic);

    /**
     * 页面卸载时清理资源
     * 断开Observer连接，清除定时器，避免内存泄漏
     */
    window.addEventListener('beforeunload', () => {
      observer.disconnect();
      clearInterval(periodicCheckInterval);
    });
  },
});
