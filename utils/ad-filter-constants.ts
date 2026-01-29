/**
 * 广告选择器常量
 * 定义百度搜索结果页面中各种广告元素的CSS选择器
 */
export const AD_SELECTORS = {
  /** gp2k11k类型的广告容器（最常见的百度广告类型） */
  gp2k11k: '.gp2k11k',
  /** 搜索结果元素（可能包含广告） */
  result: '.result',
  /** 品牌广告材质容器 */
  tenonMaterial: '.tenon_pc_material',
  /** 品牌广告的特定ID */
  tenonId: '#tenon-13142',
  /** 品牌广告提示元素 */
  tenonBrandTip: '.tenon_pc_comp_brand_tip',
  /** 所有品牌广告相关的选择器组合 */
  tenonAll: '.tenon_pc_material, #tenon-13142, .tenon_pc_comp_brand_tip',
} as const;

/**
 * 广告关键词
 * 用于识别文本内容中的广告标识
 */
export const AD_KEYWORDS = ['广告', '推广'] as const;

/**
 * 延迟时间常量（单位：毫秒）
 * 用于控制各种操作的执行时机
 */
export const DELAY_TIMES = {
  /** MutationObserver检测到广告变化后的防抖延迟 */
  debounce: 50,
  /** 过滤操作的防抖延迟 */
  filter: 300,
  /** 初始化时的多次延迟检查（用于捕获动态加载的内容） */
  init: [500, 2000, 5000],
  /** 定期检查新广告的间隔时间 */
  periodic: 1000,
} as const;
