FROM maven:3.9-eclipse-temurin-25 AS build
WORKDIR /app
# copy pom first to cache dependencies
COPY pom.xml .
RUN mvn -B dependency:go-offline

COPY src ./src
RUN mvn -B clean package -DskipTests

FROM eclipse-temurin:25-jre
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar

# create a non-root user and set ownership
RUN addgroup --system app && adduser --system --ingroup app appuser \
    && chown -R appuser:app /app
USER appuser

# Provide production profile via environment variable inside the container
ENV SPRING_PROFILES_ACTIVE=prod

EXPOSE 8080
# Let Spring read the profile from the environment variable. IDEs and local runs should set SPRING_PROFILES_ACTIVE=dev (or use -Dspring.profiles.active=dev)
ENTRYPOINT ["java", "-jar", "app.jar"]
