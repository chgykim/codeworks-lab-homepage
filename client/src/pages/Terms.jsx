import React from 'react';
import { useTranslation } from 'react-i18next';
import { FileText } from 'lucide-react';
import './Legal.css';

function Terms() {
    const { t, i18n } = useTranslation();
    const isKorean = i18n.language === 'ko';

    return (
        <div className="legal-page page">
            <div className="container">
                <div className="page-header">
                    <FileText size={48} className="page-icon" />
                    <h1>{t('terms.title')}</h1>
                    <p className="effective-date">{t('terms.effectiveDate')}: 2026-02-03</p>
                </div>

                <div className="legal-content card">
                    {isKorean ? (
                        <>
                            <section className="legal-section">
                                <p className="legal-intro">
                                    본 약관은 CodeWorks Lab(이하 "회사")이 제공하는 모든 서비스(이하 "서비스")의
                                    이용과 관련하여 회사와 이용자 간의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.
                                </p>
                            </section>

                            <section className="legal-section">
                                <h2>제1조 (목적)</h2>
                                <p>
                                    이 약관은 회사가 제공하는 Safe Way 10 라인업 앱 및 관련 서비스의
                                    이용 조건과 절차, 회사와 이용자의 권리와 의무, 책임사항 등을 규정합니다.
                                </p>
                            </section>

                            <section className="legal-section">
                                <h2>제2조 (정의)</h2>
                                <ul>
                                    <li><strong>"서비스"</strong>란 회사가 제공하는 모든 앱 및 웹사이트를 통해 제공되는 모든 서비스를 말합니다.</li>
                                    <li><strong>"이용자"</strong>란 회사의 서비스에 접속하여 이 약관에 따라 서비스를 이용하는 자를 말합니다.</li>
                                    <li><strong>"콘텐츠"</strong>란 서비스 내에서 이용자가 생성, 게시, 저장하는 모든 정보를 말합니다.</li>
                                </ul>
                            </section>

                            <section className="legal-section">
                                <h2>제3조 (약관의 효력 및 변경)</h2>
                                <ul>
                                    <li>이 약관은 서비스를 이용하고자 하는 모든 이용자에게 적용됩니다.</li>
                                    <li>회사는 필요한 경우 약관을 변경할 수 있으며, 변경된 약관은 앱 또는 홈페이지를 통해 공지합니다.</li>
                                    <li>변경된 약관에 동의하지 않는 이용자는 서비스 이용을 중단하고 탈퇴할 수 있습니다.</li>
                                    <li>변경된 약관의 효력 발생일 이후에도 서비스를 계속 이용하는 경우 약관 변경에 동의한 것으로 간주합니다.</li>
                                </ul>
                            </section>

                            <section className="legal-section">
                                <h2>제4조 (서비스의 제공)</h2>
                                <ul>
                                    <li>회사는 안정적인 서비스 제공을 위해 최선을 다합니다.</li>
                                    <li>서비스의 종류, 이용 방법, 이용 시간 등은 회사가 별도로 정하는 바에 따릅니다.</li>
                                    <li>회사는 서비스 개선, 기술적 필요, 운영상의 이유 등으로 서비스의 전부 또는 일부를 변경하거나 중단할 수 있습니다.</li>
                                    <li>정기 점검 및 긴급 점검 등으로 서비스가 일시 중단될 수 있습니다.</li>
                                </ul>
                            </section>

                            <section className="legal-section">
                                <h2>제5조 (이용자의 의무)</h2>
                                <p>이용자는 다음 행위를 하여서는 안 됩니다.</p>
                                <ul>
                                    <li>서비스를 이용하여 법령이나 이 약관을 위반하는 행위</li>
                                    <li>회사 또는 제3자의 지식재산권, 초상권 등 기타 권리를 침해하는 행위</li>
                                    <li>서비스의 정상적인 운영을 방해하는 행위</li>
                                    <li>다른 이용자의 개인정보를 수집하거나 도용하는 행위</li>
                                    <li>서비스를 영리 목적으로 무단 이용하는 행위</li>
                                    <li>기타 불법적이거나 부당한 행위</li>
                                </ul>
                            </section>

                            <section className="legal-section">
                                <h2>제6조 (지식재산권)</h2>
                                <ul>
                                    <li>서비스에 포함된 모든 콘텐츠(텍스트, 이미지, 소프트웨어 등)에 대한 지식재산권은 회사에 귀속됩니다.</li>
                                    <li>이용자가 서비스 내에 게시한 콘텐츠의 저작권은 해당 이용자에게 귀속됩니다.</li>
                                    <li>이용자는 회사의 사전 서면 동의 없이 서비스의 콘텐츠를 복제, 배포, 수정할 수 없습니다.</li>
                                </ul>
                            </section>

                            <section className="legal-section">
                                <h2>제7조 (유료 서비스 및 결제)</h2>
                                <ul>
                                    <li>일부 서비스는 유료로 제공될 수 있으며, 이용 요금 및 결제 방법은 해당 서비스 내에 별도로 안내합니다.</li>
                                    <li>유료 서비스 이용 후 환불은 관계 법령 및 회사의 환불 정책에 따릅니다.</li>
                                    <li>구독 서비스의 경우, 이용자가 해지하지 않는 한 자동으로 갱신될 수 있습니다.</li>
                                </ul>
                            </section>

                            <section className="legal-section">
                                <h2>제8조 (면책조항)</h2>
                                <ul>
                                    <li>회사는 천재지변, 전쟁, 기간통신사업자의 서비스 중지 등 불가항력적 사유로 인해 서비스를 제공할 수 없는 경우 책임을 지지 않습니다.</li>
                                    <li>회사는 이용자의 귀책사유로 인한 서비스 이용 장애에 대해 책임을 지지 않습니다.</li>
                                    <li>회사는 이용자가 서비스를 통해 얻은 정보의 정확성, 신뢰성에 대해 보증하지 않습니다.</li>
                                    <li>회사는 이용자 간 또는 이용자와 제3자 간에 발생한 분쟁에 대해 개입할 의무가 없으며, 이로 인한 손해에 대해 책임을 지지 않습니다.</li>
                                </ul>
                            </section>

                            <section className="legal-section">
                                <h2>제9조 (손해배상)</h2>
                                <ul>
                                    <li>회사 또는 이용자가 이 약관을 위반하여 상대방에게 손해를 입힌 경우, 그 손해를 배상할 책임이 있습니다.</li>
                                    <li>다만, 고의 또는 중과실이 없는 경우 책임이 제한될 수 있습니다.</li>
                                </ul>
                            </section>

                            <section className="legal-section">
                                <h2>제10조 (분쟁해결)</h2>
                                <ul>
                                    <li>본 약관과 관련하여 발생한 분쟁에 대해서는 대한민국 법률을 적용합니다.</li>
                                    <li>서비스 이용과 관련하여 회사와 이용자 사이에 분쟁이 발생한 경우, 양 당사자는 원만한 해결을 위해 성실히 협의합니다.</li>
                                    <li>협의가 이루어지지 않을 경우, 관할 법원은 민사소송법에 따른 법원으로 합니다.</li>
                                </ul>
                            </section>

                            <section className="legal-section">
                                <h2>제11조 (문의)</h2>
                                <p>
                                    서비스 이용에 관한 문의는 본 홈페이지의 가이드 페이지 문의 양식을 통해 접수하실 수 있습니다.
                                </p>
                            </section>

                            <section className="legal-section">
                                <h2>부칙</h2>
                                <p>이 약관은 2026년 2월 3일부터 시행됩니다.</p>
                            </section>
                        </>
                    ) : (
                        <>
                            <section className="legal-section">
                                <p className="legal-intro">
                                    These Terms of Service ("Terms") govern your use of all services ("Service")
                                    provided by CodeWorks Lab ("Company"). By using our Service, you agree to these Terms.
                                </p>
                            </section>

                            <section className="legal-section">
                                <h2>1. Purpose</h2>
                                <p>
                                    These Terms establish the conditions and procedures for using the Safe Way 10 lineup apps
                                    and related services, as well as the rights, obligations, and responsibilities of the Company and users.
                                </p>
                            </section>

                            <section className="legal-section">
                                <h2>2. Definitions</h2>
                                <ul>
                                    <li><strong>"Service"</strong> refers to all services provided through apps and websites operated by the Company.</li>
                                    <li><strong>"User"</strong> refers to anyone who accesses and uses the Service in accordance with these Terms.</li>
                                    <li><strong>"Content"</strong> refers to all information created, posted, or stored by users within the Service.</li>
                                </ul>
                            </section>

                            <section className="legal-section">
                                <h2>3. Effect and Modification of Terms</h2>
                                <ul>
                                    <li>These Terms apply to all users who wish to use the Service.</li>
                                    <li>The Company may modify these Terms if necessary, and changes will be announced through the app or website.</li>
                                    <li>Users who do not agree to the modified Terms may discontinue use and withdraw from the Service.</li>
                                    <li>Continued use of the Service after the effective date of changes constitutes acceptance of the modified Terms.</li>
                                </ul>
                            </section>

                            <section className="legal-section">
                                <h2>4. Provision of Service</h2>
                                <ul>
                                    <li>The Company strives to provide stable service.</li>
                                    <li>Service types, usage methods, and hours are determined by the Company.</li>
                                    <li>The Company may modify or discontinue all or part of the Service for improvement, technical necessity, or operational reasons.</li>
                                    <li>The Service may be temporarily suspended for regular or emergency maintenance.</li>
                                </ul>
                            </section>

                            <section className="legal-section">
                                <h2>5. User Obligations</h2>
                                <p>Users shall not engage in the following:</p>
                                <ul>
                                    <li>Violating laws or these Terms through use of the Service</li>
                                    <li>Infringing on intellectual property rights, portrait rights, or other rights of the Company or third parties</li>
                                    <li>Interfering with normal operation of the Service</li>
                                    <li>Collecting or misusing other users' personal information</li>
                                    <li>Unauthorized commercial use of the Service</li>
                                    <li>Other illegal or improper activities</li>
                                </ul>
                            </section>

                            <section className="legal-section">
                                <h2>6. Intellectual Property</h2>
                                <ul>
                                    <li>Intellectual property rights for all content included in the Service (text, images, software, etc.) belong to the Company.</li>
                                    <li>Copyright for content posted by users within the Service belongs to the respective users.</li>
                                    <li>Users may not reproduce, distribute, or modify Service content without prior written consent from the Company.</li>
                                </ul>
                            </section>

                            <section className="legal-section">
                                <h2>7. Paid Services and Payment</h2>
                                <ul>
                                    <li>Some services may be provided for a fee. Pricing and payment methods are specified within each service.</li>
                                    <li>Refunds for paid services follow applicable laws and the Company's refund policy.</li>
                                    <li>Subscription services may automatically renew unless cancelled by the user.</li>
                                </ul>
                            </section>

                            <section className="legal-section">
                                <h2>8. Disclaimer</h2>
                                <ul>
                                    <li>The Company is not liable for inability to provide Service due to force majeure such as natural disasters, war, or telecommunications service interruptions.</li>
                                    <li>The Company is not liable for service disruptions caused by user negligence.</li>
                                    <li>The Company does not guarantee the accuracy or reliability of information obtained through the Service.</li>
                                    <li>The Company has no obligation to intervene in disputes between users or between users and third parties, and is not liable for resulting damages.</li>
                                </ul>
                            </section>

                            <section className="legal-section">
                                <h2>9. Liability for Damages</h2>
                                <ul>
                                    <li>If the Company or a user violates these Terms and causes damage to the other party, they are liable for compensation.</li>
                                    <li>However, liability may be limited in cases without intent or gross negligence.</li>
                                </ul>
                            </section>

                            <section className="legal-section">
                                <h2>10. Dispute Resolution</h2>
                                <ul>
                                    <li>Disputes arising in connection with these Terms shall be governed by the laws of the Republic of Korea.</li>
                                    <li>In case of disputes between the Company and users, both parties shall negotiate in good faith for amicable resolution.</li>
                                    <li>If negotiation fails, jurisdiction shall be with the court as provided by the Civil Procedure Act.</li>
                                </ul>
                            </section>

                            <section className="legal-section">
                                <h2>11. Contact</h2>
                                <p>
                                    For inquiries regarding Service use, please submit through the contact form on our Guide page.
                                </p>
                            </section>

                            <section className="legal-section">
                                <h2>Supplementary Provisions</h2>
                                <p>These Terms are effective as of February 3, 2026.</p>
                            </section>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Terms;
