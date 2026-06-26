@echo off
chcp 65001 >nul
echo ===================================================
echo Windows 환경용 배포 스크립트 (DSLReview Camera Specs)
echo ===================================================

set SERVER=root@1.234.65.106
set TARGET_DIR=/home/ubuntu/infra/services/camera-specs/
set ARCHIVE=deploy_archive.tar.gz

echo.
echo [1/3] 소스 코드 압축 중... (node_modules, .next, .git 제외)
tar -czf %ARCHIVE% --exclude="node_modules" --exclude=".next" --exclude=".git" --exclude="%ARCHIVE%" .

echo.
echo [2/3] 서버로 파일 전송 중...
echo ※ 서버 비밀번호(skymp159!)를 입력해 주세요.
scp %ARCHIVE% %SERVER%:%TARGET_DIR%

echo.
echo [3/3] 서버에서 압축 해제 및 Docker 빌드 진행 중...
echo ※ 서버 비밀번호(skymp159!)를 한 번 더 입력해 주세요.
ssh %SERVER% "cd %TARGET_DIR% && tar -xzf %ARCHIVE% && rm %ARCHIVE% && docker compose up -d --build"

echo.
echo [마무리] 로컬 임시 압축 파일 삭제 중...
del %ARCHIVE%

echo.
echo ===================================================
echo 배포 작업이 모두 완료되었습니다!
echo ===================================================
pause
