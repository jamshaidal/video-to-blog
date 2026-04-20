FROM node:22-bookworm-slim

WORKDIR /app

ENV NODE_ENV=production

RUN apt-get update \
  && apt-get install -y --no-install-recommends ffmpeg \
  && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm ci --omit=dev

COPY prisma ./prisma
COPY prisma.config.ts ./

ARG DATABASE_URL=postgresql://postgres:postgres@postgres:5432/ai_video_platform
ENV DATABASE_URL=$DATABASE_URL

RUN npx prisma generate

COPY src ./src

EXPOSE 5000

CMD ["node", "src/server.js"]
