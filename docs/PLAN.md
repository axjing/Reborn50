# Reborn50 微信小游戏 — 开发计划

## 1. 项目概述

像素复古风 RPG 微信小游戏，将 Project50 自律挑战（50 天 7 项规则）与角色养成、回合制战斗相结合。每天完成自律任务提升角色属性、挑战怪物与 BOSS，失败则从 Day 1 重新开始。

## 2. 技术选型

| 项目 | 选择 |
|------|------|
| 平台 | 微信小游戏（原生框架） |
| 语言 | JavaScript (ES6) |
| 渲染 | Canvas 2D API，所有像素图用 `fillRect` 代码绘制，无外部图片 |
| 开发工具 | 微信开发者工具（稳定版） |
| 持久化 | `wx.setStorageSync` / `wx.getStorageSync` |
| 音效 | Web Audio API 编程生成 8-bit 音效 |

## 3. 项目结构

```
Reborn50/
├── game.json                       # 小游戏配置
├── project.config.json             # 开发者工具配置
├── game.js                         # 小游戏入口
├── js/
│   ├── main.js                     # 主循环 + 初始化
│   ├── scenes/
│   │   ├── BootScene.js            # 启动加载
│   │   ├── TitleScene.js           # 标题画面
│   │   ├── HomeScene.js            # 主界面（角色+入口）
│   │   ├── ChallengeScene.js       # 每日挑战（7项规则）
│   │   ├── BattleScene.js          # 普通战斗
│   │   ├── BossScene.js            # BOSS战
│   │   └── GameOverScene.js        # 结算/通关
│   ├── systems/
│   │   ├── SceneManager.js         # 场景状态机
│   │   ├── GameLoop.js             # requestAnimationFrame 主循环
│   │   ├── InputManager.js         # 触摸输入抽象
│   │   ├── AudioManager.js         # 8-bit 音效管理
│   │   ├── StorageManager.js       # 存档 + 跨日检测
│   │   └── PixelRenderer.js        # 像素绘图工具
│   ├── entities/
│   │   ├── Player.js               # 玩家（属性/升级/装备）
│   │   ├── Monster.js              # 怪物/BOSS
│   │   └── Particle.js             # 像素粒子特效
│   ├── ui/
│   │   ├── Button.js               # 像素按钮
│   │   ├── ProgressBar.js          # 进度条
│   │   ├── DialogBox.js            # 对话框
│   │   └── StatsPanel.js           # 属性面板
│   ├── data/
│   │   ├── rules.js                # 7项规则定义
│   │   ├── monsters.js             # 怪物/BOSS配置表
│   │   ├── items.js                # 物品配置
│   │   └── achievements.js         # 成就定义
│   └── utils/
│       ├── constants.js            # 全局常量
│       ├── color.js                # 像素调色板
│       └── random.js               # 随机工具
├── docs/
│   ├── PLAN.md                     # 本文件
│   ├── PROJECT50_introduction_cn.md
│   └── PROJECT50_introduction_en.md
├── CHANGELOG.md                    # 版本日志
├── AGENTS.md
├── README.md
├── LICENSE
└── .gitignore
```

## 4. RPG 属性与规则映射

| 规则 | 属性 | 英文 | 战斗效果 |
|------|------|------|---------|
| 1. 8点前起床 | 意志 | WIL | 核心属性，影响全能力 |
| 2. 晨间流程 | 灵力 | SPI | 技能伤害 / MP上限 |
| 3. 每日运动 | 力量 | STR | 物理攻击力 |
| 4. 每日阅读 | 智慧 | INT | 魔法攻击力 |
| 5. 学习新技能 | 技巧 | SKL | 物理防御 |
| 6. 健康饮食 | 活力 | VIT | HP上限 / 生命恢复 |
| 7. 记录手账 | 心境 | MND | 暴击率 / 闪避率 |

属性增长：每完成一项 → 对应属性 +1；全部 7 项完成 → 额外全属性 +1。

## 5. 核心玩法流程

