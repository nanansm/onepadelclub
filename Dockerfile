# One Padel Club - Next 15 (App Router). Node 20 pinned.
# Source: git -> Easypanel builds with this Dockerfile.

FROM node:20-slim AS base
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

# ---- deps: install everything (build needs devDeps) ----
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

# ---- build: compile Next ----
FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Next "collect page data" mengevaluasi modul tiap route saat build. Modul DB
# (src/db) & env (src/lib/env) fail-fast kalau env hilang. Beri nilai DUMMY
# khusus build supaya build jalan tanpa DB nyata; runtime pakai env asli dari
# Easypanel. Semua route DB = force-dynamic, jadi tak ada koneksi saat build.
ENV DATABASE_URL=postgresql://placeholder:placeholder@127.0.0.1:5432/placeholder
ENV BETTER_AUTH_SECRET=build-time-placeholder-secret
RUN npm run build

# ---- runner: serve. Keeps node_modules so `next start` + drizzle migrator
#      (run at boot via package.json "start") both work. ----
FROM base AS runner
ENV NODE_ENV=production
ENV PORT=3007
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY --from=build /app/drizzle ./drizzle
COPY --from=build /app/scripts ./scripts
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/next.config.ts ./next.config.ts
COPY --from=build /app/drizzle.config.ts ./drizzle.config.ts
EXPOSE 3007
# "start" = node scripts/migrate-prod.mjs && next start -p 3007
CMD ["npm", "run", "start"]
