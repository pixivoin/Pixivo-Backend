@echo off
echo ==========================================
echo    PIXIVO BACKEND DEPLOYMENT TOOL
echo ==========================================
echo.
cd server
echo [1/4] Resetting Git connection...
git init
git remote remove origin >nul 2>&1
git remote add origin https://github.com/pixivoin/Pixivo-Backend.git
echo.
echo [2/4] Preparing all files (Prisma, Routes, Middleware)...
git add .
git commit -m "Full cloud migration with complete folder structure"
echo.
echo [3/4] Pushing to GitHub (Please Login when prompted)...
git branch -M main
git push -u origin main -f
echo.
echo ==========================================
echo DONE! Please check Render.com now.
echo ==========================================
pause
