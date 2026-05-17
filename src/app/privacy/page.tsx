export const metadata = {
  title: "개인정보처리방침 (Privacy Policy)",
  description: "카메라 백과사전 개인정보처리방침",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="container-custom py-16 max-w-4xl mx-auto">
      <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl p-8 shadow-sm text-[var(--text-secondary)]">
        <h1 className="heading-xl mb-8 text-[var(--text-primary)]">개인정보처리방침 (Privacy Policy)</h1>
        
        <div className="space-y-6 text-sm leading-relaxed">
          <section>
            <h2 className="heading-md mb-2 text-[var(--text-primary)]">1. 개인정보의 수집 및 이용 목적</h2>
            <p>
              카메라 백과사전(이하 &quot;본 사이트&quot;)는 회원가입, 커뮤니티 활동, 맞춤형 서비스 제공을 위해 필요한 최소한의 개인정보를 수집합니다.
              수집된 정보는 서비스 제공 및 통계 분석, 그리고 광고 송출 최적화 목적으로만 활용됩니다.
            </p>
          </section>

          <section>
            <h2 className="heading-md mb-2 text-[var(--text-primary)]">2. 제3자 정보 제공 및 쿠키(Cookie) 운영</h2>
            <p>
              본 사이트는 구글 애드센스(Google AdSense) 등 제3자 광고 사업자가 맞춤형 광고를 게재하기 위해 쿠키를 사용할 수 있습니다.
              이러한 쿠키는 사용자가 본 사이트 및 인터넷 상의 다른 웹사이트를 방문한 기록을 기반으로 합니다.
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>제3자 공급업체(Google 포함)는 쿠키를 사용하여 사용자의 이전 웹사이트 방문 기록을 바탕으로 광고를 게재합니다.</li>
              <li>Google 및 파트너는 광고 쿠키를 사용하여 본 사이트 및/또는 인터넷의 다른 사이트 방문 기록을 기반으로 사용자에게 광고를 게재할 수 있습니다.</li>
              <li>사용자는 <a href="https://myadcenter.google.com/" target="_blank" rel="noopener noreferrer" className="text-[var(--accent-primary)] hover:underline">광고 설정</a>을 통해 맞춤 광고를 선택 해제할 수 있습니다.</li>
            </ul>
          </section>

          <section>
            <h2 className="heading-md mb-2 text-[var(--text-primary)]">3. 개인정보 파기</h2>
            <p>
              원칙적으로 개인정보 수집 및 이용 목적이 달성된 후에는 해당 정보를 지체 없이 파기합니다. 단, 관계법령의 규정에 의하여 보존할 필요가 있는 경우 일정 기간 동안 보관합니다.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
