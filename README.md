<!-- markdownlint-disable -->

<div align="center">

<img src="./src-tauri/icons/icon.png" width="120" alt="轻签图标">

# 轻签 LiteNote

轻量、透明的本地待办桌面小部件<br>
基于 Tauri 2 + React 构建

<!-- 开源后请将下方链接替换为你的仓库地址 -->
[反馈问题](https://github.com/YOUR_USERNAME/LiteNote/issues) · [更新日志](https://github.com/YOUR_USERNAME/LiteNote/releases)

[![Version](https://img.shields.io/github/v/release/YOUR_USERNAME/LiteNote)](https://github.com/YOUR_USERNAME/LiteNote/releases/latest)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
![Stars](https://img.shields.io/github/stars/YOUR_USERNAME/LiteNote?color=ffcb47&labelColor=black)</br>
![React 19](https://img.shields.io/badge/React-19-blue?logo=react)
![Tauri v2](https://img.shields.io/badge/Tauri-v2-%2324C8D8?logo=tauri)
![Rust Edition 2021](https://img.shields.io/badge/Rust-2021-%23000000?logo=rust)

</div>

<!-- markdownlint-restore -->

---

## 为什么选择轻签

很多待办或笔记工具功能堆叠、体积偏大，不适合「贴在桌面、随手记一笔」。轻签专注 **本地待办 + 时钟** 小部件：无边框透明面板、托盘常驻、一键唤出，数据留在本机，适合日常清单与桌面常驻。

## 功能特点

- **本地待办** — SQLite 存储，支持完成/删除、置顶、重要程度颜色、截止时间

- **时钟与农历** — 显示当前时间、日期、星期；可选展示农历（`lunar-javascript`），可在设置中折叠时钟区

- **截止时间提醒** — 到期后通过系统通知提醒（轮询检测，每 30 秒）

- **桌面小部件体验** — 透明玻璃风格、面板透明度可调、窗口置顶、关闭后隐藏到系统托盘

- **快捷唤出** — 全局快捷键 `Ctrl+Shift+L`（macOS 为 `⌘+Shift+L`）显示/隐藏主窗口；托盘菜单与双击托盘图标可恢复窗口

- **独立设置页** — 外观（透明度、是否显示时钟区）、语言（简体中文 / English / 跟随系统）

- **跨平台** — 支持 Windows（NSIS 安装包 + 绿色便携版）与 macOS（`.app` / `.dmg`）；macOS 点击 Dock 图标可在窗口隐藏后重新显示

> 截图可放在 `Docs/images/` 后在此处补充，例如：`![主窗口](Docs/images/main.png)`

## 应用场景

- 桌面常驻的轻量待办清单
- 游戏、看视频时随手记待办
- 需要看时间和农历的桌面角标
- 有截止时间的事项提醒（本地通知）

## 下载安装

前往 [GitHub Releases](https://github.com/YOUR_USERNAME/LiteNote/releases) 下载最新版本。

| 平台 | 说明 |
|------|------|
| **Windows** | 提供 NSIS 安装包与绿色便携版；需 [WebView2 运行时](https://developer.microsoft.com/microsoft-edge/webview2/)（Win10/11 通常已自带） |
| **macOS** | `.dmg` 或 `.app`；按芯片选择 arm64 / x86_64 构建包 |

## 数据与隐私

- 待办与设置默认保存在本机，**不上传**到作者服务器
- Windows 数据库路径示例：`%APPDATA%\com.qiufeng.litenote\litenote.db`
- macOS 位于应用配置目录下同名数据库文件

## 从源码构建

### 环境要求

- [Node.js](https://nodejs.org/) 18+ 与 [pnpm](https://pnpm.io/)
- [Rust](https://www.rust-lang.org/tools/install) stable
- [Tauri CLI 2](https://v2.tauri.app/)（通过 `pnpm tauri` 调用即可）

**Windows 额外需要：** Microsoft C++ Build Tools (MSVC) + Windows SDK  

**macOS 额外需要：** Xcode Command Line Tools

### 步骤

```bash
git clone https://github.com/YOUR_USERNAME/LiteNote.git
cd LiteNote

pnpm install

# 开发模式（Tauri + 前端热更新）
pnpm tauri dev

# 仅前端预览（无 Tauri API）
pnpm dev

# 构建发布版本
pnpm tauri build
```

构建产物位于 `src-tauri/target/release/bundle/`。

### 分平台构建提示

**macOS（首次需安装 target）：**

```bash
rustup target add aarch64-apple-darwin x86_64-apple-darwin

# Apple Silicon
pnpm tauri build --target aarch64-apple-darwin

# Intel
pnpm tauri build --target x86_64-apple-darwin
```

**Windows：**

```bash
pnpm tauri build                    # NSIS 安装版 + 便携版
pnpm tauri build -- --no-bundle     # 仅编译 exe（绿色版）
```

### 更换应用图标

```bash
pnpm tauri icon ./your-icon.png
```

生成文件会写入 `src-tauri/icons/`。

发布前请在 `src-tauri/tauri.conf.json` 中确认 `productName`、`version`、`identifier`（发布后勿随意修改 `identifier`）。

## 技术栈

| 部分 | 技术 |
|------|------|
| 前端 | React 19、Zustand、Tailwind CSS 4、Vite 7、TypeScript |
| 桌面 | Tauri 2、SQLite（`tauri-plugin-sql`）、系统通知、全局快捷键、托盘 |

## Star History

<!-- 将 YOUR_USERNAME/LiteNote 替换为实际仓库 -->
[![Star History Chart](https://api.star-history.com/svg?repos=YOUR_USERNAME/LiteNote&type=Date&legend=top-left)](https://star-history.com/#YOUR_USERNAME/LiteNote&Date)

## 贡献

欢迎通过 [Issue](https://github.com/YOUR_USERNAME/LiteNote/issues) 反馈问题或提交 Pull Request。开源前请自行添加 `LICENSE` 文件（建议 MIT，与徽章一致）。

## 参考

- [Tauri 2 文档](https://v2.tauri.app/)
- [Tauri 应用图标](https://v2.tauri.app/develop/icons/)

## 许可证

本项目采用 [MIT](LICENSE) 许可证（请在仓库根目录添加 `LICENSE` 文件）。
