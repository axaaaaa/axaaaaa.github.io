@echo off
setlocal EnableExtensions
chcp 65001 >nul

rem One-click build and publish static output to axaaaaa.github.io/main.
rem Source files in this checkout remain untouched; only dist is synchronized.
set "ROOT=%~dp0"
set "PAGES_REPO=https://github.com/axaaaaa/axaaaaa.github.io.git"
set "PAGES_BRANCH=main"
set "PUBLISH_DIR=%ROOT%deploy-pages-temp"
set "LOG_FILE=%ROOT%deploy.log"

cd /d "%ROOT%"
echo Deployment started %date% %time% > "%LOG_FILE%"
echo Workspace: %ROOT%>> "%LOG_FILE%"
echo Pages target: %PAGES_REPO% (%PAGES_BRANCH%)>> "%LOG_FILE%"

where npm >nul 2>&1
if errorlevel 1 (
  echo ERROR: npm not found. Install Node.js and reopen this window.
  goto :fail
)
where git >nul 2>&1
if errorlevel 1 (
  echo ERROR: git not found. Install Git for Windows.
  goto :fail
)

echo [1/5] Building production site...
call npm run build:deploy >> "%LOG_FILE%" 2>&1
if errorlevel 1 goto :fail
if not exist "%ROOT%dist\index.html" (
  echo ERROR: dist\index.html is missing after build.
  goto :fail
)

if not exist "%PUBLISH_DIR%\.git" (
  echo [2/5] Cloning Pages repository...
  git clone --depth 1 --branch "%PAGES_BRANCH%" "%PAGES_REPO%" "%PUBLISH_DIR%" >> "%LOG_FILE%" 2>&1
  if errorlevel 1 goto :fail
) else (
  echo [2/5] Updating Pages checkout...
  git -C "%PUBLISH_DIR%" remote set-url origin "%PAGES_REPO%" >> "%LOG_FILE%" 2>&1
  if errorlevel 1 goto :fail
  git -C "%PUBLISH_DIR%" fetch origin "%PAGES_BRANCH%" >> "%LOG_FILE%" 2>&1
  if errorlevel 1 goto :fail
  git -C "%PUBLISH_DIR%" checkout -B "%PAGES_BRANCH%" "origin/%PAGES_BRANCH%" >> "%LOG_FILE%" 2>&1
  if errorlevel 1 goto :fail
  git -C "%PUBLISH_DIR%" reset --hard "origin/%PAGES_BRANCH%" >> "%LOG_FILE%" 2>&1
  if errorlevel 1 goto :fail
)

echo [3/5] Syncing dist to Pages root...
rem Keep .git out of the mirror operation and preserve CNAME if one exists.
rem .github 必须排除：dist 里没有工作流文件，/MIR 会把 main 上的 .github/workflows 整目录删掉，
rem 定时采集任务会因此彻底停摆（2026-11-15 就是这么停的）。
robocopy "%ROOT%dist" "%PUBLISH_DIR%" /MIR /XD "%PUBLISH_DIR%\.git" "%PUBLISH_DIR%\.github" /XF CNAME /R:2 /W:1 /NFL /NDL /NJH /NJS /NP >> "%LOG_FILE%" 2>&1
if errorlevel 8 goto :fail
if not exist "%PUBLISH_DIR%\.nojekyll" type nul > "%PUBLISH_DIR%\.nojekyll"

rem The Pages checkout is nested inside the project; ignore it in the source repo.
findstr /x /c:"/deploy-pages-temp/" "%ROOT%.gitignore" >nul 2>&1
if errorlevel 1 >> "%ROOT%.gitignore" echo /deploy-pages-temp/

echo [4/5] Checking changes...
git -C "%PUBLISH_DIR%" add -A >> "%LOG_FILE%" 2>&1
if errorlevel 1 goto :fail
git -C "%PUBLISH_DIR%" diff --cached --check >> "%LOG_FILE%" 2>&1
if errorlevel 1 goto :fail
git -C "%PUBLISH_DIR%" diff --cached --quiet
if errorlevel 1 goto :publish
echo No changes to publish.
echo Result: no changes>> "%LOG_FILE%"
goto :success

:publish
echo [5/5] Committing and pushing to GitHub Pages...
git -C "%PUBLISH_DIR%" -c user.name="Codex Deploy" -c user.email="codex-deploy@users.noreply.github.com" commit -m "Deploy navigation site %date% %time%" >> "%LOG_FILE%" 2>&1
if errorlevel 1 goto :fail
git -C "%PUBLISH_DIR%" push origin "%PAGES_BRANCH%" >> "%LOG_FILE%" 2>&1
if errorlevel 1 goto :fail
git -C "%PUBLISH_DIR%" fetch origin "%PAGES_BRANCH%" >> "%LOG_FILE%" 2>&1
if errorlevel 1 goto :fail
git -C "%PUBLISH_DIR%" reset --hard "origin/%PAGES_BRANCH%" >> "%LOG_FILE%" 2>&1
if errorlevel 1 goto :fail

git -C "%PUBLISH_DIR%" rev-parse HEAD > "%ROOT%deploy-commit.txt"
echo Result: pushed>> "%LOG_FILE%"
type "%ROOT%deploy-commit.txt" >> "%LOG_FILE%"

echo.
echo Deploy pushed successfully. GitHub Actions will publish Pages shortly.
echo Site: https://axaaaaa.github.io/
<nul set /p "=Commit: "
type "%ROOT%deploy-commit.txt"
echo Log: %LOG_FILE%
goto :success

:fail
echo Result: failed. See the preceding command output.>> "%LOG_FILE%"
echo.
echo Deployment failed. Check %LOG_FILE% for the exact command output.
pause
exit /b 1

:success
pause
exit /b 0
