<!-- markdownlint-disable -->

<div align="center">

<img src="./src-tauri/icons/icon.png" width="120" alt="轻签图标">

# 轻签 LiteNote

轻量、透明的本地待办桌面小部件<br>
基于 Tauri 2 + React 构建

<!-- 开源后请将下方链接替换为你的仓库地址 -->
[反馈问题](https://github.com/SeaZhusp/LiteNote/issues) · [更新日志](https://github.com/SeaZhusp/LiteNote/releases)

[![Version](https://img.shields.io/github/v/release/SeaZhusp/LiteNote)](https://github.com/SeaZhusp/LiteNote/releases/latest)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
![Stars](https://img.shields.io/github/stars/SeaZhusp/LiteNote?color=ffcb47&labelColor=black)</br>
![React 19](https://img.shields.io/badge/React-19-blue?logo=react)
![Tauri v2](https://img.shields.io/badge/Tauri-v2-%2324C8D8?logo=tauri)
![Rust Edition 2021](https://img.shields.io/badge/Rust-2021-%23000000?logo=rust)

</div>

<!-- markdownlint-restore -->

---

## 为什么选择轻签

很多待办或笔记工具功能堆叠、体积偏大，不适合「贴在桌面、随手记一笔」。轻签专注 **本地待办** 小部件：无边框透明面板、托盘常驻、一键唤出，数据留在本机，适合日常清单与桌面常驻。

## 功能特点

- **本地待办** — SQLite 存储，支持完成/删除、置顶、重要程度颜色、截止时间、**拖拽排序**

- **循环待办** — 支持每天/每周/每月重复提醒，可自定义具体时间和目标日，到期自动进入下一轮，无需手动重置

- **截止时间提醒** — 普通待办支持设置截止时间，到期前 15 分钟系统通知；循环待办按规则自动重复提醒

- **桌面小部件体验** — 透明玻璃风格、面板透明度可调、窗口置顶、关闭后隐藏到系统托盘、标题栏显示版本号

- **快捷唤出** — 全局快捷键 `Ctrl+Shift+L`（macOS 为 `⌘+Shift+L`）显示/隐藏主窗口；托盘菜单与双击托盘图标可恢复窗口

- **独立设置页** — 外观（透明度）、语言（简体中文 / English / 跟随系统）

- **跨平台** — 支持 Windows（NSIS 安装包 + 绿色便携版）与 macOS（`.app` / `.dmg`）；

    <img src="docs/images/main.png" width="380" alt="主窗口">

## 应用场景

- 桌面常驻的轻量待办清单
- 游戏、看视频时随手记待办
- 周期性提醒事项（每天喝水、每周例会、每月还款等）
- 有截止时间的事项提醒（本地通知）

## 下载安装

前往 [GitHub Releases](https://github.com/SeaZhusp/LiteNote/releases) 下载最新版本。

## 从源码构建

### 环境要求

- [Node.js](https://nodejs.org/) 18+ 与 [pnpm](https://pnpm.io/)
- [Rust](https://www.rust-lang.org/tools/install) stable
- [Tauri CLI 2](https://v2.tauri.app/)（通过 `pnpm tauri` 调用即可）

**Windows 额外需要：** Microsoft C++ Build Tools (MSVC) + Windows SDK  

**macOS 额外需要：** Xcode Command Line Tools

### 步骤

```bash
git clone https://github.com/SeaZhusp/LiteNote.git
cd LiteNote

pnpm install

# 开发模式（Tauri + 前端热更新）
pnpm tauri dev

# 仅前端预览（无 Tauri API）
pnpm dev

# 构建发布版本
pnpm tauri build
```

## Star History

<!-- 将 SeaZhusp/LiteNote 替换为实际仓库 -->
[![Star History Chart](https://api.star-history.com/svg?repos=SeaZhusp/LiteNote&type=Date&legend=top-left)](https://star-history.com/#SeaZhusp/LiteNote&Date)

## 贡献

欢迎通过 [Issue](https://github.com/SeaZhusp/LiteNote/issues) 反馈问题或提交 Pull Request。开源前请自行添加 `LICENSE` 文件（建议 MIT，与徽章一致）。

## 许可证

本项目采用 [MIT](LICENSE) 许可证（请在仓库根目录添加 `LICENSE` 文件）。
