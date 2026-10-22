FROM oven/bun:1.3.14-slim AS base
WORKDIR /app

# Install dependencies
COPY package.json bun.lock ./
COPY packages/web/package.json ./packages/web/package.json
RUN bun install

# Copy full source and build web frontend
COPY . .
RUN cd packages/web && bun run build

ENV NODE_ENV=production
ENV PORT=3000
ENV WEBSITE_URL=https://1clickbiz.com

EXPOSE 3000

CMD ["bun", "run", "packages/web/src/__server.ts"]
