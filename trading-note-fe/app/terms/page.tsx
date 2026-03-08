import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import Footer from '@/components/Footer';

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col">
            <div className="flex-1 w-full max-w-3xl mx-auto px-4 sm:px-6 py-12">
                <Link
                    href="/"
                    className="inline-flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 mb-8 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    홈으로 돌아가기
                </Link>

                <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">서비스 이용약관</h1>
                <p className="text-sm text-slate-400 dark:text-slate-500 mb-10">시행일: 2026년 3월 1일</p>

                <div className="prose prose-slate dark:prose-invert prose-sm max-w-none space-y-8">
                    <Section title="제1조 (목적)">
                        <p>이 약관은 Trabit(이하 &quot;회사&quot;)이 제공하는 매매일지 서비스(이하 &quot;서비스&quot;)의 이용 조건 및 절차, 회사와 회원의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.</p>
                    </Section>

                    <Section title="제2조 (용어의 정의)">
                        <ol>
                            <li>&quot;서비스&quot;란 회사가 제공하는 온라인 매매일지 기록, 분석, 관리 서비스를 의미합니다.</li>
                            <li>&quot;회원&quot;이란 이 약관에 동의하고 서비스에 가입하여 이용하는 자를 의미합니다.</li>
                            <li>&quot;구독&quot;이란 회원이 유료 플랜에 가입하여 정기적으로 이용료를 지불하고 서비스를 이용하는 것을 의미합니다.</li>
                            <li>&quot;무료 체험&quot;이란 신규 회원에게 제공하는 14일간의 Basic 플랜 무료 이용 기간을 의미합니다.</li>
                        </ol>
                    </Section>

                    <Section title="제3조 (약관의 효력 및 변경)">
                        <ol>
                            <li>이 약관은 서비스 화면에 게시하거나 기타 방법으로 회원에게 공지함으로써 효력을 발생합니다.</li>
                            <li>회사는 관련 법령을 위배하지 않는 범위에서 약관을 변경할 수 있으며, 변경 시 적용일 7일 전에 공지합니다. 회원에게 불리한 변경의 경우 30일 전에 공지합니다.</li>
                            <li>변경된 약관에 동의하지 않는 회원은 서비스 이용을 중단하고 탈퇴할 수 있습니다.</li>
                        </ol>
                    </Section>

                    <Section title="제4조 (서비스의 제공)">
                        <p>회사는 다음의 서비스를 제공합니다.</p>
                        <ol>
                            <li>매매 거래 기록 및 관리</li>
                            <li>거래 성과 분석 및 통계</li>
                            <li>매매원칙 관리 및 분석</li>
                            <li>대시보드 및 차트 시각화</li>
                            <li>CSV 데이터 가져오기/내보내기</li>
                            <li>기타 회사가 정하는 서비스</li>
                        </ol>
                    </Section>

                    <Section title="제5조 (회원가입 및 탈퇴)">
                        <ol>
                            <li>회원가입은 이용자가 약관에 동의하고 회원정보를 기입한 후 회사가 승인함으로써 완료됩니다.</li>
                            <li>회원은 언제든지 설정 페이지를 통해 탈퇴를 요청할 수 있으며, 회사는 즉시 처리합니다.</li>
                            <li>탈퇴 시 회원의 개인정보 및 거래 데이터는 관련 법령에 따른 보관 기간 경과 후 파기합니다.</li>
                        </ol>
                    </Section>

                    <Section title="제6조 (구독 및 결제)">
                        <ol>
                            <li>유료 서비스는 월간 또는 연간 구독 방식으로 제공됩니다.</li>
                            <li>구독료는 가입 시 선택한 결제 수단으로 매월(또는 매년) 자동 청구됩니다.</li>
                            <li>회사는 구독료를 변경할 수 있으며, 변경 시 최소 30일 전에 회원에게 통지합니다.</li>
                            <li>결제는 토스페이먼츠를 통해 처리되며, 신용카드, 체크카드, 간편결제 등을 지원합니다.</li>
                        </ol>
                    </Section>

                    <Section title="제7조 (무료 체험)">
                        <ol>
                            <li>신규 회원에게는 가입일로부터 14일간 Basic 플랜 기능을 무료로 체험할 수 있는 기간이 제공됩니다.</li>
                            <li>무료 체험 기간 종료 후 유료 구독을 하지 않으면 자동으로 Free 플랜으로 전환됩니다.</li>
                            <li>무료 체험은 1인 1회에 한합니다.</li>
                        </ol>
                    </Section>

                    <Section title="제8조 (청약 철회 및 환불)">
                        <ol>
                            <li>회원은 구독 결제일로부터 7일 이내에 서비스를 이용하지 않은 경우 전액 환불을 요청할 수 있습니다.</li>
                            <li>결제 후 7일 이내에 서비스를 이용한 경우, 이용일수에 해당하는 금액을 공제한 후 환불합니다.</li>
                            <li>결제 후 7일이 경과한 경우에는 환불이 되지 않으며, 구독 해지만 가능합니다.</li>
                            <li>구독 해지 시 현재 결제 기간이 종료될 때까지 서비스를 이용할 수 있습니다.</li>
                            <li>환불은 요청일로부터 3영업일 이내에 처리됩니다.</li>
                        </ol>
                    </Section>

                    <Section title="제9조 (자동 갱신)">
                        <ol>
                            <li>유료 구독은 회원이 해지하지 않는 한 동일 조건으로 자동 갱신됩니다.</li>
                            <li>자동 갱신 결제는 현재 구독 기간 종료일에 청구됩니다.</li>
                            <li>회원은 언제든지 설정에서 자동 갱신을 해지할 수 있습니다.</li>
                        </ol>
                    </Section>

                    <Section title="제10조 (회원의 의무)">
                        <ol>
                            <li>회원은 자신의 계정 정보를 안전하게 관리할 책임이 있습니다.</li>
                            <li>회원은 서비스를 법령, 약관 및 공공질서에 반하는 목적으로 이용할 수 없습니다.</li>
                            <li>회원은 타인의 정보를 도용하거나 서비스의 정상적인 운영을 방해하는 행위를 할 수 없습니다.</li>
                        </ol>
                    </Section>

                    <Section title="제11조 (서비스 이용 제한)">
                        <ol>
                            <li>회사는 회원이 약관을 위반하거나 서비스의 정상적 운영을 방해한 경우 이용을 제한할 수 있습니다.</li>
                            <li>이용 제한 시 회사는 회원에게 그 사유와 일시를 사전에 통지합니다. 다만, 긴급한 경우 사후에 통지할 수 있습니다.</li>
                        </ol>
                    </Section>

                    <Section title="제12조 (서비스의 변경 및 중단)">
                        <ol>
                            <li>회사는 운영상, 기술상의 필요에 따라 서비스를 변경할 수 있으며, 변경 전 공지합니다.</li>
                            <li>회사는 천재지변, 시스템 장애 등 불가항력적 사유로 서비스를 일시 중단할 수 있습니다.</li>
                            <li>서비스를 영구 종료하는 경우 최소 30일 전에 공지하며, 유료 회원에게는 잔여 기간에 대한 환불을 제공합니다.</li>
                        </ol>
                    </Section>

                    <Section title="제13조 (지적재산권)">
                        <ol>
                            <li>서비스에 포함된 소프트웨어, 디자인, 콘텐츠 등에 대한 지적재산권은 회사에 귀속됩니다.</li>
                            <li>회원이 서비스에 입력한 거래 데이터에 대한 소유권은 회원에게 있습니다.</li>
                        </ol>
                    </Section>

                    <Section title="제14조 (면책 및 책임 제한)">
                        <ol>
                            <li>회사는 천재지변, 전쟁, 기간통신사업자의 서비스 중단 등 불가항력으로 인한 서비스 중단에 대해 책임을 지지 않습니다.</li>
                            <li>회사는 회원의 매매 결정에 대해 어떠한 투자 조언이나 보장을 하지 않으며, 매매 손익에 대한 책임을 지지 않습니다.</li>
                            <li>회사는 회원의 귀책 사유로 인한 서비스 이용 장애에 대해 책임을 지지 않습니다.</li>
                        </ol>
                    </Section>

                    <Section title="제15조 (손해배상)">
                        <p>회사 또는 회원은 상대방의 귀책 사유로 인해 손해를 입은 경우 손해배상을 청구할 수 있습니다. 다만, 회사의 책임은 직접적이고 실제 발생한 손해에 한정됩니다.</p>
                    </Section>

                    <Section title="제16조 (분쟁 해결)">
                        <ol>
                            <li>서비스 이용과 관련하여 분쟁이 발생한 경우, 회사와 회원은 원만한 해결을 위해 성실히 협의합니다.</li>
                            <li>협의가 이루어지지 않는 경우 관할 법원에 소를 제기할 수 있습니다.</li>
                            <li>공정거래위원회 또는 시/도지사가 의뢰하는 분쟁조정기관의 조정에 따를 수 있습니다.</li>
                        </ol>
                    </Section>

                    <Section title="제17조 (기타)">
                        <ol>
                            <li>이 약관에서 정하지 아니한 사항은 관련 법령 또는 상관례에 따릅니다.</li>
                            <li>이 약관은 대한민국 법률에 따라 해석됩니다.</li>
                        </ol>
                    </Section>

                    <div className="pt-4 text-slate-400 dark:text-slate-500">
                        <p>부칙</p>
                        <p>이 약관은 2026년 3월 1일부터 시행합니다.</p>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <section>
            <h2 className="text-base font-semibold text-slate-900 dark:text-white mb-3">{title}</h2>
            <div className="text-slate-600 dark:text-slate-400 leading-relaxed space-y-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:space-y-1.5 [&_li]:text-sm">
                {children}
            </div>
        </section>
    );
}
