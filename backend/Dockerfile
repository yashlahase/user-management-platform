# Build Stage
FROM node:20-slim AS builder

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci --ignore-scripts

# Copy Prisma schema first to generate client early (improves caching)
COPY src/prisma/schema.prisma ./src/prisma/
RUN npx prisma generate --schema=src/prisma/schema.prisma

# Copy the rest of the application files
COPY . .

# Build the TypeScript project
RUN npm run build && cp -R src/docs dist/

# Runtime Stage
FROM node:20-slim

# Install runtime dependencies (OpenSSL and CA Certificates for secure database handshakes)
RUN apt-get update -y && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*

WORKDIR /usr/src/app

# Copy package configurations and production dependencies only
COPY package*.json ./
RUN npm ci --only=production --ignore-scripts

# Copy generated Prisma Client from builder stage
COPY --from=builder /usr/src/app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /usr/src/app/node_modules/@prisma/client ./node_modules/@prisma/client

# Copy built artifacts and database config/schema
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/src/prisma ./src/prisma

# Set environment
ENV NODE_ENV=production
ENV PORT=5001

EXPOSE 5001

# Run database migration followed by starting the server
CMD ["sh", "-c", "npx prisma db push --schema=src/prisma/schema.prisma && node dist/server.js"]
