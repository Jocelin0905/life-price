# Life Price V1 设计规格

## 目标

Life Price 是一个 mobile-first 的纯前端时间价格计算器。它把商品价格转换成用户需要交换的工作时间，并通过可选的单次使用成本与“值得交换 / 算了”决策帮助用户重新感受价格。

V1 不包含登录、后端、数据库、AI、预算、消费分类、图表、电商、分享或 PWA。

## 技术架构

- React、TypeScript、Vite。
- 单页应用，使用应用内视图状态呈现首次设置、换算、历史、历史详情与设置。
- localStorage 是唯一持久化介质，不上传数据。
- `src/domain/calculations.ts` 是所有核心计算的唯一入口。
- `src/storage/lifePriceStorage.ts` 是唯一直接访问 localStorage 的模块。
- 纯领域函数与存储适配器独立测试，关键用户流程通过浏览器走查。

## 页面结构

### 首次设置

首次没有可用设置时显示：月收入、每周工作天数、每天工作小时、实时每小时收入和“开始换算”。月收入与每日工作小时允许小数，每周工作天数限制为 1 至 7，所有值必须大于 0。

### 换算页

初始首屏只显示品牌、问题“你想买的东西多少钱？”、价格输入和换算按钮。换算后在当前页展示价格、等价工作时间、等价工作日、可选商品名称、可选使用次数、单次使用成本，以及“值得交换 / 算了”。工作时间必须是最大视觉焦点。

选择“值得交换”只显示短反馈，不写入历史。选择“算了”保存计算快照并显示“你留下了 XX”。完成后可开始新一次计算。

### 我保住的人生时间

默认显示本月，允许切换至有记录的其他月份。每月展示放弃消费金额、等价工作时间、约合工作日，以及按创建时间倒序排列的记录。点击记录显示详情，并可二次确认后删除。

月份归属必须通过 `new Date(createdAt)` 后读取用户本地 `getFullYear()` 和 `getMonth()` 判断，不得截取 ISO 字符串中的 UTC 月份。

### 设置

显示并允许修改收入与工作安排，同时实时显示当前每小时收入。新设置只影响之后的计算，历史快照不重算。页面说明数据仅保存在当前浏览器，并提供二次确认的“清除全部数据”。清除后回到首次设置。

## 核心计算

平均每月周数固定使用 `52 / 12`。

```text
monthlyWorkHours = workDaysPerWeek × workHoursPerDay × 52 / 12
hourlyIncome = monthlyIncome / monthlyWorkHours
rawWorkMinutes = price / hourlyIncome × 60
workMinutes = round(rawWorkMinutes)
workDays = rawWorkMinutes / 60 / workHoursPerDay
costPerUse = price / usageCount
minutesPerUse = round(rawWorkMinutes / usageCount)
```

`hourlyIncome` 可以保存在设置中作为快照和展示值，但每次新换算必须由 `monthlyIncome`、`workDaysPerWeek`、`workHoursPerDay` 通过 `calculations.ts` 重新计算。页面和存储模块不得复制公式。

时间小于一小时显示分钟；一小时以上显示小时与分钟；整小时不显示零分钟。金额和工作日显示到两位小数。内部历史时间以整数分钟保存。

## 数据结构

localStorage 键为 `life-price:v1`。

```ts
type LifePriceStore = {
  schemaVersion: 1;
  settings: UserSettings | null;
  decisions: DecisionRecord[];
};

type UserSettings = {
  monthlyIncome: number;
  workDaysPerWeek: number;
  workHoursPerDay: number;
  hourlyIncome: number;
  updatedAt: string;
};

type DecisionRecord = {
  id: string;
  name: string;
  price: number;
  workMinutes: number;
  workDays: number;
  workHoursPerDay: number;
  usageCount: number | null;
  costPerUse: number | null;
  minutesPerUse: number | null;
  decision: "skip";
  createdAt: string;
};
```

`workHoursPerDay` 随历史记录保存，用于当月汇总的工作日换算。单条记录保存当时的全部结果快照；设置变化不得改变它。

## 存储异常策略

读取损坏 JSON、未知 schemaVersion 或无法访问 localStorage 时：

- 页面继续运行，不崩溃。
- 保留原存储，不自动写入空对象覆盖。
- 当前会话使用内存数据降级。
- 全局显示简短异常提示，并说明刷新后数据可能无法保留。
- 在异常未解决前，存储层不得把降级数据写回同一键。

## 视觉与交互

- 固定浅色主题，以暖灰白、深墨色和单一橙红强调色构成。
- 手机优先，桌面使用居中的窄应用画布。
- 通过留白和排版建立层级，避免卡片堆叠和金融仪表盘观感。
- 底部导航包含“换算、人生时间、设置”，适配移动端安全区。
- 动效只用于状态切换和结果反馈，并支持减少动态效果偏好。
- 输入、按钮、焦点与文本保持可访问对比度。
- 超大金额和时间通过响应式字号避免溢出。

## 验收条件

- 首次设置与再次进入分流正确。
- 月收入 8000、每周 5 天、每天 8 小时、价格 699 时，结果显示 15小时09分钟及约 1.89 个工作日。
- 只有“算了”创建历史；未命名记录显示“未命名消费”。
- 使用次数为空可继续决策，使用次数为 0 不计算单次成本。
- 修改收入不影响任何历史记录或汇总。
- 月份按用户本地时间归属，月末跨时区记录不会归错月。
- localStorage 异常不会覆盖原始内容，并明确提示会话降级。
- 刷新后正常存储的数据仍存在。
- 自动测试、类型检查与 production build 通过。
- 浏览器完成首次设置、换算、两类决策、历史详情、删除、修改设置和清除数据走查。
