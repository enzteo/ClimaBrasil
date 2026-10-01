@echo off
chcp 65001 >nul
setlocal

set ROOT=seo-test

if exist %ROOT% (
    echo A pasta %ROOT% ja existe. Apague ou renomeie antes de rodar de novo.
    exit /b 1
)

echo Criando pastas...
mkdir %ROOT%\site\app
mkdir %ROOT%\platform\app\crawler
mkdir %ROOT%\platform\app\modules

echo Criando arquivos...
type nul > %ROOT%\site\Dockerfile
type nul > %ROOT%\site\requirements.txt
type nul > %ROOT%\site\app\__init__.py
type nul > %ROOT%\site\app\main.py

type nul > %ROOT%\platform\Dockerfile
type nul > %ROOT%\platform\requirements.txt
type nul > %ROOT%\platform\app\__init__.py
type nul > %ROOT%\platform\app\main.py
type nul > %ROOT%\platform\app\crawler\__init__.py
type nul > %ROOT%\platform\app\modules\__init__.py
type nul > %ROOT%\platform\app\modules\onpage.py
type nul > %ROOT%\platform\app\modules\offpage.py
type nul > %ROOT%\platform\app\modules\tecnico.py
type nul > %ROOT%\platform\app\modules\conteudo.py
type nul > %ROOT%\platform\app\modules\integracoes.py

type nul > %ROOT%\docker-compose.yml
type nul > %ROOT%\PROBLEMAS_PLANTADOS.md
type nul > %ROOT%\README.md

echo Criando .gitignore...
(
echo # Segredos: nunca commitar
echo .env
echo credentials*.json
echo *service-account*.json
echo *.pem
echo *.key
echo.
echo # Python
echo __pycache__/
echo *.pyc
echo .venv/
echo venv/
echo.
echo # Dados locais
echo *.db
echo *.sqlite3
echo pgdata/
echo.
echo # Sistema
echo .DS_Store
echo Thumbs.db
) > %ROOT%\.gitignore

echo Criando .env.example...
(
echo # Site
echo SITE_URL=
echo SITE_PORT=
echo API_TOKEN=
echo.
echo # Plataforma
echo PLATFORM_PORT=
echo USER_AGENT=
echo GSC_CREDENTIALS_JSON=
echo PAGESPEED_API_KEY=
echo.
echo # Banco
echo POSTGRES_USER=
echo POSTGRES_PASSWORD=
echo POSTGRES_DB=
echo DATABASE_URL=
) > %ROOT%\.env.example

echo Iniciando Git...
where git >nul 2>nul
if errorlevel 1 (
    echo Git nao encontrado. Instale o Git e rode: git init -b main
) else (
    pushd %ROOT%
    git init -b main
    git add .
    git commit -m "chore: estrutura inicial do projeto"
    git branch dev
    popd
    echo Branches main e dev criadas.
)

echo.
echo Pronto. Estrutura criada em %ROOT%
endlocal
