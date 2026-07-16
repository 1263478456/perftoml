# extended-digest: init
# ============================================================
#  SubConverter-Extended + 自定义前端 + Nginx
#  nginx 用 musl 跑，subconverter 用 glibc 跑
# ============================================================

# ---- Stage 1: 从干净 Alpine 提取 nginx + musl 运行时 ----
FROM alpine:3.20 AS nginx-src
RUN apk add --no-cache nginx pcre

# ---- Stage 2: 基于 Extended 镜像 ----
FROM aethersailor/subconverter-extended:latest

LABEL maintainer="lyb69177116"
LABEL description="SubConverter-Extended + lightweight frontend"
LABEL org.opencontainers.image.source="https://github.com/1263478456/sub-converter"

# 从 Stage 1 拷贝 nginx 及其完整运行时（musl + pcre）
# 仅构建 linux/amd64，不需要 aarch64 链接器
COPY --from=nginx-src /usr/sbin/nginx /opt/nginx/usr/sbin/nginx
COPY --from=nginx-src /etc/nginx /opt/nginx/etc/nginx
COPY --from=nginx-src /usr/lib/nginx /opt/nginx/usr/lib/nginx
COPY --from=nginx-src /usr/share/nginx /opt/nginx/usr/share/nginx
COPY --from=nginx-src /lib/ld-musl-x86_64.so.1 /opt/nginx/lib/ld-musl-x86_64.so.1
COPY --from=nginx-src /usr/lib/libpcre.so.1 /opt/nginx/usr/lib/libpcre.so.1
COPY --from=nginx-src /lib/libz.so.1 /opt/nginx/lib/libz.so.1
COPY --from=nginx-src /lib/libcrypto.so.3 /opt/nginx/lib/libcrypto.so.3
COPY --from=nginx-src /lib/libssl.so.3 /opt/nginx/lib/libssl.so.3

RUN mkdir -p /var/log/nginx /run/nginx /tmp/nginx /var/lib/nginx/tmp /var/lib/nginx/logs

# ---- 创建 nginx 包装脚本（用 musl 链接器运行，指定配置文件路径） ----
RUN printf '#!/bin/sh\n\
exec /opt/nginx/lib/ld-musl-x86_64.so.1 --library-path /opt/nginx/lib:/opt/nginx/usr/lib /opt/nginx/usr/sbin/nginx -c /opt/nginx/etc/nginx/nginx.conf "$@"\n\
' > /usr/local/bin/nginx && \
    chmod +x /usr/local/bin/nginx

# ---- 调整 nginx 配置路径 ----
RUN sed -i 's|/etc/nginx/|/opt/nginx/etc/nginx/|g' /opt/nginx/etc/nginx/nginx.conf 2>/dev/null || true

# ---- 自定义前端 ----
COPY index.html /opt/nginx/usr/share/nginx/html/index.html

# ---- Nginx 配置 ----
COPY nginx.conf /opt/nginx/etc/nginx/nginx.conf

# ---- 启动脚本 ----
COPY start.sh /start.sh
RUN chmod +x /start.sh

# ---- 安装 curl（健康检查 + subconverter 就绪检测需要） ----
RUN apt-get update && apt-get install -y --no-install-recommends curl && rm -rf /var/lib/apt/lists/*

ENTRYPOINT []

HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD curl -sf http://localhost:80/version || exit 1

EXPOSE 80

CMD ["/start.sh"]
