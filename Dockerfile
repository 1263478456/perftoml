# ============================================================
#  All-in-One: subconverter + sub-web + Nginx
#  一条命令启动完整的订阅转换服务
# ============================================================

# ---- Stage 1: 获取 sub-web 前端编译产物 ----
FROM careywong/subweb:latest AS frontend

# ---- Stage 2: 最终镜像 ----
FROM nginx:alpine

LABEL maintainer="lyb69177116"
LABEL description="subconverter + sub-web All-in-One"
LABEL org.opencontainers.image.source="https://github.com/1263478456/sub-converter"

# 安装必要工具
RUN apk add --no-cache \
    curl \
    wget \
    supervisor \
    libc6-compat

# ---- 安装 subconverter 后端 ----
ARG SUBCONVERTER_VERSION=0.9.0
RUN ARCH=$(uname -m) && \
    if [ "$ARCH" = "x86_64" ]; then \
        SC_ARCH="linux64"; \
    elif [ "$ARCH" = "aarch64" ]; then \
        SC_ARCH="aarch64"; \
    else \
        echo "Unsupported architecture: $ARCH" && exit 1; \
    fi && \
    wget -q "https://github.com/tindy2013/subconverter/releases/download/v${SUBCONVERTER_VERSION}/subconverter_${SC_ARCH}.tar.gz" \
        -O /tmp/subconverter.tar.gz && \
    tar -xzf /tmp/subconverter.tar.gz -C /opt/ && \
    rm /tmp/subconverter.tar.gz && \
    chmod +x /opt/subconverter/subconverter

# ---- 拷贝前端静态文件 ----
COPY --from=frontend /usr/share/nginx/html/ /usr/share/nginx/html/

# ---- 拷贝自定义配置 ----
COPY subconverter/pref.ini /opt/subconverter/base/pref.ini
COPY subconverter/config/ /opt/subconverter/base/config/

# ---- Nginx 配置 ----
COPY nginx.conf /etc/nginx/nginx.conf

# ---- Supervisor 配置（同时管理 nginx + subconverter）----
COPY supervisord.conf /etc/supervisord.conf

# ---- 健康检查 ----
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -sf http://localhost:80/version || exit 1

EXPOSE 80

CMD ["/usr/bin/supervisord", "-c", "/etc/supervisord.conf"]
