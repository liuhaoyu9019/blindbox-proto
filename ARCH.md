# 盲盒抽卡应用 — 系统架构设计与 API 契约

> 版本：v1.0  
> 状态：待开发  
> 原型：https://liuhaoyu9019.github.io/blindbox-proto/

---

## 目录

- [一、系统架构设计](#一系统架构设计)
  - [整体架构](#11-整体架构)
  - [模块划分与交互关系](#12-模块划分与交互关系)
  - [技术栈清单](#13-技术栈清单)
  - [目录结构](#14-目录结构)
  - [数据流：用户抽卡流程](#15-数据流用户抽卡流程)
  - [部署方案](#16-部署方案)
- [二、API 契约](#二api-契约)
  - [通用约定](#21-通用约定)
  - [管理后台 API](#22-管理后台-api)
  - [前端 API](#23-前端-api)

---

# 一、系统架构设计

## 1.1 整体架构

```
┌─────────────────────────────────────────────────────────────┐
│                         客户端层                             │
│  ┌─────────────────────┐  ┌──────────────────────────────┐  │
│  │  用户前端 (Vue 3)    │  │  管理后台 (Vue 3)            │  │
│  │  端口 :3000          │  │  端口 :3001                  │  │
│  │  5 页面               │  │  系列/卡片/用户管理          │  │
│  └─────────┬───────────┘  └──────────┬───────────────────┘  │
└────────────┼──────────────────────────┼──────────────────────┘
             │                          │
             │  HTTP /api/v1/*          │  HTTP /api/admin/*
             │                          │
┌────────────▼──────────────────────────▼──────────────────────┐
│                     反向代理 / API 网关                       │
│              Nginx (Docker, 端口 :80)                        │
│                                                              │
│  /api/v1/*    →  后端服务 (负载均衡/直连)                       │
│  /api/admin/* →  后端服务                                     │
│  /*           →  静态文件 (前端 SPA)                           │
└──────────────────────────┬───────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────────┐
│                      后端服务 (NestJS)                        │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │                    Controller 层                       │   │
│  │  SeriesCtrl │ DrawCtrl │ CollectionCtrl │ ShareCtrl  │   │
│  │  AdminSeriesCtrl │ AdminItemCtrl │ AdminUserCtrl    │   │
│  └──────────────────────┬───────────────────────────────┘   │
│                          │                                    │
│  ┌──────────────────────▼───────────────────────────────┐   │
│  │                    Service 层                         │   │
│  │  SeriesSvc │ DrawSvc │ CollectionSvc │ ShareSvc      │   │
│  │  AdminSeriesSvc │ AdminItemSvc │ AdminUserSvc       │   │
│  └──────────────────────┬───────────────────────────────┘   │
│                          │                                    │
│  ┌──────────────────────▼───────────────────────────────┐   │
│  │                    Prisma ORM                         │   │
│  │              PostgreSQL Connection                    │   │
│  └──────────────────────┬───────────────────────────────┘   │
└──────────────────────────┼───────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────────┐
│                         PostgreSQL                            │
│                    端口 :5432                                 │
│  ┌───────────────┐  ┌───────────────┐  ┌────────────────┐   │
│  │   series      │  │    items      │  │   collections  │   │
│  ├───────────────┤  ├───────────────┤  ├────────────────┤   │
│  │   id          │  │   id          │  │   id           │   │
│  │   name        │  │   serie_id    │  │   user_id      │   │
│  │   emoji       │──│   name        │  │   card_id      │   │
│  │   desc        │  │   subtitle    │  │   acquired_at  │   │
│  │   total_cards │  │   emoji       │  │   count        │   │
│  │   created_at  │  │   rarity      │──└────────────────┘   │
│  │   updated_at  │  │   image_url   │                       │
│  └───────────────┘  │   desc        │   ┌────────────────┐   │
│                      │   series_idx │   │   share_records│   │
│                      │   created_at │   ├────────────────┤   │
│                      │   updated_at │   │   id           │   │
│                      └───────────────┘   │   user_id     │   │
│  ┌───────────────┐  ┌───────────────┐   │   card_id     │   │
│  │   users       │  │   admins      │   │   created_at   │   │
│  ├───────────────┤  ├───────────────┤   │   platform    │   │
│  │   id          │  │   id          │   └────────────────┘   │
│  │   nickname    │  │   username    │                        │
│  │   avatar_url  │  │   password    │                        │
│  │   is_banned   │  │   avatar      │                        │
│  │   created_at  │  │   created_at  │                        │
│  │   updated_at  │  └───────────────┘                        │
│  └───────────────┘                                          │
└──────────────────────────────────────────────────────────────┘
```

## 1.2 模块划分与交互关系

### 三大子系统

| 子系统 | 技术栈 | 职责 |
|--------|--------|------|
| **用户前端** | Vue 3 + Vite + Vue Router + Pinia | 5 个页面：首页/抽卡/结果/收藏/分享 |
| **管理后台** | Vue 3 + Vite + Element Plus | 系列管理、卡片管理、用户管理、数据统计 |
| **后端 API** | NestJS + Prisma + PostgreSQL | 统一 API 服务，业务逻辑、数据持久化 |

### 模块交互

```
用户浏览器 ──HTTP──→ Nginx ──proxy──→ NestJS ──Prisma──→ PostgreSQL
                      │
                      └── 静态 SPA (index.html + assets)
```

- **Nginx** 承担单入口角色：静态 SPA 由 Nginx 直接 serve，API 请求反向代理到后端
- **前端和后端** 通过 RESTful JSON API 通信
- **用户鉴权**：前端 → Bearer Token (JWT)，管理后台 → Session/Cookie (JWT)
- **管理后台和后端** 共用同一个 NestJS 进程，通过路由前缀 `/api/admin/*` 区分

## 1.3 技术栈清单

### 用户前端

| 技术/库 | 版本 | 用途 |
|---------|------|------|
| Vue | ^3.5 | 前端框架 |
| Vite | ^6.x | 构建工具 |
| Vue Router | ^4.x | 路由管理 |
| Pinia | ^2.x | 状态管理 |
| TypeScript | ^5.x | 类型安全 |
| Axios | ^1.x | HTTP 请求 |
| CSS Modules | — | 样式方案 |
| html2canvas | ^1.4 | 卡片转图片（分享页） |
| node-fetch / 原生 | — | Web Share API |

### 管理后台

| 技术/库 | 版本 | 用途 |
|---------|------|------|
| Vue | ^3.5 | 前端框架 |
| Vite | ^6.x | 构建工具 |
| Vue Router | ^4.x | 路由管理 |
| Pinia | ^2.x | 状态管理 |
| Element Plus | ^2.x | UI 组件库 |
| TypeScript | ^5.x | 类型安全 |
| Axios | ^1.x | HTTP 请求 |
| ECharts / Chart.js | — | 统计图表 |

### 后端 API

| 技术/库 | 版本 | 用途 |
|---------|------|------|
| NestJS | ^10.x | Node.js 服务端框架 |
| TypeScript | ^5.x | 类型安全 |
| Prisma | ^6.x | ORM + 数据库迁移 |
| PostgreSQL | ^16 | 关系数据库 |
| JWT (nestjs/jwt) | — | 身份认证 |
| Passport (nestjs/passport) | — | 鉴权守卫 |
| class-validator | — | DTO 校验 |
| class-transformer | — | 请求/响应序列化 |
| multer | — | 文件上传 |
| bcrypt | — | 密码哈希 |

### 部署

| 技术 | 版本 | 用途 |
|------|------|------|
| Docker | 24+ | 容器运行时 |
| Docker Compose | v2 | 容器编排 |
| Nginx | 1.25+ | 反向代理 + 静态文件服务 |
| Node.js | 20 LTS | 后端运行环境 |

## 1.4 目录结构

### 用户前端 (`user-web/`)

```
user-web/
├── public/
│   ├── favicon.svg
│   └── og-image.png
├── src/
│   ├── api/                    # API 请求封装
│   │   ├── request.ts          # Axios 实例 + 拦截器
│   │   ├── series.ts           # 系列相关 API
│   │   ├── draw.ts             # 抽卡相关 API
│   │   ├── collection.ts       # 收藏相关 API
│   │   └── share.ts            # 分享相关 API
│   ├── assets/                 # 静态资源
│   │   ├── images/
│   │   └── styles/
│   │       ├── variables.css   # CSS 变量 (配色等)
│   │       └── global.css      # 全局样式
│   ├── components/             # 公共组件
│   │   ├── NavBar.vue
│   │   ├── Toast.vue
│   │   └── LoadingSkeleton.vue
│   ├── composables/            # 组合式函数
│   │   ├── useDraw.ts          # 抽卡逻辑
│   │   └── useCollection.ts    # 收藏管理
│   ├── pages/                  # 页面级组件
│   │   ├── HomePage.vue        # 首页 - 系列列表
│   │   ├── DrawPage.vue        # 抽卡页 - 3D 盒子
│   │   ├── ResultPage.vue      # 抽卡结果页
│   │   ├── CollectionPage.vue  # 收藏页
│   │   └── SharePage.vue       # 分享页
│   ├── router/
│   │   └── index.ts            # 路由配置
│   ├── stores/
│   │   ├── series.ts           # Pinia store - 系列
│   │   ├── user.ts             # Pinia store - 用户
│   │   └── collection.ts       # Pinia store - 收藏
│   ├── types/                  # TypeScript 类型定义
│   │   └── index.ts
│   ├── utils/                  # 工具函数
│   │   ├── rarity.ts
│   │   └── share.ts
│   ├── App.vue
│   └── main.ts
├── index.html
├── package.json
├── tsconfig.json
├── tsconfig.node.json
└── vite.config.ts
```

### 管理后台 (`admin-web/`)

```
admin-web/
├── public/
│   └── favicon.svg
├── src/
│   ├── api/                    # API 请求封装
│   │   ├── request.ts
│   │   ├── auth.ts
│   │   ├── series.ts
│   │   ├── items.ts
│   │   ├── users.ts
│   │   └── stats.ts
│   ├── components/             # 公共组件
│   │   ├── Pagination.vue
│   │   ├── ImageUploader.vue
│   │   └── RarityBadge.vue
│   ├── layouts/
│   │   ├── AdminLayout.vue     # 后台主布局 (侧边栏 + header)
│   │   └── LoginLayout.vue     # 登录页布局
│   ├── views/                  # 页面
│   │   ├── Login.vue           # 登录
│   │   ├── Dashboard.vue       # 数据总览
│   │   ├── SeriesList.vue      # 系列列表
│   │   ├── SeriesForm.vue      # 系列创建/编辑
│   │   ├── ItemList.vue        # 卡片列表 (系列下)
│   │   ├── ItemForm.vue        # 卡片创建/编辑
│   │   ├── UserList.vue        # 用户列表
│   │   └── UserDetail.vue      # 用户详情
│   ├── router/
│   │   └── index.ts
│   ├── stores/
│   │   ├── auth.ts             # 登录状态
│   │   └── app.ts              # 全局状态
│   ├── types/
│   │   └── index.ts
│   ├── App.vue
│   └── main.ts
├── index.html
├── package.json
├── tsconfig.json
├── tsconfig.node.json
└── vite.config.ts
```

### 后端 API (`backend/`)

```
backend/
├── prisma/
│   ├── schema.prisma           # 数据库 schema
│   └── seed.ts                 # 种子数据
├── src/
│   ├── main.ts                 # 应用入口
│   ├── app.module.ts           # 根模块
│   ├── common/                 # 公共模块
│   │   ├── decorators/
│   │   │   ├── current-user.decorator.ts
│   │   │   └── roles.decorator.ts
│   │   ├── guards/
│   │   │   ├── jwt-auth.guard.ts
│   │   │   └── roles.guard.ts
│   │   ├── filters/
│   │   │   └── http-exception.filter.ts
│   │   ├── interceptors/
│   │   │   └── transform.interceptor.ts
│   │   └── dto/
│   │       └── pagination.dto.ts
│   ├── modules/
│   │   ├── admin/
│   │   │   ├── auth/
│   │   │   │   ├── admin-auth.module.ts
│   │   │   │   ├── admin-auth.controller.ts
│   │   │   │   ├── admin-auth.service.ts
│   │   │   │   ├── dto/
│   │   │   │   │   └── login.dto.ts
│   │   │   │   └── strategies/
│   │   │   │       └── jwt.strategy.ts
│   │   │   ├── series/
│   │   │   │   ├── admin-series.module.ts
│   │   │   │   ├── admin-series.controller.ts
│   │   │   │   ├── admin-series.service.ts
│   │   │   │   └── dto/
│   │   │   │       ├── create-series.dto.ts
│   │   │   │       └── update-series.dto.ts
│   │   │   ├── items/
│   │   │   │   ├── admin-items.module.ts
│   │   │   │   ├── admin-items.controller.ts
│   │   │   │   ├── admin-items.service.ts
│   │   │   │   └── dto/
│   │   │   │       ├── create-item.dto.ts
│   │   │   │       └── update-item.dto.ts
│   │   │   ├── users/
│   │   │   │   ├── admin-users.module.ts
│   │   │   │   ├── admin-users.controller.ts
│   │   │   │   ├── admin-users.service.ts
│   │   │   │   └── dto/
│   │   │   │       └── ban-user.dto.ts
│   │   │   └── stats/
│   │   │       ├── admin-stats.module.ts
│   │   │       ├── admin-stats.controller.ts
│   │   │       └── admin-stats.service.ts
│   │   └── v1/                 # 前端 API (v1)
│   │       ├── series/
│   │       │   ├── series.module.ts
│   │       │   ├── series.controller.ts
│   │       │   └── series.service.ts
│   │       ├── draw/
│   │       │   ├── draw.module.ts
│   │       │   ├── draw.controller.ts
│   │       │   ├── draw.service.ts
│   │       │   └── dto/
│   │       │       └── execute-draw.dto.ts
│   │       ├── collections/
│   │       │   ├── collection.module.ts
│   │       │   ├── collection.controller.ts
│   │       │   ├── collection.service.ts
│   │       │   └── dto/
│   │       │       └── check-collection.dto.ts
│   │       └── share/
│   │           ├── share.module.ts
│   │           ├── share.controller.ts
│   │           ├── share.service.ts
│   │           └── dto/
│   │               └── create-share.dto.ts
│   └── uploads/                # 上传文件存储目录
├── uploads/                    # 运行时上传目录（Docker volume）
├── test/
│   ├── app.e2e-spec.ts
│   └── jest-e2e.json
├── Dockerfile
├── .env
├── .env.example
├── nest-cli.json
├── package.json
├── tsconfig.json
├── tsconfig.build.json
└── wait-for-it.sh              # 等待 PostgreSQL 就绪
```

## 1.5 数据流：用户抽卡流程

```
┌─────────┐    ┌──────────┐    ┌──────────┐    ┌──────────────┐    ┌───────────┐
│ 用户浏览器 │    │  Nginx   │    │ NestJS   │    │   Prisma     │    │ PostgreSQL│
└────┬────┘    └────┬─────┘    └────┬─────┘    └──────┬───────┘    └─────┬─────┘
     │               │               │                  │                 │
     │ 1. GET /api/v1/series        │                  │                 │
     │──────────────>│──────────────>│                  │                 │
     │               │               │  2. findMany()   │                 │
     │               │               │─────────────────>│                 │
     │               │               │                  │ 3. SQL Query   │
     │               │               │                  │────────────────>│
     │               │               │                  │<────────────────│
     │               │               │<─────────────────│                 │
     │             系列列表 JSON     │                  │                 │
     │<──────────────│<──────────────│                  │                 │
     │               │               │                  │                 │
     │ 4. 用户选择系列，点击抽卡      │                  │                 │
     │─────────────── 前端导航 ──────│                  │                 │
     │               │               │                  │                 │
     │ 5. POST /api/v1/draw/execute  │                  │                 │
     │    { serieId: "xxx" }        │                  │                 │
     │──────────────>│──────────────>│                  │                 │
     │               │               │ 6. 概率计算      │                 │
     │               │               │    · 查询保底状态 │                 │
     │               │               │    · 随机生成结果 │                 │
     │               │               │                  │                 │
     │               │               │ 7. upsert        │                 │
     │               │               │    collection    │                 │
     │               │               │─────────────────>│────────────────>│
     │               │               │<─────────────────│<────────────────│
     │               │               │                  │                 │
     │               │               │ 8. 更新 draw_counter            │
     │               │               │─────────────────>│────────────────>│
     │               │               │<─────────────────│<────────────────│
     │               │               │                  │                 │
     │             抽卡结果 JSON      │                  │                 │
     │<──────────────│<──────────────│                  │                 │
     │               │               │                  │                 │
     │ 9. 开盒动画 (2.5s)           │                  │                 │
     │    CSS 3D animation          │                  │                 │
     │               │               │                  │                 │
     │ 10. 自动跳转结果页            │                  │                 │
     │    结果显示卡片详细信息        │                  │                 │
     │               │               │                  │                 │
     │ 11. 用户点击"分享"            │                  │                 │
     │    POST /api/v1/share        │                  │                 │
     │    { cardId, platform }      │                  │                 │
     │──────────────>│──────────────>│                  │                 │
     │               │               │ 12. create       │                 │
     │               │               │─────────────────>│────────────────>│
     │               │               │<─────────────────│<────────────────│
     │               │               │                  │                 │
     │             分享记录确认       │                  │                 │
     │<──────────────│<──────────────│                  │                 │
     │               │               │                  │                 │
```

### 用户注册/登录流程

```
┌─────────┐    ┌──────────┐    ┌──────────┐    ┌──────────────┐    ┌───────────┐
│ 用户浏览器 │    │  Nginx   │    │ NestJS   │    │   Prisma     │    │ PostgreSQL│
└────┬────┘    └────┬─────┘    └────┬─────┘    └──────┬───────┘    └─────┬─────┘
     │               │               │                  │                 │
     │ 1. POST /api/v1/auth/register │                  │                 │
     │    { nickname }              │                  │                 │
     │──────────────>│──────────────>│                  │                 │
     │               │               │ 2. create user   │                 │
     │               │               │─────────────────>│────────────────>│
     │               │               │<─────────────────│<────────────────│
     │               │               │                  │                 │
     │             201 { token, user }│                 │                 │
     │<──────────────│<──────────────│                  │                 │
     │               │               │                  │                 │
     │ 3. 后续请求携带               │                  │                 │
     │    Authorization: Bearer xxx  │                  │                 │
     │──────────────>│──────────────>│                  │                 │
     │               │               │ 4. JWT verify    │                 │
     │               │               │    → user_id     │                 │
     │               │               │                  │                 │
```

### 管理后台抽卡概率配置流程（未来扩展）

```
管理浏览器 ──→ Nginx ──→ NestJS ──→ Prisma ──→ PostgreSQL
    │                    │
    │ PUT /api/admin/    │
    │ series/:id/rates   │
    │ { common, rare,    │
    │   epic, legend,    │
    │   secret: n }      │
```

## 1.6 部署方案

### Docker Compose 编排

```yaml
version: "3.8"

services:
  # PostgreSQL 数据库
  postgres:
    image: postgres:16-alpine
    container_name: blindbox-postgres
    restart: unless-stopped
    volumes:
      - postgres_data:/var/lib/postgresql/data
    environment:
      POSTGRES_DB: blindbox
      POSTGRES_USER: blindbox
      POSTGRES_PASSWORD: ${DB_PASSWORD:-blindbox_secret}
    ports:
      - "5432:5432"
    networks:
      - blindbox-net
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U blindbox"]
      interval: 10s
      timeout: 5s
      retries: 5

  # 后端 API 服务
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: blindbox-backend
    restart: unless-stopped
    depends_on:
      postgres:
        condition: service_healthy
    environment:
      NODE_ENV: production
      DATABASE_URL: postgresql://blindbox:${DB_PASSWORD:-blindbox_secret}@postgres:5432/blindbox
      JWT_SECRET: ${JWT_SECRET:-your-secret-key-change-in-production}
      PORT: 3000
    volumes:
      - uploads:/app/uploads
    ports:
      - "3000:3000"
    networks:
      - blindbox-net
    command: >
      sh -c "./wait-for-it.sh postgres:5432 -- 
      npx prisma migrate deploy && 
      npx prisma db seed && 
      node dist/main"

  # Nginx 反向代理（前端静态 + API 代理）
  nginx:
    image: nginx:1.25-alpine
    container_name: blindbox-nginx
    restart: unless-stopped
    depends_on:
      - backend
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/conf.d/default.conf
      # 前端构建产物挂载
      - ./user-web/dist:/usr/share/nginx/html/user
      - ./admin-web/dist:/usr/share/nginx/html/admin
    ports:
      - "80:80"
    networks:
      - blindbox-net

networks:
  blindbox-net:
    driver: bridge

volumes:
  postgres_data:
  uploads:
```

### Nginx 配置

```nginx
# nginx/nginx.conf
server {
    listen 80;
    server_name _;
    charset utf-8;

    # 用户前端
    location / {
        root /usr/share/nginx/html/user;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # 管理后台
    location /admin {
        alias /usr/share/nginx/html/admin;
        index index.html;
        try_files $uri $uri/ /admin/index.html;

        # 修复子路径下的资源加载
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff2?)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # 后端 API
    location /api/ {
        proxy_pass http://backend:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        # 上传文件大小限制
        client_max_body_size 10m;
    }

    # 上传文件静态访问
    location /uploads/ {
        proxy_pass http://backend:3000/uploads/;
        proxy_set_header Host $host;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
```

### 后端 Dockerfile

```dockerfile
# backend/Dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx prisma generate
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
RUN apk add --no-cache bash
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/wait-for-it.sh ./
RUN chmod +x wait-for-it.sh

EXPOSE 3000
CMD ["node", "dist/main"]
```

### 构建与启动脚本

```bash
#!/bin/bash
# build-and-deploy.sh

# 1. 构建用户前端
cd user-web && npm ci && npm run build && cd ..

# 2. 构建管理后台
cd admin-web && npm ci && npm run build && cd ..

# 3. 启动所有服务
docker compose up -d --build
```

---

# 二、API 契约

## 2.1 通用约定

### 基础 URL

| 环境 | 前端 API | 管理后台 API |
|------|----------|-------------|
| 开发 | `http://localhost:3000/api/v1` | `http://localhost:3000/api/admin` |
| 生产 | `https://your-domain.com/api/v1` | `https://your-domain.com/api/admin` |

### 请求头

```http
Content-Type: application/json
Authorization: Bearer <token>  # 需要鉴权的接口
```

### 通用响应格式

```typescript
// 成功响应
interface ApiSuccess<T = unknown> {
  code: number;        // 业务状态码，200 表示成功
  message: string;     // 提示信息
  data: T;             // 返回数据
}

// 分页响应
interface PaginatedData<T = unknown> {
  items: T[];          // 当前页数据
  total: number;       // 总数
  page: number;        // 当前页码 (1-based)
  pageSize: number;    // 每页条数
  totalPages: number;  // 总页数
}

// 错误响应
interface ApiError {
  code: number;        // 业务错误码
  message: string;     // 错误描述
  errors?: Record<string, string[]>;  // 字段级错误
}
```

### HTTP 状态码与业务错误码

| HTTP 状态码 | 业务错误码 | 说明 |
|-------------|-----------|------|
| 200 | 200 | 成功 |
| 201 | 201 | 创建成功 |
| 400 | 4000 | 请求参数校验失败 |
| 401 | 4010 | 未登录或 Token 失效 |
| 401 | 4011 | 登录凭证错误（用户名/密码错误） |
| 403 | 4030 | 无权限访问 |
| 404 | 4040 | 资源不存在 |
| 409 | 4090 | 资源冲突（如重复创建） |
| 413 | 4130 | 上传文件过大 |
| 429 | 4290 | 请求频率过高 |
| 500 | 5000 | 服务器内部错误 |

### 公共类型定义

```typescript
// 稀有度枚举
type Rarity = 'common' | 'rare' | 'epic' | 'legendary' | 'secret';

// 系列
interface Series {
  id: string;
  name: string;
  emoji: string;
  description: string;
  totalCards: number;
  createdAt: string;   // ISO 8601
  updatedAt: string;   // ISO 8601
}

// 卡片
interface Item {
  id: string;
  serieId: string;
  name: string;
  subtitle: string | null;
  emoji: string;
  rarity: Rarity;
  imageUrl: string | null;
  description: string | null;
  seriesIndex: number;
  createdAt: string;
  updatedAt: string;
}

// 用户
interface User {
  id: string;
  nickname: string;
  avatarUrl: string | null;
  isBanned: boolean;
  createdAt: string;
  updatedAt: string;
}
```

---

## 2.2 管理后台 API

> **鉴权要求**：除 `/api/admin/auth/login` 外，所有管理后台 API 需在请求头携带 `Authorization: Bearer <token>`。
> 若 Token 无效或过期，返回 401。

---

### 2.2.1 管理员登录

**POST** `/api/admin/auth/login`

#### Request Body

```typescript
interface AdminLoginRequest {
  username: string;     // 管理员用户名
  password: string;     // 管理员密码
}
```

#### Response Body

```typescript
interface AdminLoginResponse {
  token: string;        // JWT token
  admin: {
    id: string;
    username: string;
    avatar: string | null;
  };
}
```

#### 错误码

| HTTP | 业务码 | 场景 |
|------|--------|------|
| 401 | 4011 | 用户名或密码错误 |
| 400 | 4000 | 参数校验失败 |

---

### 2.2.2 系列列表（分页）

**GET** `/api/admin/series`

#### Query Parameters

```typescript
interface AdminSeriesListQuery {
  page?: number;        // 页码，默认 1
  pageSize?: number;    // 每页条数，默认 20，最大 100
  keyword?: string;     // 名称模糊搜索（可选）
  sortBy?: 'name' | 'createdAt';      // 排序字段，默认 createdAt
  sortOrder?: 'asc' | 'desc';         // 排序方向，默认 desc
}
```

#### Response Body

```typescript
type AdminSeriesListResponse = PaginatedData<{
  id: string;
  name: string;
  emoji: string;
  description: string;
  totalCards: number;
  itemCount: number;        // 实际卡片数量
  createdAt: string;
  updatedAt: string;
}>;
```

---

### 2.2.3 创建系列

**POST** `/api/admin/series`

#### Request Body

```typescript
interface CreateSeriesRequest {
  name: string;               // 系列名称，1-50 字符
  emoji: string;              // 封面 emoji，单个 emoji
  description: string;        // 系列简介，0-500 字符
}
```

#### Response Body

```typescript
type CreateSeriesResponse = Series;
```

#### 错误码

| HTTP | 业务码 | 场景 |
|------|--------|------|
| 400 | 4000 | 参数校验失败（名称过长/emoji无效等） |
| 409 | 4090 | 系列名称已存在 |

---

### 2.2.4 编辑系列

**PUT** `/api/admin/series/:id`

#### Request Body

```typescript
interface UpdateSeriesRequest {
  name?: string;               // 系列名称，1-50 字符
  emoji?: string;              // 封面 emoji，单个 emoji
  description?: string;        // 系列简介，0-500 字符
}
```

#### Response Body

```typescript
type UpdateSeriesResponse = Series;
```

---

### 2.2.5 删除系列

**DELETE** `/api/admin/series/:id`

#### Response Body

```typescript
interface DeleteResponse {
  success: true;
}
```

#### 错误码

| HTTP | 业务码 | 场景 |
|------|--------|------|
| 404 | 4040 | 系列不存在 |
| 409 | 4090 | 系列下仍有卡片，无法删除 |

---

### 2.2.6 系列下卡片列表

**GET** `/api/admin/series/:id/items`

#### Query Parameters

```typescript
interface AdminItemListQuery {
  page?: number;        // 页码，默认 1
  pageSize?: number;    // 每页条数，默认 50，最大 200
  rarity?: Rarity;      // 按稀有度过滤（可选）
  keyword?: string;     // 名称模糊搜索（可选）
}
```

#### Response Body

```typescript
type AdminItemListResponse = PaginatedData<Item>;
```

---

### 2.2.7 创建卡片

**POST** `/api/admin/items`

#### Request Body

```typescript
interface CreateItemRequest {
  serieId: string;         // 所属系列 ID
  name: string;            // 卡片名称，1-50 字符
  subtitle?: string;       // 副标题/变体，0-50 字符
  emoji: string;           // 展示 emoji
  rarity: Rarity;          // 稀有度
  imageUrl?: string;       // 图片 URL（可先上传图片获取）
  description?: string;    // 卡片故事/介绍，0-1000 字符
  seriesIndex: number;     // 在该系列中的编号（1-based）
}
```

#### Response Body

```typescript
type CreateItemResponse = Item;
```

#### 错误码

| HTTP | 业务码 | 场景 |
|------|--------|------|
| 400 | 4000 | 参数校验失败 |
| 404 | 4040 | 系列不存在 |
| 409 | 4090 | 该系列下已有相同 seriesIndex 的卡片 |

---

### 2.2.8 编辑卡片

**PUT** `/api/admin/items/:id`

#### Request Body

```typescript
interface UpdateItemRequest {
  name?: string;            // 卡片名称，1-50 字符
  subtitle?: string;        // 副标题/变体
  emoji?: string;           // 展示 emoji
  rarity?: Rarity;          // 稀有度
  imageUrl?: string;        // 图片 URL
  description?: string;     // 卡片故事/介绍
  seriesIndex?: number;     // 在该系列中的编号
}
```

#### Response Body

```typescript
type UpdateItemResponse = Item;
```

#### 错误码

| HTTP | 业务码 | 场景 |
|------|--------|------|
| 400 | 4000 | 参数校验失败 |
| 404 | 4040 | 卡片不存在 |

---

### 2.2.9 删除卡片

**DELETE** `/api/admin/items/:id`

#### Response Body

```typescript
interface DeleteResponse {
  success: true;
}
```

#### 错误码

| HTTP | 业务码 | 场景 |
|------|--------|------|
| 404 | 4040 | 卡片不存在 |

---

### 2.2.10 图片上传

**POST** `/api/admin/items/upload-image`

#### Request

- Content-Type: `multipart/form-data`
- Field name: `file`
- 支持格式: `image/jpeg`, `image/png`, `image/webp`, `image/gif`
- 最大大小: 5MB

#### Response Body

```typescript
interface UploadImageResponse {
  url: string;           // 可访问的图片 URL
  filename: string;      // 文件名
  size: number;          // 文件大小（字节）
  mimeType: string;      // MIME 类型
}
```

#### 错误码

| HTTP | 业务码 | 场景 |
|------|--------|------|
| 400 | 4000 | 文件类型不支持 |
| 413 | 4130 | 文件超过 5MB |

---

### 2.2.11 用户列表

**GET** `/api/admin/users`

#### Query Parameters

```typescript
interface AdminUserListQuery {
  page?: number;         // 页码，默认 1
  pageSize?: number;     // 每页条数，默认 20，最大 100
  keyword?: string;      // 昵称模糊搜索（可选）
  isBanned?: boolean;    // 是否封禁筛选（可选）
  sortBy?: 'nickname' | 'createdAt' | 'drawCount';
  sortOrder?: 'asc' | 'desc';
}
```

#### Response Body

```typescript
type AdminUserListResponse = PaginatedData<{
  id: string;
  nickname: string;
  avatarUrl: string | null;
  isBanned: boolean;
  drawCount: number;           // 总抽卡次数
  collectionCount: number;     // 已收藏卡片数（去重）
  createdAt: string;
  updatedAt: string;
}>;
```

---

### 2.2.12 用户详情

**GET** `/api/admin/users/:id`

#### Error Codes

| HTTP | 业务码 | 场景 |
|------|--------|------|
| 404 | 4040 | 用户不存在 |

#### Response Body

```typescript
interface AdminUserDetailResponse {
  user: {
    id: string;
    nickname: string;
    avatarUrl: string | null;
    isBanned: boolean;
    createdAt: string;
    updatedAt: string;
  };
  stats: {
    totalDraws: number;           // 总抽卡次数
    uniqueCards: number;          // 已收集不同卡片数
    totalCards: number;           // 所有系列卡总数
    totalDuplicates: number;      // 重复卡片总数
    rarityDistribution: Record<Rarity, number>;  // 各稀有度拥有数
  };
  recentDraws: Array<{
    item: Item;
    drawnAt: string;
  }>;
  collections: Array<{
    item: Item;
    count: number;
    acquiredAt: string;
  }>;
}
```

---

### 2.2.13 封禁/解封用户

**PATCH** `/api/admin/users/:id/ban`

#### Request Body

```typescript
interface BanUserRequest {
  isBanned: boolean;     // true: 封禁, false: 解封
  reason?: string;       // 封禁原因（封禁时必填，0-200 字符）
}
```

#### Response Body

```typescript
interface BanUserResponse {
  id: string;
  isBanned: boolean;
  bannedAt: string | null;      // 封禁时间
  banReason: string | null;     // 封禁原因
}
```

#### 错误码

| HTTP | 业务码 | 场景 |
|------|--------|------|
| 400 | 4000 | 封禁时未提供原因 |
| 404 | 4040 | 用户不存在 |

---

### 2.2.14 后台统计数据总览

**GET** `/api/admin/stats`

#### Response Body

```typescript
interface AdminStatsResponse {
  overview: {
    totalUsers: number;            // 总用户数
    todayNewUsers: number;         // 今日新增用户
    totalDraws: number;            // 总抽卡次数
    todayDraws: number;            // 今日抽卡次数
    totalSeries: number;           // 系列总数
    totalItems: number;            // 卡片总数
    todayShares: number;           // 今日分享次数
  };
  rarityDistribution: {
    rarity: Rarity;
    count: number;
  }[];                          // 各稀有度卡片总数分布
  topSeries: Array<{
    id: string;
    name: string;
    drawCount: number;            // 该系列抽卡次数
    collectionRate: number;       // 该系列收集率（已收集用户占比）
  }>;                           // 热门系列 Top 10
  recentActivities: Array<{
    type: 'draw' | 'register' | 'share';
    user: { id: string; nickname: string };
    detail: string;
    timestamp: string;
  }>;                           // 最近动态
}
```

#### 说明

- `topSeries` 按抽卡次数降序排列，最多返回 10 条
- `recentActivities` 返回最近 20 条动态，按时间降序

---

## 2.3 前端 API（用户端）

> **鉴权要求**：部分接口需要用户登录 Token（在 Request 中以字段或 Header 传入）。
> MVP 阶段可通过 `Authorization: Bearer <anonymous-token>` 或请求体中的 `userId` 字段进行简单标识。

---

### 2.3.1 系列列表（前端展示）

**GET** `/api/v1/series`

#### Query Parameters

```typescript
interface SeriesListQuery {
  page?: number;         // 页码，默认 1
  pageSize?: number;     // 每页条数，默认 20
}
```

#### Response Body

```typescript
type SeriesListResponse = PaginatedData<Series>;
```

#### 说明

- 返回所有上架的系列（isActive: true）
- 不包含系列下卡片详细信息，仅基础信息 + totalCards 数量

---

### 2.3.2 系列详情（含卡片列表）

**GET** `/api/v1/series/:id`

#### Response Body

```typescript
interface SeriesDetailResponse {
  series: Series & {
    items: Item[];       // 该系列下的所有卡片
  };
  userProgress?: {       // 登录后才返回
    collectedCount: number;      // 已收集数
    drawCount: number;           // 已抽次数
  };
}
```

#### 错误码

| HTTP | 业务码 | 场景 |
|------|--------|------|
| 404 | 4040 | 系列不存在或已下架 |

---

### 2.3.3 执行抽卡

**POST** `/api/v1/draw/execute`

#### Request Body

```typescript
interface ExecuteDrawRequest {
  serieId: string;        // 系列 ID
}
```

#### Response Body

```typescript
interface ExecuteDrawResponse {
  result: {
    item: Item;
    isNew: boolean;               // 是否为新收集（之前未拥有）
    isDuplicate: boolean;         // 是否是重复
    duplicateCount: number;       // 该卡已有数量（含本次）
  };
  progress: {
    seriesId: string;
    collectedCount: number;       // 该系列已收集数
    totalCount: number;           // 该系列总卡数
    drawCount: number;            // 该系列已抽数（保底计数）
    pityCount: number;            // 距保底还需抽几次
  };
}
```

#### 错误码

| HTTP | 业务码 | 场景 |
|------|--------|------|
| 400 | 4000 | 参数校验失败 |
| 404 | 4040 | 系列不存在 |
| 402 | 4020 | 余额不足（付费体系上线后） |

#### 抽卡算法说明（后端实现）

```typescript
function drawRarity(drawCount: number): Rarity {
  // 1. 硬保底：60 抽未出 Legendary → 强制出
  if (drawCount >= 60) return 'legendary';

  // 2. 软保底：40 抽后 Legendary 概率递增（每抽 +3%）
  const baseRates = { common: 0.55, rare: 0.25, epic: 0.12, legendary: 0.07, secret: 0.01 };
  if (drawCount > 40) {
    const bonus = (drawCount - 40) * 0.03;
    baseRates.legendary += bonus;
    // 从 Common 中扣除
    baseRates.common = Math.max(0, baseRates.common - bonus);
  }

  // 3. 随机选择
  const rand = Math.random();
  let cumulative = 0;
  for (const [rarity, rate] of Object.entries(baseRates)) {
    cumulative += rate;
    if (rand < cumulative) return rarity as Rarity;
  }
  return 'common';
}
```

- Secret 保底：始终 1%，不纳入保底计算
- 连续 3 张相同 Common 时，下张 Common 权重转移到 Rare+

---

### 2.3.4 用户收藏列表

**GET** `/api/v1/collections`

#### Query Parameters

```typescript
interface CollectionListQuery {
  page?: number;            // 页码，默认 1
  pageSize?: number;        // 每页条数，默认 50
  serieId?: string;         // 按系列筛选（可选）
  rarity?: Rarity;          // 按稀有度筛选（可选）
  isCollected?: boolean;    // true: 已收集, false: 未收集（可选）
}
```

#### Response Body

```typescript
interface CollectionListResponse {
  items: Array<{
    item: Item;
    count: number;              // 拥有数量（重复计）
    acquiredAt: string;         // 首次获取时间
    isCollected: boolean;       // 是否已收集
  }>;
  stats: {
    totalCards: number;         // 所有系列总卡数
    collectedCards: number;     // 已收集数量
    collectionRate: number;     // 收集率（百分比）
    rarityDistribution: Record<Rarity, { owned: number; total: number }>;
  };
}
```

---

### 2.3.5 检查是否已拥有

**POST** `/api/v1/collections/check`

#### Request Body

```typescript
interface CheckCollectionRequest {
  cardIds: string[];        // 要检查的卡片 ID 列表（最多 50 个）
}
```

#### Response Body

```typescript
interface CheckCollectionResponse {
  results: Record<string, {
    isCollected: boolean;
    count: number;            // 拥有数量
  }>;                       // key 为 cardId
}
```

#### 错误码

| HTTP | 业务码 | 场景 |
|------|--------|------|
| 400 | 4000 | cardIds 数量超过 50 |

---

### 2.3.6 创建分享记录

**POST** `/api/v1/share`

#### Request Body

```typescript
interface CreateShareRequest {
  cardId: string;              // 分享的卡片 ID
  platform?: string;           // 分享平台（可选）：'wechat' | 'weibo' | 'twitter' | 'other'
}
```

#### Response Body

```typescript
interface CreateShareResponse {
  id: string;
  shareUrl: string;              // 分享链接（可用于 OG 预览）
  createdAt: string;
}
```

#### 错误码

| HTTP | 业务码 | 场景 |
|------|--------|------|
| 400 | 4000 | 参数校验失败 |
| 404 | 4040 | 卡片不存在 |

---

## 附录

### A. Prisma Schema

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// 系列
model Series {
  id          String   @id @default(cuid())
  name        String   @unique
  emoji       String
  description String   @default("")
  totalCards  Int      @default(0)  // 实际卡片数量，由触发器或应用逻辑更新
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  items       Item[]

  @@map("series")
}

// 卡片
model Item {
  id          String   @id @default(cuid())
  serieId     String
  name        String
  subtitle    String?
  emoji       String
  rarity      String   // 'common' | 'rare' | 'epic' | 'legendary' | 'secret'
  imageUrl    String?
  description String?
  seriesIndex Int
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  series      Series         @relation(fields: [serieId], references: [id], onDelete: Cascade)
  collections Collection[]
  shares      ShareRecord[]
  drawRecords DrawRecord[]

  @@unique([serieId, seriesIndex])
  @@index([serieId])
  @@map("items")
}

// 用户
model User {
  id        String   @id @default(cuid())
  nickname  String   @default("")
  avatarUrl String?
  isBanned  Boolean  @default(false)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  collections  Collection[]
  drawRecords  DrawRecord[]
  shares       ShareRecord[]

  @@map("users")
}

// 管理员
model Admin {
  id        String   @id @default(cuid())
  username  String   @unique
  password  String   // bcrypt hashed
  avatar    String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("admins")
}

// 用户收藏
model Collection {
  id          String   @id @default(cuid())
  userId      String
  itemId      String
  count       Int      @default(1)
  acquiredAt  DateTime @default(now())

  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  item        Item     @relation(fields: [itemId], references: [id], onDelete: Cascade)

  @@unique([userId, itemId])
  @@index([userId])
  @@index([itemId])
  @@map("collections")
}

// 抽卡记录
model DrawRecord {
  id        String   @id @default(cuid())
  userId    String
  serieId   String
  itemId    String
  isNew     Boolean  @default(false)
  createdAt DateTime @default(now())

  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  item      Item     @relation(fields: [itemId], references: [id], onDelete: Cascade)

  @@index([userId, serieId])
  @@index([userId])
  @@index([createdAt])
  @@map("draw_records")
}

// 收藏计数器（每系列的抽卡计数，用于保底）
model DrawCounter {
  id        String   @id @default(cuid())
  userId    String
  serieId   String
  count     Int      @default(0)
  updatedAt DateTime @updatedAt

  @@unique([userId, serieId])
  @@index([userId])
  @@map("draw_counters")
}

// 分享记录
model ShareRecord {
  id        String   @id @default(cuid())
  userId    String
  itemId    String
  platform  String   @default("unknown")
  createdAt DateTime @default(now())

  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  item      Item     @relation(fields: [itemId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([createdAt])
  @@map("share_records")
}
```

### B. 环境变量

```bash
# backend/.env
DATABASE_URL="postgresql://blindbox:blindbox_secret@localhost:5432/blindbox"
JWT_SECRET="your-secret-key-change-in-production"
JWT_EXPIRES_IN="7d"
PORT=3000
UPLOAD_DIR="./uploads"
MAX_FILE_SIZE=5242880  # 5MB
```

### C. CORS 配置

Nginx 层面已统一处理跨域，后端无需额外配置 CORS。开发现阶段可临时允许本地端口：

```typescript
// main.ts
app.enableCors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:5173', 'http://localhost:5174'],
  credentials: true,
});
```

### D. API 命名规范

| 规范 | 规则 | 示例 |
|------|------|------|
| 路径命名 | 全小写，单词用连字符分隔 | `/api/v1/draw/execute` |
| 资源名 | 复数形式 | `/api/admin/series` |
| 查询参数 | 驼峰命名 | `?pageSize=20` |
| 请求体 | 驼峰命名 | `{ serieId: "xxx" }` |
| 响应体 | 驼峰命名 | `{ totalCards: 12 }` |

---

> 本文档为前后端开发的唯一标准参考，各端应严格遵循所约定的接口路径、请求格式和响应格式。
> 如有变更需求，需同步更新本文档并通知相关团队。