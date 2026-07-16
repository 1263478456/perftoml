# sc-commit: init
# ============================================================
#  SubConverter-Extended + 自定义前端 + Nginx
# ============================================================

# ---- Stage 1: 从 Extended 镜像提取后端 ----
FROM aethersailor/subconverter-extended:latest AS backend

# ---- Stage 2: 干净的 Alpine 基础 ----
FROM alpine:3.20

LABEL maintainer="lyb69177116"
LABEL description="SubConverter-Extended + lightweight frontend"
LABEL org.opencontainers.image.source="https://github.com/1263478456/sub-converter"

RUN apk add --no-cache nginx supervisor ca-certificates tzdata curl

# ---- 从 Extended 镜像拷贝二进制和依赖 ----
COPY --from=backend /usr/bin/subconverter /usr/bin/subconverter
COPY --from=backend /usr/lib/libmihomo.so /usr/lib/libmihomo.so
COPY --from=backend /base/ /base/
RUN chmod +x /usr/bin/subconverter

# ---- 设置库路径 ----
ENV LD_LIBRARY_PATH="/lib:/usr/lib:/lib64:/usr/lib64"

# ---- 自定义前端 ----
COPY index.html /usr/share/nginx/html/index.html

# ---- 配置文件放到二进制旁边 ----
RUN cp /base/pref.example.toml /usr/bin/pref.toml && \
    cp -r /base/base /usr/bin/base && \
    cp -r /base/snippets /usr/bin/snippets 2>/dev/null || true && \
    cp -r /base/config /usr/bin/config 2>/dev/null || true && \
    cp -r /base/profiles /usr/bin/profiles 2>/dev/null || true && \
    cp -r /base/rules /usr/bin/rules 2>/dev/null || true

# ---- Nginx 配置 ----
COPY nginx.conf /etc/nginx/nginx.conf

# ---- Supervisor 配置 ----
COPY supervisord.conf /etc/supervisord.conf

HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD curl -sf http://localhost:80/version || exit 1

EXPOSE 80

CMD ["/usr/bin/supervisord", "-c", "/etc/supervisord.conf"]
