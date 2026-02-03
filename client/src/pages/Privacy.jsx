import React from 'react';
import { useTranslation } from 'react-i18next';
import { Shield } from 'lucide-react';
import './Legal.css';

function Privacy() {
    const { t, i18n } = useTranslation();
    const isKorean = i18n.language === 'ko';

    return (
        <div className="legal-page page">
            <div className="container">
                <div className="page-header">
                    <Shield size={48} className="page-icon" />
                    <h1>{t('privacy.title')}</h1>
                    <p className="effective-date">{t('privacy.effectiveDate')}: 2026-02-03</p>
                </div>

                <div className="legal-content card">
                    {isKorean ? (
                        <>
                            <section className="legal-section">
                                <p className="legal-intro">
                                    CodeWorks Lab(이하 "회사")은 「개인정보 보호법」 등 관련 법령을 준수하며,
                                    이용자의 개인정보를 보호하고 이와 관련한 고충을 신속하고 원활하게 처리할 수 있도록
                                    다음과 같이 개인정보 처리방침을 수립·공개합니다.
                                </p>
                            </section>

                            <section className="legal-section">
                                <h2>제1조 (수집하는 개인정보)</h2>
                                <p>회사는 서비스 제공을 위해 다음과 같은 개인정보를 수집할 수 있습니다.</p>
                                <ul>
                                    <li>앱 사용 중 자동으로 생성되는 로그 정보</li>
                                    <li>오류 분석을 위한 기기 정보 (운영체제 버전, 기기 모델 등)</li>
                                    <li>사용자가 직접 입력한 정보 (문의 시 이름, 이메일 등)</li>
                                    <li>리뷰 작성 시 입력하는 닉네임 및 이메일 (선택)</li>
                                </ul>
                            </section>

                            <section className="legal-section">
                                <h2>제2조 (개인정보의 수집 및 이용 목적)</h2>
                                <p>수집된 개인정보는 다음의 목적에 한하여 이용됩니다.</p>
                                <ul>
                                    <li>서비스 제공 및 기능 개선</li>
                                    <li>오류 분석 및 서비스 안정성 향상</li>
                                    <li>고객 문의 대응 및 민원 처리</li>
                                    <li>서비스 이용 통계 분석</li>
                                </ul>
                            </section>

                            <section className="legal-section">
                                <h2>제3조 (개인정보의 보유 및 이용 기간)</h2>
                                <ul>
                                    <li>개인정보는 수집 및 이용 목적 달성 시 지체 없이 파기합니다.</li>
                                    <li>단, 관계 법령에 따라 보존이 필요한 경우 해당 기간 동안 안전하게 보관합니다.</li>
                                    <li>전자상거래 등에서의 소비자 보호에 관한 법률에 따른 보존 기간:
                                        <ul>
                                            <li>계약 또는 청약철회 등에 관한 기록: 5년</li>
                                            <li>소비자 불만 또는 분쟁처리에 관한 기록: 3년</li>
                                        </ul>
                                    </li>
                                </ul>
                            </section>

                            <section className="legal-section">
                                <h2>제4조 (개인정보의 제3자 제공)</h2>
                                <p>
                                    회사는 이용자의 개인정보를 원칙적으로 제3자에게 제공하지 않습니다.
                                    다만, 다음의 경우에는 예외로 합니다.
                                </p>
                                <ul>
                                    <li>이용자가 사전에 동의한 경우</li>
                                    <li>법령의 규정에 의거하거나, 수사 목적으로 법령에 정해진 절차와 방법에 따라 수사기관의 요구가 있는 경우</li>
                                </ul>
                            </section>

                            <section className="legal-section">
                                <h2>제5조 (외부 서비스 이용)</h2>
                                <p>회사는 서비스 개선을 위해 다음 외부 서비스를 이용할 수 있습니다.</p>
                                <ul>
                                    <li>Firebase Analytics (앱 사용 통계)</li>
                                    <li>Firebase Crashlytics (오류 분석)</li>
                                    <li>Google Gemini API (AI 기능)</li>
                                </ul>
                                <p>
                                    각 서비스의 개인정보 처리에 관한 사항은 해당 서비스의 개인정보 처리방침을 참조하시기 바랍니다.
                                </p>
                            </section>

                            <section className="legal-section">
                                <h2>제6조 (개인정보의 파기)</h2>
                                <p>
                                    회사는 개인정보 보유 기간의 경과, 처리 목적 달성 등 개인정보가 불필요하게 되었을 때에는
                                    지체 없이 해당 개인정보를 파기합니다.
                                </p>
                                <ul>
                                    <li>전자적 파일 형태: 복구 및 재생이 불가능하도록 안전하게 삭제</li>
                                    <li>기록물, 인쇄물, 서면 등: 분쇄하거나 소각하여 파기</li>
                                </ul>
                            </section>

                            <section className="legal-section">
                                <h2>제7조 (이용자의 권리와 행사 방법)</h2>
                                <p>이용자는 언제든지 다음의 개인정보 보호 관련 권리를 행사할 수 있습니다.</p>
                                <ul>
                                    <li>개인정보 열람 요구</li>
                                    <li>개인정보 정정 요구</li>
                                    <li>개인정보 삭제 요구</li>
                                    <li>개인정보 처리 정지 요구</li>
                                </ul>
                                <p>
                                    권리 행사는 본 홈페이지의 가이드 페이지 문의 양식을 통해 요청하실 수 있습니다.
                                </p>
                            </section>

                            <section className="legal-section">
                                <h2>제8조 (개인정보의 안전성 확보 조치)</h2>
                                <p>회사는 개인정보의 안전성 확보를 위해 다음과 같은 조치를 취하고 있습니다.</p>
                                <ul>
                                    <li>개인정보의 암호화</li>
                                    <li>해킹 등에 대비한 기술적 대책</li>
                                    <li>개인정보 취급 직원의 최소화 및 교육</li>
                                </ul>
                            </section>

                            <section className="legal-section">
                                <h2>제9조 (개인정보 보호책임자)</h2>
                                <p>
                                    회사는 개인정보 처리에 관한 업무를 총괄해서 책임지고,
                                    개인정보 처리와 관련한 이용자의 불만 처리 및 피해 구제 등을 위하여
                                    아래와 같이 개인정보 보호책임자를 지정하고 있습니다.
                                </p>
                                <div className="contact-info">
                                    <p><strong>개인정보 보호책임자</strong></p>
                                    <p>성명: 김창규</p>
                                    <p>직책: 대표</p>
                                    <p>문의: 홈페이지 가이드 페이지 문의 양식</p>
                                </div>
                            </section>

                            <section className="legal-section">
                                <h2>제10조 (개인정보 처리방침 변경)</h2>
                                <p>
                                    이 개인정보 처리방침은 시행일로부터 적용되며,
                                    법령 및 방침에 따른 변경 내용의 추가, 삭제 및 정정이 있는 경우에는
                                    변경사항의 시행 7일 전부터 공지사항을 통하여 고지할 것입니다.
                                </p>
                            </section>
                        </>
                    ) : (
                        <>
                            <section className="legal-section">
                                <p className="legal-intro">
                                    CodeWorks Lab ("Company") complies with applicable privacy laws and regulations
                                    and is committed to protecting users' personal information. This Privacy Policy
                                    explains how we collect, use, and protect your information.
                                </p>
                            </section>

                            <section className="legal-section">
                                <h2>1. Information We Collect</h2>
                                <p>We may collect the following types of information:</p>
                                <ul>
                                    <li>Log information automatically generated during app usage</li>
                                    <li>Device information for error analysis (OS version, device model, etc.)</li>
                                    <li>Information you directly provide (name, email for inquiries)</li>
                                    <li>Nickname and email (optional) when writing reviews</li>
                                </ul>
                            </section>

                            <section className="legal-section">
                                <h2>2. Purpose of Collection and Use</h2>
                                <p>Collected information is used only for the following purposes:</p>
                                <ul>
                                    <li>Service provision and feature improvement</li>
                                    <li>Error analysis and service stability enhancement</li>
                                    <li>Customer inquiry response and complaint handling</li>
                                    <li>Service usage statistics analysis</li>
                                </ul>
                            </section>

                            <section className="legal-section">
                                <h2>3. Retention Period</h2>
                                <ul>
                                    <li>Personal information is deleted without delay when the purpose of collection is achieved.</li>
                                    <li>However, if retention is required by applicable laws, it will be safely stored for the required period.</li>
                                    <li>Records related to contracts or withdrawal: 5 years</li>
                                    <li>Records related to consumer complaints or disputes: 3 years</li>
                                </ul>
                            </section>

                            <section className="legal-section">
                                <h2>4. Third-Party Disclosure</h2>
                                <p>
                                    We do not provide personal information to third parties in principle.
                                    Exceptions are made only in the following cases:
                                </p>
                                <ul>
                                    <li>When the user has given prior consent</li>
                                    <li>When required by law or requested by investigative authorities following legal procedures</li>
                                </ul>
                            </section>

                            <section className="legal-section">
                                <h2>5. External Services</h2>
                                <p>We may use the following external services for service improvement:</p>
                                <ul>
                                    <li>Firebase Analytics (app usage statistics)</li>
                                    <li>Firebase Crashlytics (error analysis)</li>
                                    <li>Google Gemini API (AI features)</li>
                                </ul>
                                <p>
                                    Please refer to each service's privacy policy for their data handling practices.
                                </p>
                            </section>

                            <section className="legal-section">
                                <h2>6. Data Deletion</h2>
                                <p>
                                    We delete personal information without delay when the retention period expires
                                    or the purpose of processing is achieved.
                                </p>
                                <ul>
                                    <li>Electronic files: Securely deleted to prevent recovery</li>
                                    <li>Physical documents: Shredded or incinerated</li>
                                </ul>
                            </section>

                            <section className="legal-section">
                                <h2>7. Your Rights</h2>
                                <p>You may exercise the following rights at any time:</p>
                                <ul>
                                    <li>Request to access personal information</li>
                                    <li>Request to correct personal information</li>
                                    <li>Request to delete personal information</li>
                                    <li>Request to stop processing personal information</li>
                                </ul>
                                <p>
                                    You can submit requests through the contact form on our Guide page.
                                </p>
                            </section>

                            <section className="legal-section">
                                <h2>8. Security Measures</h2>
                                <p>We implement the following measures to ensure the security of personal information:</p>
                                <ul>
                                    <li>Encryption of personal information</li>
                                    <li>Technical measures against hacking</li>
                                    <li>Minimizing and training personnel handling personal information</li>
                                </ul>
                            </section>

                            <section className="legal-section">
                                <h2>9. Privacy Officer</h2>
                                <p>
                                    For inquiries regarding personal information processing, please contact us
                                    through the contact form on our Guide page.
                                </p>
                                <div className="contact-info">
                                    <p><strong>Privacy Officer</strong></p>
                                    <p>Name: Changkyu Kim</p>
                                    <p>Position: CEO</p>
                                    <p>Contact: Guide page contact form</p>
                                </div>
                            </section>

                            <section className="legal-section">
                                <h2>10. Policy Changes</h2>
                                <p>
                                    This Privacy Policy is effective as of the date stated above.
                                    Any changes will be announced through our website at least 7 days before taking effect.
                                </p>
                            </section>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Privacy;
