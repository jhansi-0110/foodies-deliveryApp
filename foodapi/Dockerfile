# Multi-stage Dockerfile for Spring Boot Backend on Render / Cloud
# Stage 1: Build the application with Maven
FROM maven:3.9.6-eclipse-temurin-17-alpine AS build
WORKDIR /app

# Cache dependencies
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Build the executable JAR without running tests
COPY src ./src
RUN mvn clean package -DskipTests

# Stage 2: Lean JRE runtime environment
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Copy the generated JAR file from builder
COPY --from=build /app/target/*.jar app.jar

# Dynamic port assignment (Render supplies $PORT, defaults to 8080)
ENV PORT=8080
EXPOSE 8080

# Run with memory constraint suitable for 512MB free tier containers
ENTRYPOINT ["sh", "-c", "java -Xmx384m -Dserver.port=${PORT} -jar app.jar"]
