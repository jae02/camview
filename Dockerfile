# 1. 의존성 설치 단계
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# package.json 및 잠금 파일 복사
COPY package.json package-lock.json ./
# Prisma 클라이언트 생성을 위해 스키마 복사
COPY prisma ./prisma

RUN npm ci

# 2. 빌드 단계
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# 압축 해제
RUN tar -xzf data/cameras.tar.gz -C public/images/

# Next.js 텔레메트리 비활성화 (선택 사항)
ENV NEXT_TELEMETRY_DISABLED 1

# 빌드 시 프리렌더링(Static Generation)을 위해 DB 접근이 필요하므로 ARG 주입
ARG DATABASE_URL
ENV DATABASE_URL=${DATABASE_URL}

# Prisma 클라이언트 생성 및 Next.js 앱 빌드
RUN npx prisma generate
RUN npm run build

# 3. 프로덕션 실행 단계
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# next.config.ts에서 output: "standalone"을 사용하므로 필요한 파일만 복사
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
