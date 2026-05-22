# GitHub 个人主页（动态版）

这是一个基于 `Vite + React` 的个人主页模板，包含：

- 深浅色主题切换
- 鼠标跟随的背景光效
- 可交互的信息卡片
- 一键部署到 GitHub Pages（`main` 分支自动发布）

## 本地开发

```bash
npm install
npm run dev
```

默认地址：`http://localhost:5173`

## 你需要改的地方

先改 `src/App.jsx` 里的这些占位内容：

- `YOUR NAME`
- `YOUR_USERNAME`
- `you@example.com`
- 文案内容（技能、在做项目等）

## 部署到 GitHub Pages

1. 新建一个 GitHub 仓库（比如：`homepage`）
2. 把这个目录推到远程 `main` 分支
3. 在 GitHub 仓库设置里启用 Pages（Source 选择 GitHub Actions）
4. 每次 push 到 `main` 会自动构建并发布

发布后地址通常是：

`https://<你的用户名>.github.io/<仓库名>/`

## 常用命令

```bash
npm run dev     # 本地预览
npm run build   # 生产构建
npm run preview # 预览构建结果
```
