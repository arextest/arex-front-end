export const BizLogLevel = {
  INFO: 0,
  WARN: 1,
  ERROR: 2,
  DEBUG: 3,
} as const;

export const BizLogType = {
  PLAN_START: 0,
  PLAN_CASE_SAVED: 1,
  PLAN_CONTEXT_BUILT: 2,
  PLAN_DONE: 3,
  PLAN_ASYNC_RUN_START: 4,
  PLAN_STATUS_CHANGE: 5,
  PLAN_FATAL_ERROR: 6,

  QPS_LIMITER_INIT: 100,
  QPS_LIMITER_CHANGE: 101,

  CONTEXT_START: 200,
  CONTEXT_AFTER_RUN: 202,
  CONTEXT_SKIP: 203,
  CONTEXT_NORMAL: 204,

  ACTION_ITEM_CASE_SAVED: 306,
  ACTION_ITEM_EXECUTE_CONTEXT: 300,
  ACTION_ITEM_INIT_TOTAL_COUNT: 302,
  ACTION_ITEM_STATUS_CHANGED: 303,
  ACTION_ITEM_SENT: 304,
  ACTION_ITEM_BATCH_SENT: 305,

  RESUME_START: 400,
} as const;
