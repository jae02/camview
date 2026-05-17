export const metadata = {
  title: "이용약관 (Terms of Service)",
  description: "카메라 백과사전 서비스 이용약관",
};

export default function TermsOfServicePage() {
  return (
    <div className="container-custom py-16 max-w-4xl mx-auto">
      <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl p-8 shadow-sm text-[var(--text-secondary)]">
        <h1 className="heading-xl mb-8 text-[var(--text-primary)]">이용약관 (Terms of Service)</h1>
        
        <div className="space-y-6 text-sm leading-relaxed">
          <section>
            <h2 className="heading-md mb-2 text-[var(--text-primary)]">1. 목적</h2>
            <p>
              본 약관은 카메라 백과사전(이하 &quot;본 사이트&quot;)가 제공하는 서비스의 이용과 관련하여 회사와 회원 간의 권리, 의무 및 책임사항 등을 규정함을 목적으로 합니다.
            </p>
          </section>

          <section>
            <h2 className="heading-md mb-2 text-[var(--text-primary)]">2. 서비스의 제공 및 변경</h2>
            <p>
              본 사이트는 카메라 스펙, 리뷰 데이터 및 관련 콘텐츠를 제공합니다. 서비스의 내용은 당사의 정책이나 기술적 필요에 따라 변경될 수 있으며, 
              이 경우 변경된 사항을 사이트를 통해 공지합니다.
            </p>
          </section>

          <section>
            <h2 className="heading-md mb-2 text-[var(--text-primary)]">3. 저작권 및 콘텐츠 사용</h2>
            <p>
              본 사이트 내에 게시된 정보, 텍스트, 이미지 등에 대한 저작권은 당사 또는 해당 정보의 제공자에게 귀속됩니다. 
              사용자는 당사의 사전 승인 없이 상업적 목적으로 본 사이트의 데이터를 무단 복제, 배포할 수 없습니다.
            </p>
          </section>

          <section>
            <h2 className="heading-md mb-2 text-[var(--text-primary)]">4. 광고 게재</h2>
            <p>
              본 사이트는 서비스 제공에 필요한 비용 충당 및 유지를 위해 페이지 일부에 광고(Google AdSense 등)를 게재할 수 있습니다. 
              사용자는 서비스 이용 시 광고 노출에 동의하는 것으로 간주됩니다.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
