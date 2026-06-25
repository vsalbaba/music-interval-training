FROM node:22-alpine AS build
ARG COMMIT_HASH=dev
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
ENV VITE_COMMIT_HASH=$COMMIT_HASH
RUN npm run build

FROM node:22-alpine
WORKDIR /app
COPY --from=build /app/build ./build
COPY --from=build /app/package*.json ./
RUN npm ci --omit=dev
ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000
CMD ["node", "build"]
