import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import Footer from '@/components/Footer';

export default function PrivacyPage() {
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

                <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">개인정보 처리방침</h1>
                <p className="text-sm text-slate-400 dark:text-slate-500 mb-10">시행일: 2026년 3월 1일</p>

                <div className="prose prose-slate dark:prose-invert prose-sm max-w-none space-y-8">
                    <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                        Trabit(이하 &quot;회사&quot;)은 개인정보보호법, 정보통신망 이용촉진 및 정보보호 등에 관한 법률 등 관련 법령에 따라 이용자의 개인정보를 보호하고, 이와 관련한 고충을 원활하게 처리할 수 있도록 다음과 같은 개인정보 처리방침을 두고 있습니다.
                    </p>

                    <Section title="1. 개인정보의 처리 목적">
                        <p>회사는 다음의 목적을 위해 개인정보를 처리합니다.</p>
                        <ul>
                            <li><strong>회원 관리:</strong> 회원 가입, 본인 확인, 서비스 이용, 부정 이용 방지</li>
                            <li><strong>서비스 제공:</strong> 매매일지 기록, 분석, 통계 제공</li>
                            <li><strong>결제 처리:</strong> 유료 구독 결제, 환불, 결제 내역 관리</li>
                            <li><strong>서비스 개선:</strong> 서비스 이용 통계, 오류 분석, 기능 개선</li>
                        </ul>
                    </Section>

                    <Section title="2. 수집하는 개인정보 항목">
                        <p><strong>필수 항목:</strong></p>
                        <ul>
                            <li>이메일 주소, 비밀번호(암호화 저장), 이름(닉네임)</li>
                        </ul>
                        <p><strong>소셜 로그인 시 수집 항목:</strong></p>
                        <ul>
                            <li>카카오: 닉네임, 프로필 이미지, 이메일</li>
                        </ul>
                        <p><strong>결제 시 수집 항목:</strong></p>
                        <ul>
                            <li>결제 수단 정보(카드사명, 카드번호 일부), 결제 내역</li>
                            <li>결제 정보는 토스페이먼츠에서 직접 처리하며, 회사는 카드 전체 번호를 저장하지 않습니다.</li>
                        </ul>
                        <p><strong>자동 수집 항목:</strong></p>
                        <ul>
                            <li>접속 IP, 접속 일시, 브라우저 정보, 서비스 이용 기록</li>
                        </ul>
                    </Section>

                    <Section title="3. 개인정보의 처리 및 보유 기간">
                        <p>회원 탈퇴 시 지체 없이 파기합니다. 다만, 다음의 경우 해당 기간 동안 보관합니다.</p>
                        <ul>
                            <li><strong>계약 또는 청약철회 기록:</strong> 5년 (전자상거래법)</li>
                            <li><strong>대금결제 및 재화 공급 기록:</strong> 5년 (전자상거래법)</li>
                            <li><strong>소비자 불만 또는 분쟁 처리 기록:</strong> 3년 (전자상거래법)</li>
                            <li><strong>표시/광고에 관한 기록:</strong> 6개월 (전자상거래법)</li>
                            <li><strong>접속 기록:</strong> 1년 (통신비밀보호법)</li>
                        </ul>
                    </Section>

                    <Section title="4. 개인정보의 제3자 제공">
                        <p>회사는 원칙적으로 회원의 개인정보를 제3자에게 제공하지 않습니다. 다만, 다음의 경우 예외로 합니다.</p>
                        <ul>
                            <li>회원이 사전에 동의한 경우</li>
                            <li>법령에 의해 요구되는 경우</li>
                        </ul>
                        <table>
                            <thead>
                                <tr>
                                    <th>제공받는 자</th>
                                    <th>목적</th>
                                    <th>항목</th>
                                    <th>보유 기간</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>토스페이먼츠</td>
                                    <td>결제 처리</td>
                                    <td>이메일, 이름, 결제 정보</td>
                                    <td>결제 완료 후 5년</td>
                                </tr>
                            </tbody>
                        </table>
                    </Section>

                    <Section title="5. 개인정보 처리의 위탁">
                        <table>
                            <thead>
                                <tr>
                                    <th>위탁받는 자</th>
                                    <th>위탁 업무</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>Amazon Web Services (AWS)</td>
                                    <td>클라우드 서버 호스팅 및 데이터 저장</td>
                                </tr>
                                <tr>
                                    <td>토스페이먼츠</td>
                                    <td>결제 처리 및 정기결제 관리</td>
                                </tr>
                            </tbody>
                        </table>
                    </Section>

                    <Section title="6. 개인정보의 파기 절차 및 방법">
                        <ul>
                            <li><strong>파기 절차:</strong> 보유 기간이 경과하거나 처리 목적이 달성된 경우 지체 없이 파기합니다.</li>
                            <li><strong>파기 방법:</strong> 전자적 파일은 복구 및 재생이 불가능한 방법으로 영구 삭제하며, 종이 문서는 분쇄 또는 소각합니다.</li>
                        </ul>
                    </Section>

                    <Section title="7. 정보주체의 권리, 의무 및 행사 방법">
                        <p>이용자는 언제든지 다음의 권리를 행사할 수 있습니다.</p>
                        <ul>
                            <li>개인정보 열람 요구</li>
                            <li>개인정보 정정 요구</li>
                            <li>개인정보 삭제 요구</li>
                            <li>개인정보 처리 정지 요구</li>
                        </ul>
                        <p>권리 행사는 이메일(support@trabit.io)을 통해 요청할 수 있으며, 회사는 지체 없이 조치합니다.</p>
                    </Section>

                    <Section title="8. 개인정보의 안전성 확보 조치">
                        <p>회사는 개인정보의 안전성 확보를 위해 다음 조치를 취하고 있습니다.</p>
                        <ul>
                            <li>비밀번호 암호화 저장 (BCrypt)</li>
                            <li>HTTPS 암호화 통신</li>
                            <li>접근 권한 관리 및 제한</li>
                            <li>개인정보 접속 기록 보관</li>
                            <li>데이터베이스 접근 통제</li>
                        </ul>
                    </Section>

                    <Section title="9. 개인정보 보호책임자">
                        <ul>
                            <li><strong>성명:</strong> (추후 지정)</li>
                            <li><strong>이메일:</strong> support@trabit.io</li>
                        </ul>
                        <p>개인정보 관련 문의 사항은 위 이메일로 연락해 주시기 바랍니다.</p>
                    </Section>

                    <Section title="10. 쿠키의 설치, 운영 및 거부">
                        <p>회사는 서비스 이용 편의를 위해 쿠키를 사용할 수 있습니다.</p>
                        <ul>
                            <li><strong>쿠키 사용 목적:</strong> 로그인 상태 유지, 서비스 이용 분석</li>
                            <li><strong>쿠키 거부 방법:</strong> 브라우저 설정에서 쿠키 저장을 거부할 수 있습니다. 다만, 쿠키를 거부할 경우 일부 서비스 이용에 제한이 있을 수 있습니다.</li>
                        </ul>
                    </Section>

                    <Section title="11. 권익침해 구제 방법">
                        <p>개인정보 침해에 대한 상담이 필요한 경우 아래 기관에 문의할 수 있습니다.</p>
                        <ul>
                            <li>개인정보침해 신고센터: (국번없이) 118 / privacy.kisa.or.kr</li>
                            <li>개인정보 분쟁조정위원회: 1833-6972 / kopico.go.kr</li>
                            <li>대검찰청 사이버수사과: (국번없이) 1301 / spo.go.kr</li>
                            <li>경찰청 사이버안전국: (국번없이) 182 / cyberbureau.police.go.kr</li>
                        </ul>
                    </Section>

                    <Section title="12. 개인정보 처리방침 변경">
                        <p>이 개인정보 처리방침은 법령, 정책 또는 보안 기술의 변경에 따라 내용이 변경될 수 있습니다. 변경 시 웹사이트 공지사항을 통해 공지합니다.</p>
                    </Section>

                    <div className="pt-4 text-slate-400 dark:text-slate-500">
                        <p>이 개인정보 처리방침은 2026년 3월 1일부터 적용됩니다.</p>
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
            <div className="text-slate-600 dark:text-slate-400 leading-relaxed space-y-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1 [&_li]:text-sm [&_table]:w-full [&_table]:text-sm [&_table]:border-collapse [&_th]:text-left [&_th]:p-2 [&_th]:border [&_th]:border-slate-200 [&_th]:dark:border-slate-700 [&_th]:bg-slate-50 [&_th]:dark:bg-slate-800 [&_th]:font-medium [&_td]:p-2 [&_td]:border [&_td]:border-slate-200 [&_td]:dark:border-slate-700">
                {children}
            </div>
        </section>
    );
}
