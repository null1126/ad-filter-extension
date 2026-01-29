/**
 * 消息类型枚举
 * 用于扩展各模块之间的通信消息类型定义
 */
export enum MessageType {
  /** 内容脚本向后台脚本更新广告数量 */
  AD_COUNT_UPDATE = 'AD_COUNT_UPDATE',

  /** 获取过滤器的启用状态和广告数量 */
  GET_FILTER_STATE = 'GET_FILTER_STATE',

  /** 设置过滤器的启用状态 */
  SET_FILTER_STATE = 'SET_FILTER_STATE',

  /** 切换过滤器的启用/禁用状态（由后台脚本发送给内容脚本） */
  TOGGLE_FILTER = 'TOGGLE_FILTER',

  /** 获取当前已过滤的广告数量 */
  GET_AD_COUNT = 'GET_AD_COUNT',
}
