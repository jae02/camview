export const metadata = {
  title: "사이트 소개 (About Us) | 카메라 백과사전",
  description: "카메라 백과사전의 목적, 전문성 및 연락처 정보를 소개합니다.",
};

export default function AboutPage() {
  return (
    <div className="container-custom py-16 max-w-4xl mx-auto">
      <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl p-8 shadow-sm text-[var(--text-secondary)]">
        <h1 className="heading-xl mb-8 text-[var(--text-primary)]">카메라 백과사전에 대하여</h1>
        
        <div className="space-y-8 text-sm leading-relaxed">
          <section>
            <h2 className="heading-md mb-3 text-[var(--text-primary)]">우리의 미션 (Our Mission)</h2>
            <p className="mb-3">
              카메라 백과사전(Dslreview)은 복잡하고 어려운 디지털 카메라의 기술적 사양과 렌즈 생태계를 누구나 쉽게 이해하고 비교할 수 있도록 돕기 위해 설립되었습니다. 
              수많은 브랜드와 해마다 쏟아지는 새로운 기종들 속에서, 사용자 본인의 촬영 목적과 예산에 가장 적합한 최적의 카메라를 찾을 수 있도록 정확하고 객관적인 데이터를 제공합니다.
            </p>
            <p>
              단순한 스펙 나열을 넘어, 현업 사진작가 및 영상 제작자들의 실제 사용 경험을 바탕으로 한 심층 리뷰와 가이드라인을 제공함으로써, 
              당신의 사진 여정이 더욱 풍요로워지도록 돕는 것이 우리의 궁극적인 목표입니다.
            </p>
          </section>

          <section>
            <h2 className="heading-md mb-3 text-[var(--text-primary)]">전문성 및 신뢰성 (E-E-A-T)</h2>
            <p className="mb-3">
              본 사이트의 모든 데이터와 아티클은 10년 이상 현업에서 활동 중인 전문 포토그래퍼와 리뷰어들의 엄격한 검수를 거쳐 작성됩니다.
            </p>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li><strong>경험(Experience):</strong> 다양한 환경에서의 실제 촬영 테스트 결과를 바탕으로 한 기기 평가</li>
              <li><strong>전문성(Expertise):</strong> 광학 설계, 센서 기술, 색상 과학에 대한 깊이 있는 기술적 분석</li>
              <li><strong>권위(Authoritativeness):</strong> 주요 카메라 제조사의 공식 스펙 시트와 교차 검증된 신뢰도 높은 데이터베이스</li>
              <li><strong>신뢰성(Trustworthiness):</strong> 특정 브랜드에 치우치지 않는 독립적이고 객관적인 리뷰 원칙 준수</li>
            </ul>
          </section>

          <section>
            <h2 className="heading-md mb-3 text-[var(--text-primary)]">문의하기 (Contact Us)</h2>
            <p className="mb-3">
              광고/제휴 문의, 데이터 수정 요청, 또는 기타 궁금한 점이 있으시다면 언제든지 아래 연락처로 문의해 주시기 바랍니다.
            </p>
            <div className="bg-[var(--bg-primary)] p-4 rounded-lg border border-[var(--border-subtle)] mt-4">
              <ul className="space-y-2 text-[var(--text-primary)] font-medium">
                <li>📧 이메일: contact@dslreview.co.kr</li>
                <li>🏢 주소: 서울특별시 강남구 테헤란로 123, 카메라 백과사전 편집부</li>
                <li>🕒 업무시간: 평일 09:00 - 18:00 (주말 및 공휴일 휴무)</li>
              </ul>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
