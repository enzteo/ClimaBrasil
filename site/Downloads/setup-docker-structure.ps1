# setup-docker-structure.ps1
# Rode a partir de C:\Users\enzot (a pasta onde "site" está agora).
# Comando: powershell -ExecutionPolicy Bypass -File setup-docker-structure.ps1

$origem = "$env:USERPROFILE\site"
$raiz = "$env:USERPROFILE\teste-seo-savaro"

if (-not (Test-Path $origem)) {
    Write-Host "ERRO: não encontrei a pasta $origem. Rode este script de dentro de C:\Users\enzot." -ForegroundColor Red
    exit 1
}

# 1. Cria a pasta raiz, se ainda não existir
New-Item -ItemType Directory -Path $raiz -Force | Out-Null
Write-Host "Pasta raiz criada/confirmada: $raiz"

# 2. Move a pasta "site" inteira pra dentro da raiz
Move-Item -Path $origem -Destination $raiz -Force
Write-Host "Pasta site movida para: $raiz\site"

# 3. Remove qualquer docker-compose.yml que tenha ficado (por engano) dentro de site
$composeErrado = "$raiz\site\docker-compose.yml"
if (Test-Path $composeErrado) {
    Remove-Item $composeErrado -Force
    Write-Host "Removido docker-compose.yml que estava (errado) dentro de site/"
}

# 4. Cria o docker-compose.yml correto, na raiz
$composeContent = @"
services:
  site:
    build: ./site
    env_file: .env
    environment:
      PORT: 3000
    ports:
      - "3000:3000"
"@
Set-Content -Path "$raiz\docker-compose.yml" -Value $composeContent -Encoding UTF8
Write-Host "docker-compose.yml criado em: $raiz\docker-compose.yml"

# 5. Cria o .env na raiz
Set-Content -Path "$raiz\.env" -Value "SITE_URL=http://localhost:3000" -Encoding UTF8
Write-Host ".env criado em: $raiz\.env"

Write-Host ""
Write-Host "Pronto! Estrutura final:" -ForegroundColor Green
Write-Host "$raiz"
Write-Host "  |- docker-compose.yml"
Write-Host "  |- .env"
Write-Host "  |- site\ (seu projeto Next.js)"
