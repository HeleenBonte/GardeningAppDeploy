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

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]