```
TitleScene
  ├── [新游戏] → HomeScene (Day 1)
  └── [继续]   → HomeScene (读取存档)

HomeScene
  ├── 角色立绘 + 数值显示
  ├── 50天进度地图
  └── 入口：
       ├── [今日挑战] → ChallengeScene
       ├── [开始冒险] → BattleScene（仅当日全部完成才可进入）
       └── [状态]     → StatsPanel

ChallengeScene
  ├── 7项规则，点击切换 ✓/✗
  ├── 每完成一项 → 属性增长动画 + 音效
  ├── 全部完成 → "今日挑战完成！" 弹窗
  └── 自动保存

BattleScene
  ├── 回合制（攻击/技能/防御/物品）
  ├── 普通日 → 随机怪物
  ├── 里程碑日（7/14/21/28/35/42/50）→ BossScene
  └── 胜利 → 经验 + 掉落

GameOverScene
  ├── 未完成所有规则 → 重置 Day 1 + 属性削弱
  ├── 50天通关 → 结局 + 成就
  └── 统计展示
```

## 6. 战斗系统

- 类型：回合制，玩家先手，敌我交替
- 操作：普通攻击 / 技能（消耗灵力）/ 防御（减伤 50%）/ 物品
- 伤害公式：`物理伤害 = STR x 技能倍率 - 敌方 SKL`
- 暴击：`Math.random() < MND/1000` → 伤害 x 1.5
- 7 个 BOSS：怠惰史莱姆(D7) → 拖延蛇(D14) → 诱惑魔女(D21) → 安逸巨人(D28) → 放弃之龙(D35) → 混沌领主(D42) → 旧我(D50)

## 7. 开发阶段

总预估：20~24 个工作日（不含审核等待）

| 阶段 | 内容 | 工时 |
|------|------|------|
| 1 项目初始化 | game.json, project.config.json, game.js 骨架 | 0.5d |
| 2 核心框架 | GameLoop, SceneManager, InputManager, PixelRenderer | 2d |
| 3 UI组件 | Button, ProgressBar, DialogBox, StatsPanel | 1.5d |
| 4 场景A | BootScene, TitleScene | 1.5d |
| 5 场景B | HomeScene（主界面 + 进度地图） | 2d |
| 6 挑战系统 | ChallengeScene + rules.js | 2d |
| 7 存档系统 | StorageManager（跨日检测 + 版本迁移） | 1d |
| 8 角色系统 | Player（属性/升级/装备） | 1d |
| 9 战斗A | BattleScene + Monster（回合制逻辑 + AI） | 2.5d |
| 10 战斗B | BossScene + monsters.js（BOSS多阶段） | 1.5d |
| 11 物品系统 | items.js + 装备效果 | 1d |
| 12 音效 | AudioManager（8-bit 音效生成） | 1d |
| 13 特效 | Particle 粒子系统 + 动画打磨 | 1.5d |
| 14 成就 | achievements.js + 解锁逻辑 + 界面 | 1d |
| 15 测试 | 真机调试 + 云测试 + 边界测试 | 2d |
| 16 上线 | 备案确认 + 提审材料 + 提交审核 | 并行 |

## 8. 测试方案

### 8.1 开发期测试

| 类型 | 方法 |
|------|------|
| 功能 | 手动遍历所有场景 + 按钮交互 |
| 数值 | Console 验证伤害公式、属性增长 |
| 跨日 | 修改系统时间模拟：完成→次日正常；未完成→Day1 |
| 边界 | Day1重置、Day50通关、属性上下限 |

### 8.2 真机远程调试

- 微信开发者工具 → 真机调试 → 手机扫码
- 覆盖 iOS >= 12 + Android 主流机型各 1 台
- 验证：Canvas 适配、触摸事件、存档、FPS

### 8.3 云测试（微信官方服务）

- 入口：小游戏云测试（免费）
- 模式：智能探索（自动遍历）+ 录制回放（关键路径回归）
- 输出：兼容性报告 + 性能报告 + 崩溃堆栈

### 8.4 检查清单

