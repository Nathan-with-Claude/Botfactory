FROM eclipse-temurin:20-jdk-alpine AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN apk add --no-cache maven && mvn package -DskipTests -q

FROM eclipse-temurin:20-jre-alpine
WORKDIR /app
COPY --from=build /app/target/svc-tournee-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8081
ENV SPRING_PROFILES_ACTIVE=prod
ENTRYPOINT ["java", "-jar", "app.jar"]
