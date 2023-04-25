FROM docker.io/library/node:18-alpine AS build

ARG VITE_SERVER_URL
ENV VITE_SERVER_URL=$VITE_SERVER_URL
ARG VITE_APP_ID
ENV VITE_APP_ID=$VITE_APP_ID
ARG VITE_THEME_PRIMARY
ENV VITE_THEME_PRIMARY=$VITE_THEME_PRIMARY
ARG VITE_THEME_SECONDARY
ENV VITE_THEME_SECONDARY=$VITE_THEME_SECONDARY

COPY . /app
WORKDIR /app
RUN npm install
RUN npm run build

FROM docker.io/svenstaro/miniserve:0.23.0-alpine
COPY --from=build /app/dist /dist
CMD ["--index=index.html", "--port=5173", "--spa", "/dist"]