```
[ ] 新游戏创建 → 属性初始值正确
[ ] 完成1项规则 → 对应属性+1
[ ] 完成全部7项 → 额外全属性+1
[ ] 跨日判定逻辑正确
[ ] 连续完成奖励
[ ] 里程碑日触发BossScene
[ ] 伤害公式正确
[ ] BOSS多阶段机制正常
[ ] 物品使用生效
[ ] 存档/读档/覆盖
[ ] Day50通关 → 结局画面
[ ] 多分辨率适配
[ ] 30分钟无内存泄漏
```

## 9. 上线部署流程

### 9.1 前置条件（项目首日同步推进）

| 步骤 | 耗时 |
|------|------|
| 注册小游戏账号（mp.weixin.qq.com，类目：休闲游戏） | 1~3d |
| 获取 AppID 配置到项目 | 即时 |
| 开发者绑定 | 即时 |
| 实名认证 | 1~5d |
| **小游戏备案**（平台初审1-2d -> 工信部短信24h -> 通管局1-20d） | **10~25d** |
| 配置 downloadFile 域名 | 即时 |

### 9.2 提审流程

```
开发完成 -> 开发者工具上传（版本号+备注）
       ->
MP后台 -> 设为体验版 -> 邀请验证
       ->
提交审核（内容介绍+截图>=4张+自审报告+更新说明）
       ->
审核（IAA 13~37工作日）
       ->
通过 -> 全量发布
```

### 9.3 版本号

遵循 `MAJOR.MINOR.PATCH`：v1.0.0 首版，v1.1.0 功能更新，v1.1.1 修复。

### 9.4 加急审核

已有通过版本 + 用户 > 5000 可申请（每季度 2 次）。

## 10. 迭代规划

| 版本 | 内容 |
|------|------|
| v1.0 | 核心玩法（角色->挑战->战斗->50天通关） |
| v1.1 | 装备系统 + 更多怪物 |
| v1.2 | 好友排行榜（完成天数 PK） |
| v2.0 | 每日订阅消息提醒 + 多角色选择 |

## 11. Git 规范（依 AGENTS.md）

- Commit 格式：`{feat,fix,docs}[(scope)]: 描述`，如 `feat[challenge]: implement 7-rule check-in scene`
- 严禁：`git reset --hard`, `git checkout .`, `git clean -fd`, `git stash`, `git add -A`, `git add .`, `git commit --no-verify`
- 提交前：`git status` + `git diff` 确认只含本会话文件 -> `git add <path1> <path2>`
- Rebase 冲突：只解决自己改过的文件，否则中止询问

## 12. CHANGELOG 管理

位置：`CHANGELOG.md`（项目根目录）
结构：

```
## [Unreleased]

### Added
- ...

### Fixed
- ...

## [v1.0.0] - 2025-xx-xx
```

- 新增归入 `## [Unreleased]`，已发布版本节不可修改

## 13. 像素美术规范

| 项目 | 规格 |
|------|------|
| 调色板 | NES 8色（黑/深灰/浅灰/白/红/绿/蓝/黄） |
| 角色 | 16x16px，Canvas fillRect 绘制 |
| 帧率 | 6 fps |
| 设计基准 | 375x667，按屏幕比例缩放 |
| 安全区域 | wx.getSystemInfoSync().safeArea |

## 14. 风险管理

| 风险 | 应对 |
|------|------|
| 备案周期长(10~25d) | 首日启动，与开发并行 |
| 审核驳回 | 提前备齐材料 |
| 低端机 Canvas 性能 | 矩形数 <= 300，离屏缓存 |
| 存档版本兼容 | StorageManager 记录 version 字段 |
| 全面屏适配 | safeArea 为基准 |
| Git 冲突 | 严格按 AGENTS.md 规范操作 |

## 15. 实施顺序

```
Phase 1(初始化) -> Phase 2(框架) -> Phase 3(UI) -> Phase 4+5(场景)
                                                        |
                                              Phase 6+7+8(挑战+存档+角色)
                                                        |
                                              Phase 9+10+11+12(战斗+物品+音效)
                                                        |
                                              Phase 13+14(特效+成就)
                                                        |
                                              Phase 15(测试) -> Phase 16(上线)
```

**并行**：备案在 Phase 1 启动时同步提交。
