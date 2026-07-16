# sc-commit: init
# ============================================================
#  SubConverter-Extended + 自定义前端 + Nginx
# ============================================================

# ---- Stage 1: 从干净 Alpine 提取 nginx ----
FROM alpine:3.20 AS nginx-src
RUN apk add --no-cache nginx

# ---- Stage 2: 基于 Extended 镜像 ----
FROM aethersailor/subconverter-extended:latest

LABEL maintainer="lyb69177116"
LABEL description="SubConverter-Extended + lightweight frontend"
LABEL org.opencontainers.image.source="https://github.com/1263478456/sub-converter"

# 从 Stage 1 拷贝整个 nginx 相关目录
COPY --from=nginx-src /usr/sbin/nginx /usr/sbin/nginx
COPY --from=nginx-src /etc/nginx /etc/nginx
COPY --from=nginx-src /usr/lib/nginx /usr/lib/nginx
COPY --from=nginx-src /usr/share/nginx /usr/share/nginx

RUN mkdir -p /var/log/nginx /run/nginx /tmp/nginx /var/lib/nginx/tmp /var/lib/nginx/logs

# ---- 自定义前端 ----
COPY index.html /usr/share/nginx/html/index.html

# ---- Nginx 配置 ----
COPY nginx.conf /etc/nginx/nginx.conf

# ---- 启动脚本 ----
COPY start.sh /start.sh
RUN chmod +x /start.sh

ENTRYPOINT []

HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD curl -sf http://localhost:80/version || exit 1

EXPOSE 80

CMD ["/start.sh"]
