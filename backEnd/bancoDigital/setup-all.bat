@echo off
chcp 65001 >nul
echo 🚀 Configurando Sistema...

REM Navegar para o diretório do backend
cd /d "%~dp0\backend\bancoDigital"

REM Verificar se estamos no diretório correto
if not exist "pom.xml" (
    echo ❌ Arquivo pom.xml não encontrado!
    echo Certifique-se de que este script está na raiz do projeto.
    pause
    exit /b 1
)

REM Verificar se Docker está rodando
docker info >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker não está rodando. Por favor, inicie o Docker Desktop.
    echo Baixe em: https://www.docker.com/products/docker-desktop
    pause
    exit /b 1
)

echo 🐳 Docker está rodando.

REM Verificar se a porta 3306 está ocupada e avisar
netstat -an | find "3306" >nul 2>&1
if not errorlevel 1 (
    echo ⚠️  AVISO: Detectado MySQL local na porta 3306
    echo    Docker usará porta 3307 para evitar conflitos
    echo    Conexão Docker: localhost:3307
    echo.
)

REM Criar arquivo .env se não existir
if not exist ".env" (
    echo 📄 Criando arquivo .env...
    (
        echo # Configurações do Backend
        echo MYSQL_ROOT_PASSWORD=root
        echo MYSQL_DATABASE=BancoDigital
        echo JWT_SECRET=my-docker-secret-key-super-secure-2024
        echo SPRING_PROFILES_ACTIVE=docker
    ) > .env
    echo ✅ Arquivo .env criado!
) else (
    echo ✅ Arquivo .env já existe.
)

REM Criar diretórios necessários
echo 📁 Criando diretórios necessários...
if not exist "logs" mkdir logs
if not exist "mysql-init" mkdir mysql-init

REM Parar containers existentes e limpar
echo 🛑 Parando containers existentes...
docker compose down -v 2>nul

REM Limpar containers e imagens relacionadas
echo 🧹 Limpando recursos antigos...
docker container prune -f >nul 2>&1
docker rmi backend-backend bancoDigital-backend >nul 2>&1

REM Construir e subir todos os serviços
echo 🔨 Construindo e iniciando  Backend...
echo    Isso pode levar alguns minutos na primeira execução...
docker compose up --build -d

if errorlevel 1 (
    echo ❌ Erro ao iniciar containers!
    echo.
    echo 🔍 Verificando logs para diagnóstico...
    docker compose logs
    echo.
    echo 💡 Possíveis soluções:
    echo    1. Verifique se as portas 8080, 8081 e 3307 estão livres
    echo    2. Reinicie o Docker Desktop
    echo    3. Execute: docker system prune -a
    pause
    exit /b 1
)

echo ✅ Containers iniciados!

REM Aguardar serviços estarem prontos com timeout melhorado
echo ⏳ Aguardando serviços iniciarem...

REM Aguardar MySQL estar pronto (máximo 2 minutos)
set /a mysql_attempts=0
:wait_mysql
set /a mysql_attempts+=1
if %mysql_attempts% gtr 24 (
    echo ❌ Timeout aguardando MySQL. Verificando logs...
    docker compose logs mysql
    goto show_status
)
timeout /t 5 /nobreak >nul
docker compose exec mysql mysqladmin ping -h"localhost" --silent >nul 2>&1
if errorlevel 1 (
    echo    🔄 Aguardando MySQL inicializar... ^(%mysql_attempts%/24^)
    goto wait_mysql
)
echo ✅ MySQL está pronto!

REM Aguardar aplicação Spring Boot estar pronta (máximo 3 minutos)
set /a spring_attempts=0
:wait_spring
set /a spring_attempts+=1
if %spring_attempts% gtr 36 (
    echo ❌ Timeout aguardando Spring Boot. Verificando logs...
    docker compose logs backend
    goto show_status
)
timeout /t 5 /nobreak >nul
curl -s http://localhost:8080/actuator/health >nul 2>&1
if errorlevel 1 (
    echo    🔄 Aguardando Spring Boot inicializar... ^(%spring_attempts%/36^)
    goto wait_spring
)
echo ✅ Spring Boot está pronto!

:show_status
REM Verificar status dos containers
echo.
echo 📊 Status dos containers:
docker compose ps

echo.
echo 🎉 Sistema configurado!
echo.
echo 📝 URLs dos serviços:
echo 🚀 Backend API:      http://localhost:8080
echo 📖 Swagger UI:       http://localhost:8080/swagger-ui.html
echo 🩺 Health Check:     http://localhost:8080/actuator/health
echo 🗄️ phpMyAdmin:       http://localhost:8081
echo 💾 MySQL Docker:     localhost:3307  ^(PORTA ALTERADA^)
echo.
echo 🔑 Credenciais do MySQL:
echo    Host:     localhost:3307  ^(ou mysql:3306 internamente^)
echo    Usuário:  root
echo    Senha:    root
echo    Database: BancoDigital
echo.
echo 🔑 Credenciais do phpMyAdmin:
echo    URL:      http://localhost:8081
echo    Servidor: mysql
echo    Usuário:  root  
echo    Senha:    root
echo.
echo 📝 Comandos úteis:
echo    docker compose logs -f              # Ver logs em tempo real
echo    docker compose logs -f backend      # Ver logs do backend
echo    docker compose logs -f mysql        # Ver logs do MySQL
echo    docker compose down                 # Parar todos os serviços
echo    docker compose up -d                # Iniciar todos os serviços
echo    docker compose restart              # Reiniciar todos os serviços
echo    docker compose ps                   # Ver status dos containers
echo.

REM Teste de conectividade final
echo 🧪 Testando conectividade...
curl -s -w "API Status: %%{http_code}\n" http://localhost:8080/actuator/health -o nul

echo.
echo ✨ Pronto para usar!
echo    Acesse: http://localhost:8080/swagger-ui.html
echo.
echo ⚠️  IMPORTANTE: MySQL Docker está na porta 3307 ^(não 3306^)
echo    para evitar conflito com MySQL local
echo.
pause