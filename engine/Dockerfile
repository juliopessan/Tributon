# Imagem do motor oficial numa tag fixada do repositório da Receita Federal.
#   docker build -t tributon-engine:1.6.1 engine/
FROM eclipse-temurin:21-jdk AS build
ARG ENGINE_REF=1.6.1
RUN apt-get update && apt-get install -y --no-install-recommends git && rm -rf /var/lib/apt/lists/*
WORKDIR /src
RUN git clone --depth 1 --branch "${ENGINE_REF}" https://github.com/ReceitaFederal/calculadora-rtc-regime-regular . \
 && mkdir -p calculadora/db \
 && ./mvnw flyway:migrate -Dflyway.configFiles=./flyway/flyway-pro.conf --batch-mode --errors -q \
 && ./mvnw -DskipTests package --batch-mode -q

FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /src/target/*.jar /app/engine.jar
COPY --from=build /src/calculadora/db /app/calculadora/db
COPY --from=build /src/LICENSE /app/LICENSE
COPY NOTICE /app/NOTICE
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/engine.jar", "--spring.profiles.active=offline"]
