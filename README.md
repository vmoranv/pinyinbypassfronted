# 同音字转换器

一个基于 React 和 TypeScript 的中文同音字转换工具，可以将输入的中文文本转换为同音字，帮助用户创造有趣的文字变体。

## 功能特点

- 🔄 实时中文同音字转换
- 📝 支持多个时间线管理转换历史
- 💾 本地存储保存转换记录
- 🌓 深色/浅色主题切换
- 📊 字符统计（中文、英文、数字等）
- 🎨 渐变动画背景
- 📱 响应式设计

## 技术栈

- React 18
- TypeScript 4
- Chakra UI
- Framer Motion
- Emotion
- React Icons

## 开发环境设置

1. 安装依赖：
```bash
npm install
```

2. 启动开发服务器：
```bash
npm start
```

3. 构建生产版本：
```bash
npm run build
```

## 项目结构

```
src/
  ├── components/          # React 组件
  │   └── HomophoneConverter.tsx  # 主要转换器组件
  ├── utils/              # 工具函数
  │   ├── dictionary.ts   # 同音字字典加载和转换逻辑
  │   └── storage.ts      # 本地存储工具
  ├── types/              # TypeScript 类型定义
  │   └── custom.d.ts     # 自定义类型声明
  ├── App.tsx             # 应用入口组件
  └── index.tsx          # 应用入口文件
```

## 使用说明

1. 在输入框中输入要转换的中文文本
2. 点击"转换"按钮进行同音字转换
3. 转换结果会显示在历史记录中
4. 可以创建多个时间线来管理不同的转换记录
5. 使用右上角的按钮切换深色/浅色主题

## 数据存储

- 转换历史和时间线数据使用 localStorage 本地存储
- 同音字字典文件位于 `/public/assets/chinese_homophone_char.txt`

## 贡献

欢迎提交 Issue 和 Pull Request 来帮助改进这个项目！

## 许可证

MIT License
