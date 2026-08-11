# DSLReview — 정보전달용 블로그 게시판

관리자 전용 글 작성, 카테고리 분류, 댓글 기능을 갖춘 정보전달용 블로그형 게시판입니다.

## 기능

- 📝 관리자 전용 글 작성/수정/삭제 (마크다운 에디터)
- 📂 카테고리 분류 (공지사항, 카메라, 사진 팁, 리뷰, 자유)
- 💬 비로그인 댓글 (닉네임 + 비밀번호)
- 🔍 제목/본문 키워드 검색
- 📱 모바일/PC 반응형
- 🔍 SEO 최적화 (sitemap, robots, OG, JSON-LD)

## 실행

```bash
npm install
npm run dev
```

## 배포

```bash
docker compose build --no-cache
docker compose up -d
```

## 환경변수

| 변수 | 설명 |
| :--- | :--- |
| `ADMIN_PASSWORD` | 관리자 비밀번호 |
