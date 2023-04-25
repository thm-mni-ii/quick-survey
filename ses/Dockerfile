FROM gradle:jdk18 AS build

COPY . /build
WORKDIR /build

RUN gradle quarkusBuild

FROM eclipse-temurin:18-jre-alpine

COPY --from=build /build/build/quarkus-app /app

WORKDIR /app
CMD ["java", "-jar", "quarkus-run.jar"]
