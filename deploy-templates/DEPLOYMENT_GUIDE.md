# Traefik + Docker 플러그 앤 플레이 배포 가이드

이 가이드는 카페24 SSD 가상서버(Ubuntu) 환경에서 Traefik 리버스 프록시를 띄우고, 새로운 서비스를 추가/삭제하는 방법을 개발자 관점에서 설명합니다.

---

## 1. 서버 초기 세팅 (최초 1회만 실행)

서버에 접속한 후, 외부에서 도커 컨테이너들이 서로 통신할 수 있도록 공용 네트워크를 생성합니다.

```bash
# 공용 브릿지 네트워크 생성
docker network create traefik-public
```

이 네트워크는 Traefik과 개별 서비스 컨테이너들을 연결하는 다리 역할을 합니다.

---

## 2. Traefik 마스터 프록시 실행 (최초 1회만 실행)

`traefik-master` 폴더를 서버의 `/home/ubuntu/infra/traefik/` 경로에 복사한 후 실행합니다.

```bash
# 1. traefik 폴더로 이동
cd /home/ubuntu/infra/traefik/

# 2. traefik.yml 파일 안의 이메일 주소를 본인 이메일로 변경 (Let's Encrypt 알림용)
# nano traefik.yml

# 3. acme.json 파일 생성 및 권한 설정 (매우 중요: 권한이 600이 아니면 에러 발생)
touch acme.json
chmod 600 acme.json

# 4. Traefik 컨테이너 백그라운드 실행
docker-compose up -d
```

이제 Traefik이 서버의 80, 443 포트를 점유하고 새 컨테이너가 뜨기를 감시합니다.

---

## 3. 새로운 서비스 추가 및 배포 (앱이 추가될 때마다 반복)

새로운 Next.js, Node.js 프로젝트를 배포할 때 사용하는 방법입니다.

### 3-1. 프로젝트 폴더 세팅
서비스 코드를 서버의 `/home/ubuntu/infra/services/새_프로젝트_이름/` 에 위치시킵니다.
`service-template/docker-compose.yml` 템플릿을 해당 폴더에 복사하고 알맞게 수정합니다.

### 3-2. docker-compose.yml 파일 수정 사항
반드시 서비스마다 아래 3가지를 고유하게 변경해야 합니다.

1. `container_name`: 예) `camera-specs-app`
2. `labels` 내의 라우터 이름(`my-new-service`): 예) `camera-specs-router` (중복되면 충돌 발생)
3. `Host(`...`)` 도메인: 사용할 실제 도메인 입력 예) `Host(`camera.example.com`)`

### 3-3. 서비스 띄우기
```bash
# 프로젝트 폴더로 이동
cd /home/ubuntu/infra/services/새_프로젝트_이름/

# 컨테이너 빌드 및 실행 (Traefik이 자동으로 인식하여 HTTPS와 함께 라우팅 시작)
docker-compose up -d --build
```
명령어 실행 후 10~30초 이내에 Let's Encrypt 인증서가 발급되고 서비스에 접근할 수 있게 됩니다! (서버에 미리 해당 도메인의 A 레코드가 연결되어 있어야 합니다.)

---

## 4. 기존 서비스 업데이트 및 내리기

### 서비스 내용이 수정되어 다시 배포할 때 (무중단 갱신에 가깝게 동작)
```bash
cd /home/ubuntu/infra/services/프로젝트_이름/
git pull
docker-compose up -d --build
```
> 도커가 새 이미지를 빌드한 뒤, 기존 컨테이너를 내리고 새 컨테이너를 올립니다. 이때 Traefik이 트래픽을 자동으로 새 컨테이너로 전환합니다.

### 서비스를 완전히 내리고 싶을 때
```bash
cd /home/ubuntu/infra/services/프로젝트_이름/
docker-compose down
```
> 컨테이너가 내려가면 Traefik이 즉시 라우팅 목록에서 해당 도메인을 제외합니다. 다른 서비스에는 전혀 영향을 주지 않습니다 (진정한 Plug & Play).
