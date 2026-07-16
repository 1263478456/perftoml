# 🔄 sub-converter — All-in-One 订阅转换服务

一条命令部署完整的代理订阅格式转换服务，基于 [subconverter](https://github.com/tindy2013/subconverter) + [sub-web](https://github.com/CareyWang/sub-web) + [ACL4SSR](https://github.com/ACL4SSR/ACL4SSR) 规则集。

## 🚀 快速开始

```bash
docker run -d --restart=always -p 8080:80 1263478456/sub-converter:latest
```

访问 `http://your-server:8080`

### Docker Compose

```bash
git clone https://github.com/1263478456/sub-converter.git
cd sub-converter
docker-compose up -d
```

## 📦 镜像说明

All-in-One 镜像包含：

| 组件 | 说明 |
|------|------|
| **subconverter** | 订阅格式转换引擎 (C++) |
| **sub-web** | Vue.js Web 界面 |
| **Nginx** | 静态文件服务 + API 反代 |
| **ACL4SSR 规则** | 30+ 分流规则组（预配置） |

架构：Nginx 统一入口（:80），前端直接 serve，API 请求转发给 subconverter（:25500）。

## 🌐 反向代理

All-in-One 镜像只暴露一个端口（默认 8080→80），外部反代只需配一条规则：

```
sub.example.com → http://host:8080
```

## ⚙️ 配置

### 环境变量

编辑 `.env` 修改端口：

```bash
PORT=8080
```

### 自定义规则

修改 `subconverter/pref.ini` 后重新构建镜像，或用 volume 挂载：

```bash
docker run -d -p 8080:80 \
  -v /path/to/pref.ini:/opt/subconverter/base/pref.ini:ro \
  1263478456/sub-converter:latest
```

## 🏗️ 本地构建

```bash
docker build -t sub-converter:latest .
docker run -d -p 8080:80 sub-converter:latest
```

## 📋 ACL4SSR 规则分组

| 策略组 | 说明 |
|--------|------|
| 🚀 节点选择 / ♻️ 自动选择 | 主代理策略 |
| 💬 Ai平台 | ChatGPT、Claude 等 |
| 📹 油管 / 🎥 奈飞 / 📺 B站 | 流媒体分流 |
| 📲 电报 / Ⓜ️ 微软 / 🍎 苹果 | 服务分流 |
| 🎮 游戏平台 | Steam/Epic/PS/Switch |
| 🛑 广告拦截 / 🍃 应用净化 | 过滤 |
| 🎯 全球直连 / 🐟 漏网之鱼 | 直连/兜底 |

## 📄 License

配置文件遵循原项目协议。镜像仅供个人使用。
