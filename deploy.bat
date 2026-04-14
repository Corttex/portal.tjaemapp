@echo off
echo ============================================
echo TJAEM - Deploy Script
echo ============================================
echo.

echo [1/3] Copiando arquivos do app_build para infrastructure/public...
xcopy "%~dp0app_build\*.*" "%~dp0infrastructure\public\" /E /I /Y >nul
if %errorlevel% neq 0 (
    echo ERRO ao copiar arquivos!
    pause
    exit /b 1
)
echo Arquivos copiados com sucesso!
echo.

echo [2/3] Verificando configuracao...
if not exist "%~dp0config\.env" (
    echo AVISO: config\.env nao encontrado!
    echo Copie config\.env.example para config\.env e preencha as credenciais.
    pause
    exit /b 1
)
echo Configuracao OK!
echo.

echo [3/3] Pronto para deploy!
echo.
echo Para iniciar os servicos, execute:
echo   cd infrastructure
echo   docker-compose -f docker-compose-n8n.yml up -d
echo.
echo Para ver os logs:
echo   docker-compose -f docker-compose-n8n.yml logs -f
echo.
pause
