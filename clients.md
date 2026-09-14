---
layout: default
title: Windows、macOS、Android 与 iOS 代理客户端指南
description: 主流代理工具客户端 v2rayN、Clash Verge Rev、Shadowrocket、v2rayNG 等各平台下载与使用指南。
---

# 💻 代理客户端选择与教程

针对不同的操作系统（Windows / macOS / iOS / Android），我们需要选择最合适的代理客户端工具。以下是本站整理的各平台主力工具教程。

## 🪟 Windows 客户端

Windows 平台拥有最丰富的代理工具生态，适合办公、游戏等复杂场景。

- **[Windows 客户端推荐 / v2rayN](https://jichangmao.com/blog/windows-v2rayn-guide/)**
  *简介：老牌经典的 V2Ray 客户端。界面稍显极客，但功能极其强大，适合有一定基础的用户日常使用。*

## 🍏 macOS 客户端

Mac 用户通常追求界面的优雅与系统的低资源占用。

- **[macOS 客户端推荐 / Clash Verge Rev](https://jichangmao.com/blog/mac-clash-verge-rev-guide/)**
  *简介：目前 Mac 平台首选的开源免费 Clash 客户端，基于 Tauri 框架，性能极佳，支持最新的 Mihomo 内核，强烈推荐。*
- **[Mac 网络客户端怎么选？Clash Verge Rev、sing-box 和 Stash 对比](https://bestjichang.com/blog/mac-client-comparison/)**
  *简介：深度横向对比，帮助你了解不同代理内核（sing-box/Clash）的区别，适合进阶用户。*

## 🍎 iOS (iPhone/iPad) 客户端

由于系统封闭性，iOS 上的优秀网络工具通常需要非国区 Apple ID，并且部分软件为付费买断制。

- **[iOS 客户端推荐 / Shadowrocket (小火箭)](https://jichangmao.com/blog/shadowrocket-guide/)**
  *简介：iOS 端性价比最高、最著名的代理工具。支持极多协议，适合绝大多数普通用户的日常番剧与网页浏览。*
- **[Loon 客户端教程](https://jichangmao.com/blog/ios-loon-guide/)**
  *简介：UI 精美的轻量级高阶代理工具，支持插件与脚本。*
- **[Quantumult X 教程](https://jichangmao.com/blog/ios-quantumultx-guide/)**
  *简介：进阶玩家的首选（俗称“圈X”），强大的重写和任务机制。*
- **[Surge 教程](https://jichangmao.com/blog/ios-surge-guide/)**
  *简介：iOS/Mac 生态下最强大、价格也最昂贵的顶级网络开发/代理工具。*

## 🤖 Android 客户端

Android 生态开放，有很多免费且优秀的开源选择。

- **[Android 客户端推荐 / v2rayNG](https://jichangmao.com/blog/v2rayng-guide/)**
  *简介：安卓平台最普及的代理客户端。操作简单直接，复制节点链接即可使用。*


## 📊 不同系统客户端怎么选

| 系统 | 推荐客户端 | 适合人群 | 上手难度 | 费用情况 |
|---|---|---|---|---|
| Windows | Clash Verge Rev / v2rayN | 普通用户与进阶用户 | 简单～中等 | 免费 |
| macOS | Clash Verge Rev | 普通用户 | 简单 | 免费 |
| iOS / iPadOS | Shadowrocket | 普通用户 | 简单 | 付费 |
| Android | v2rayNG | 普通用户 | 简单 | 免费 |

### Clash Verge Rev 和 v2rayN 怎么选
对于绝大多数 Windows 和 macOS 用户，**Clash Verge Rev** 是目前最推荐的选择。它拥有现代化的图形界面，支持强大的订阅管理、规则分流（自动判断国内外网站）以及易用的设置面板。
而 **v2rayN** 则更适合一些老玩家或开发者，它的界面相对传统，但在协议支持、直接测试节点连通性以及底层灵活配置方面有着非常轻量高效的表现。如果你只是想“一键连上外网”，选 Clash；如果你喜欢折腾和看各种参数，选 v2rayN。

### 什么是订阅链接
订阅链接就像是机场发给你的一把“云端钥匙”。用户在购买套餐后，从机场的后台面板复制这串专属于你的链接，然后粘贴并“导入”到客户端软件中。客户端会自动连接服务器，将所有的可用节点、加密密码和配置参数一次性下载到本地，让你免去了手动配置的繁琐。

### 什么情况下需要 TUN 模式
在大多数客户端（如 Clash Verge Rev）中，默认开启的是“系统代理”。这能满足 90% 的浏览器访问需求。但如果你发现以下情况：
- 某些游戏客户端无法登录外服
- 命令行工具（如 Git、npm）网络连接超时
- 某些不遵循系统代理设置的专业软件无法联网
此时你需要开启 **TUN 模式（虚拟网卡模式）**。它会接管电脑所有的网络流量，强制让所有软件都通过代理，实现真正的“全局翻墙”。

### 客户端连不上时先检查什么
如果你遇到了连不上网的情况，请按照以下步骤快速排障：
1. **订阅是否过期**：登录机场官网，检查流量是否用尽或套餐是否到期。
2. **节点是否可用**：切换到另一个地区的节点（比如从香港换到日本）重试。
3. **系统时间**：确保你的电脑或手机系统时间是准确的（与标准时间误差不超过 1-2 分钟），否则加密协议会拒绝连接。
4. **系统代理被占用**：检查是否有其他安全软件或旧版代理软件占用了端口。
5. **尝试 TUN 模式**：如果浏览器打得开，但其他软件不行，尝试开启 TUN 模式。
6. **刷新 DNS**：清理系统 DNS 缓存，或在客户端内重启核心。
7. **更新客户端与订阅**：点击“更新订阅”获取最新节点，同时确保你使用的客户端是较新版本。


---
[🏠 返回首页](./) | [👉 需要配置 Clash？查看教程](https://colasaiko.github.io/Clash-/) | [👉 查看机场推荐](./airport.html)
