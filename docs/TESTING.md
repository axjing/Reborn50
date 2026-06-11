# Reborn50 测试指南

## 1. 环境准备

1. 下载安装 [微信开发者工具](https://developers.weixin.qq.com/minigame/dev/devtools/download.html)
2. 注册小游戏账号并获取 AppID ([mp.weixin.qq.com](https://mp.weixin.qq.com))
3. 将 AppID 填入 `project.config.json` 的 `appid` 字段
4. 用开发者工具打开项目根目录

## 2. 功能测试清单

### 2.1 核心流程

```
[ ] BootScene → 1秒后自动跳转 TitleScene
[ ] TitleScene → 点击「新游戏」进入 HomeScene
[ ] TitleScene → 有存档时显示「继续」按钮
[ ] HomeScene → 角色像素立绘正确显示
[ ] HomeScene → HP/SP/Day 进度条显示正确
[ ] HomeScene → 点击「今日挑战」进入 ChallengeScene
[ ] HomeScene → 未完成规则时点击「开始冒险」显示提示
[ ] HomeScene → 完成规则后「开始冒险」可点击
[ ] ChallengeScene → 点击规则项打勾，属性增长
[ ] ChallengeScene → 7项全部完成后触发 completeDay
[ ] ChallengeScene → 返回后 HomeScene 数据一致
[ ] BattleScene → 正常进入战斗
[ ] BattleScene → 攻击/技能/防御/逃跑功能正常
[ ] BattleScene → 击败怪物后返回 HomeScene
[ ] BossScene → 第7/14/21/28/35/42/50天触发 BOSS 战
[ ] BossScene → BOSS 30%血量进入狂暴状态
[ ] BossScene → 击败 BOSS 记录 defeatedBosses
[ ] GameOverScene → 通关50天显示通关结局
```

### 2.2 存档与跨日逻辑

```
[ ] 游戏退出后重新打开 → 存档正确加载
[ ] 今日完成7项规则 → 次日打开进入新的一天
[ ] 今日未完成 → 次日打开触发 Day1 重置，属性-1
[ ] 卸载重装 → 存档丢失（预期行为）
[ ] 同一天多次打开 → 不重复加减属性
[ ] 连续完成多天 → streak 正确累计
```

### 2.3 边界测试

```
[ ] Day 1 重置 → 所有状态正确
[ ] Day 50 通关 → 正确触发结局
[ ] HP 归零 → 战败逻辑正确
[ ] SP 不足时使用技能 → 显示提示不消耗
[ ] 重复点击规则项 → 不重复加属性
[ ] 全部完成后继续点击 → 无响应
```

### 2.4 UI/UX

```
[ ] 按钮点击区域正确
[ ] 像素字体在不同分辨率下可读
[ ] 安全区域适配（刘海屏/挖孔屏）
[ ] 横屏锁定（deviceOrientation: portrait）
[ ] 触摸事件响应无延迟
```

## 3. 真机调试

### 3.1 远程调试

1. 开发者工具 → 点击「真机调试」
2. 手机扫码 → 连接成功后操作游戏
3. 验证：
   - Canvas 渲染在各分辨率下正确
   - 触摸事件响应正常
   - 存档读写正确
   - FPS >= 30

### 3.2 覆盖设备

| 设备类型 | 系统 | 分辨率 |
|---------|------|--------|
| iPhone SE | iOS 15+ | 375x667 |
| iPhone 14 Pro | iOS 16+ | 393x852 |
| 华为 Mate 40 | Android 12 | 390x844 |
| 小米 13 | Android 13 | 393x873 |

## 4. 云测试

使用 [微信小游戏云测试](https://developers.weixin.qq.com/minigame/dev/guide/performance/perf-tools-cloudtest.html)：

1. 在开发者工具上传代码至 MP
2. 进入 MP 后台 → 云测试
3. 选择「智能探索」模式 → 自动遍历所有交互点
4. 选择「录制回放」→ 录制关键路径并批量回归
5. 查看兼容性报告 + 性能报告

## 5. 性能目标

| 指标 | 目标 |
|------|------|
| FPS | >= 30 |
| 首屏加载 | < 3s |
| 内存占用 | < 200MB |
| DrawCall | < 100 |
| 代码包大小 | < 4MB |
