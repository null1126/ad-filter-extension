import { AD_KEYWORDS } from './ad-filter-constants';

/**
 * 检查文本是否包含广告关键词
 *
 * @param text - 要检查的文本内容
 * @returns 如果文本包含任何广告关键词则返回true
 */
export function containsAdKeyword(text: string): boolean {
  return AD_KEYWORDS.some((keyword) => text.includes(keyword));
}

/**
 * 检查元素是否包含广告链接
 * 遍历元素内的所有<a>标签，检查其文本内容是否包含广告关键词
 *
 * @param element - 要检查的DOM元素
 * @returns 如果找到包含广告关键词的链接则返回true
 */
export function hasAdLink(element: Element): boolean {
  const links = element.querySelectorAll('a');
  for (const link of links) {
    const linkText = link.textContent?.trim() || '';
    if (containsAdKeyword(linkText)) {
      return true;
    }
  }
  return false;
}

/**
 * 检查result元素是否为广告
 *
 * 使用多种策略综合判断：
 * 1. 检查是否包含广告链接
 * 2. 检查文本内容是否包含广告关键词
 * 3. 检查类名是否包含广告相关标识
 * 4. 对于前4个结果，使用启发式规则（缺少正常搜索结果特征则可能是广告）
 *
 * @param element - 要检查的result元素
 * @param index - 元素在搜索结果中的索引位置（从0开始）
 * @returns 如果判断为广告则返回true
 */
export function checkResultElementIsAd(element: Element, index: number): boolean {
  // 方法1: 检查是否包含广告链接
  if (hasAdLink(element)) {
    return true;
  }

  // 方法2: 检查文本中是否有广告关键词
  const resultText = element.textContent || '';
  if (containsAdKeyword(resultText)) {
    const adMarkers = element.querySelectorAll('span, div, label');
    for (const marker of adMarkers) {
      const markerText = marker.textContent?.trim() || '';
      if (containsAdKeyword(markerText)) {
        return true;
      }
    }
  }

  // 方法3: 检查广告相关类名
  const classList = Array.from(element.classList);
  if (
    classList.some((cls) => ['ad', 'promo', 'sponsor', 'advert'].some((ad) => cls.includes(ad)))
  ) {
    return true;
  }

  // 方法4: 前4个结果检测（启发式规则）
  // 正常搜索结果通常包含：百度快照、百度链接、摘要结构等特征
  // 如果前4个结果缺少这些特征，可能是广告
  if (index < 4) {
    const hasSnapshot = resultText.includes('百度快照');
    const hasBaiduLink = element.querySelector('a[href*="baidu.com/link"]') !== null;
    const hasNormalStructure = element.querySelector('.c-abstract, .c-showurl') !== null;
    const hasAdMarker = containsAdKeyword(resultText);

    return hasAdMarker || (!hasSnapshot && !hasBaiduLink && !hasNormalStructure);
  }

  return false;
}

/**
 * 隐藏元素
 * 通过设置data属性和内联样式来隐藏广告元素
 *
 * @param element - 要隐藏的DOM元素
 * @param hiddenElements - 已隐藏元素的Set集合，用于跟踪状态
 */
export function hideElement(element: HTMLElement, hiddenElements: Set<HTMLElement>): void {
  element.setAttribute('data-baidu-ad-filtered', 'true');
  element.style.cssText =
    'display:none!important;visibility:hidden!important;height:0!important;overflow:hidden!important;margin:0!important;padding:0!important;';
  hiddenElements.add(element);
}

/**
 * 显示元素
 * 移除隐藏标记和样式，恢复元素可见性
 *
 * @param element - 要显示的DOM元素
 */
export function showElement(element: HTMLElement): void {
  element.removeAttribute('data-baidu-ad-filtered');
  element.style.cssText = '';
  ['display', 'visibility', 'height', 'overflow', 'margin', 'padding'].forEach((prop) => {
    element.style.removeProperty(prop);
  });
}

/**
 * 清除所有元素的过滤样式
 * 当用户关闭过滤功能时调用，恢复所有被隐藏的广告元素
 */
export function clearAllFilterStyles(): void {
  document.querySelectorAll('[data-baidu-ad-filtered="true"], .gp2k11k').forEach((el) => {
    const htmlEl = el as HTMLElement;
    htmlEl.removeAttribute('data-baidu-ad-filtered');
    htmlEl.style.cssText = '';
    ['display', 'visibility', 'height', 'overflow', 'margin', 'padding'].forEach((prop) => {
      htmlEl.style.removeProperty(prop);
    });
  });
}
