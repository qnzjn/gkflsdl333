@echo off
chcp 65001 >nul
cd /d D:\spring-tool2
echo [생활정보 매거진 -> qnzjn/gkflsdl333 푸시 실행 중...]
git push -u origin main
if %errorlevel% equ 0 (
    echo.
    echo ========================================================
    echo  깃허브 업로드 및 배포 완료!
    echo  https://github.com/qnzjn/gkflsdl333
    echo ========================================================
) else (
    echo.
    echo ========================================================
    echo  실패 시 창의 안내에 따라 깃허브 로그인을 완료해주세요.
    echo ========================================================
)
pause
