# sc-commit: init
# subweb-commit: init
# ============================================================
#  All-in-One: subconverter + sub-web + Nginx
#  基于官方 subconverter 镜像，添加 Nginx + 前端
#  构建时直接修改编译后的 JS 模板，彻底移除不需要的元素
# ============================================================

# ---- Stage 1: 获取 sub-web 前端编译产物 ----
FROM careywong/subweb:latest AS frontend

# ---- Stage 2: 基于官方 subconverter 镜像构建 ----
FROM tindy2013/subconverter:latest

LABEL maintainer="lyb69177116"
LABEL description="subconverter + sub-web All-in-One"
LABEL org.opencontainers.image.source="https://github.com/1263478456/sub-converter"

RUN apk add --no-cache nginx supervisor

# ---- 拷贝前端静态文件 ----
COPY --from=frontend /usr/share/nginx/html/ /usr/share/nginx/html/

# ---- 彻底移除不需要的前端元素（修改编译后的 JS）----
# 1. 移除「后端地址」表单项（在 label 后加 style=display:none 使整个 form-item 不可见）
# 2. 移除「订阅短链」表单项
# 3. 移除「生成短链接」按钮（只删按钮，保留「生成订阅链接」）
RUN JS_FILE=$(ls /usr/share/nginx/html/assets/*.js | head -1) && \
    sed -i 's/label:"后端地址:"/label:"__HIDDEN__",style:{display:"none"}/g' "$JS_FILE" && \
    sed -i 's/label:"订阅短链:"/label:"__HIDDEN__",style:{display:"none"}/g' "$JS_FILE" && \
    sed -i 's/生成短链接/生成短链__removed/g' "$JS_FILE"

# ---- 注入前端补丁 ----
COPY patch.js /usr/share/nginx/html/patch.js
RUN sed -i 's|</head>|<script src="/patch.js"></script></head>|' \
    /usr/share/nginx/html/index.html

# ---- 把配置文件放到二进制旁边 ----
RUN cp /base/pref.example.yml /usr/bin/pref.yml && \
    cp -r /base/base /usr/bin/base && \
    cp -r /base/snippets /usr/bin/snippets && \
    cp -r /base/config /usr/bin/config && \
    cp -r /base/profiles /usr/bin/profiles && \
    cp -r /base/rules /usr/bin/rules

# ---- Nginx 配置 ----
COPY nginx.conf /etc/nginx/nginx.conf

# ---- Supervisor 配置 ----
COPY supervisord.conf /etc/supervisord.conf

ENTRYPOINT []

HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD curl -sf http://localhost:80/version || exit 1

EXPOSE 80

CMD ["/usr/bin/supervisord", "-c", "/etc/supervisord.conf"]
