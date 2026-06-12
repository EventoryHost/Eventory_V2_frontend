'use client';
import { motion } from 'framer-motion';

const sv = { initial: { x: 20, opacity: 0 }, animate: { x: 0, opacity: 1 }, exit: { x: -20, opacity: 0 } };

interface Props {
    hasAcceptedTerms: boolean;
    setHasAcceptedTerms: (v: boolean) => void;
}

export function StepTerms({ hasAcceptedTerms, setHasAcceptedTerms }: Props) {
    return (
        <motion.div key="step13" {...sv} className="space-y-6 pb-10">
            <div className="space-y-2">
                <h1 className="text-[#030303] text-[24px] font-semibold leading-[32px] font-figtree">
                    Terms of Service
                </h1>
                <p className="text-[#71717B] text-[13px] font-medium font-figtree">
                    Last updated on October 2024
                </p>
            </div>

            <div className="text-[13px] text-[#3F3F47] leading-[20px] font-figtree select-text space-y-4">
                <p className="font-semibold">AGREEMENT TO OUR LEGAL TERMS</p>
                <p>
                    We are EVENTORY TECH SOLUTIONS PRIVATE LIMITED, doing business as Eventory (&apos;Company&apos;, &apos;we&apos;, &apos;us&apos;, or &apos;our&apos;), a company registered in India at 13 D, Atmaram House, 1-Tolstoy Marg, Connaught Place, New Delhi, Delhi 110001.
                </p>
                <p>
                    We operate the website <a href="https://eventory.in" target="_blank" rel="noopener noreferrer" className="text-[#04222D] underline font-medium">https://eventory.in</a> (the &apos;Site&apos;), the mobile application Eventory Business (the &apos;App&apos;), as well as any other related products and services that refer or link to these legal terms (the &apos;Legal Terms&apos;) (collectively, the &apos;Services&apos;).
                </p>
                <p>
                    Eventory is a comprehensive online platform that revolutionises the way events are planned and managed. Whether you&apos;re organising a wedding, corporate event, birthday party, or any special occasion, Eventory serves as your one-stop solution for all your event planning needs. Our platform connects event organizers with a diverse network of top-rated vendors, including venues, caterers, decorators, photographers, entertainers, and more. Eventory offers a seamless and user-friendly experience, allowing users to browse, compare, and book services that perfectly match their event requirements. With a focus on customisation, we provide tailored packages that cater to various themes, budgets, and preferences. Our platform not only simplifies the event planning process but also enhances it by offering expert recommendations, ensuring that every detail is meticulously planned and executed. In addition to vendor management, Eventory empowers vendors by giving them a dedicated space to showcase their services, reach a wider audience, and grow their business. With advanced features such as real-time booking management, customer reviews, and analytics, Eventory is designed to make event planning stress-free, efficient, and enjoyable for both organizers and vendors alike.
                </p>
                <p>
                    You can contact us by phone at (+91)8800725840, email at <a href="mailto:support@eventory.in" className="text-[#04222D] underline font-medium">support@eventory.in</a>, or by mail to 13 D, Atmaram House, 1-Tolstoy Marg, Connaught Place, New Delhi, Delhi 110001, India.
                </p>
                <p>
                    These Legal Terms constitute a legally binding agreement made between you, whether personally or on behalf of an entity (&apos;you&apos;), and EVENTORY TECH SOLUTIONS PRIVATE LIMITED, concerning your access to and use of the Services. You agree that by accessing the Services, you have read, understood, and agreed to be bound by all of these Legal Terms. IF YOU DO NOT AGREE WITH ALL OF THESE LEGAL TERMS, THEN YOU ARE EXPRESSLY PROHIBITED FROM USING THE SERVICES AND YOU MUST DISCONTINUE USE IMMEDIATELY.
                </p>
                <p>
                    We will provide you with prior notice of any scheduled changes to the Services you are using. Changes to Legal Terms will become effective two (2) days after the notice is given, except if the changes apply to new functionality and bug fixes, in which case the changes will be effective immediately. By continuing to use the Services after the effective date of any changes, you agree to be bound by the modified terms. If you disagree with such changes, you may terminate Services as per the section &apos;TERM AND TERMINATION&apos;.
                </p>
                <p>
                    The Services are intended for users who are at least 13 years of age. All users who are minors in the jurisdiction in which they reside (generally under the age of 18) must have the permission of, and be directly supervised by, their parent or guardian to use the Services. If you are a minor, you must have your parent or guardian read and agree to these Legal Terms prior to you using the Services.
                </p>
                <p>
                    We recommend that you print a copy of these Legal Terms for your records.
                </p>
                
                <div className="font-semibold pt-2">TABLE OF CONTENTS</div>
                <div className="pl-2 space-y-0.5">
                    <div>1. OUR SERVICES</div>
                    <div>2. INTELLECTUAL PROPERTY RIGHTS</div>
                    <div>3. USER REPRESENTATIONS</div>
                    <div>4. USER REGISTRATION</div>
                    <div>5. PURCHASES AND PAYMENT</div>
                    <div>6. SUBSCRIPTIONS</div>
                    <div>7. POLICY</div>
                    <div>8. PROHIBITED ACTIVITIES</div>
                    <div>9. USER GENERATED CONTRIBUTIONS</div>
                    <div>10. CONTRIBUTION LICENCE</div>
                    <div>11. GUIDELINES FOR REVIEWS</div>
                    <div>12. MOBILE APPLICATION LICENCE</div>
                    <div>13. SOCIAL MEDIA</div>
                    <div>14. THIRD-PARTY WEBSITES AND CONTENT</div>
                    <div>15. SERVICES MANAGEMENT</div>
                    <div>16. PRIVACY POLICY</div>
                    <div>17. COPYRIGHT INFRINGEMENTS</div>
                    <div>18. TERM AND TERMINATION</div>
                    <div>19. MODIFICATIONS AND INTERRUPTIONS</div>
                    <div>20. GOVERNING LAW</div>
                    <div>21. DISPUTE RESOLUTION</div>
                    <div>22. CORRECTIONS</div>
                    <div>23. DISCLAIMER</div>
                    <div>24. LIMITATIONS OF LIABILITY</div>
                    <div>25. INDEMNIFICATION</div>
                    <div>26. USER DATA</div>
                    <div>27. ELECTRONIC COMMUNICATIONS, TRANSACTIONS, AND SIGNATURES</div>
                    <div>28. SMS TEXT MESSAGING</div>
                    <div>29. MISCELLANEOUS</div>
                    <div>30. CONTACT US</div>
                </div>

                <p className="font-semibold pt-2">1. OUR SERVICES</p>
                <p>
                    The information provided when using the Services is not intended for distribution to or use by any person or entity in any jurisdiction or country where such distribution or use would be contrary to law or regulation or which would subject us to any registration requirement within such jurisdiction or country. Accordingly, those persons who choose to access the Services from other locations do so on their own initiative and are solely responsible for compliance with local laws, if and to the extent local laws are applicable.
                </p>

                <p className="font-semibold pt-2">2. INTELLECTUAL PROPERTY RIGHTS</p>
                <p className="underline">Our intellectual property</p>
                <p>
                    We are the owner or the licensee of all intellectual property rights in our Services, including all source code, databases, functionality, software, website designs, audio, video, text, photographs, and graphics in the Services (collectively, the &apos;Content&apos;), as well as the trademarks, service marks, and logos contained therein (the &apos;Marks&apos;). Our Content and Marks are protected by copyright and trademark laws (and various other intellectual property rights and unfair competition laws) and treaties around the world.
                </p>
                <p>
                    The Content and Marks are provided in or through the Services &apos;AS IS&apos; for your personal, non-commercial use or internal business purpose only. Your use of our Services is Subject to your compliance with these Legal Terms, including the &apos;PROHIBITED ACTIVITIES&apos; section below, we grant you a non-exclusive, non-transferable, revocable licence to:
                </p>
                <ul className="list-disc pl-5 space-y-1">
                    <li>access the Services and</li>
                    <li>download or print a copy of any portion of the Content to which you have properly gained access, solely for your personal, non-commercial use or internal business purpose.</li>
                </ul>
                <p>
                    Except as set out in this section or elsewhere in our Legal Terms, no part of the Services and no Content or Marks may be copied, reproduced, aggregated, republished, uploaded, posted, publicly displayed, encoded, translated, transmitted, distributed, sold, licensed, or otherwise exploited for any commercial purpose whatsoever, without our express prior written permission.
                </p>
                <p>
                    If you wish to make any use of the Services, Content, or Marks other than as set out in this section or elsewhere in our Legal Terms, please address your request to: <a href="mailto:support@eventory.in" className="text-[#04222D] underline font-medium">support@eventory.in</a>. If we ever grant you the permission to post, reproduce, or publicly display any part of our Services or Content, you must identify us as the owners or licensors of the Services, Content, or Marks and ensure that any copyright or proprietary notice appears or is visible on posting, reproducing, or displaying our Content.
                </p>
                <p>
                    We reserve all rights not expressly granted to you in and to the Services, Content, and Marks.
                </p>
                <p>
                    Any breach of these Intellectual Property Rights will constitute a material breach of our Legal Terms and your right to use our Services will terminate immediately.
                </p>

                <p className="underline pt-2">Your submissions and contributions</p>
                <p>
                    Please review this section and the &apos;PROHIBITED ACTIVITIES&apos; section carefully prior to using our Services to understand the (a) rights you give us and (b) obligations you have when you post or upload any content through the Services.
                </p>
                <p>
                    <strong>Submissions:</strong> By directly sending us any question, comment, suggestion, idea, feedback, or other information about the Services (&apos;Submissions&apos;), you agree to assign to us all intellectual property rights in such Submission. You agree that we shall own this Submission and be entitled to its unrestricted use and dissemination for any lawful purpose, commercial or otherwise, without acknowledgment or compensation to you.
                </p>
                <p>
                    <strong>Contributions:</strong> The Services may invite you to chat, contribute to, or participate in blogs, message boards, online forums, and other functionality during which you may create, submit, post, display, transmit, publish, distribute, or broadcast content and materials to us or through the Services, including but not limited to text, writings, video, audio, photographs, music, graphics, comments, reviews, rating suggestions, personal information, or other material (&apos;Contributions&apos;). Any Submission that is publicly posted shall also be treated as a Contribution.
                </p>
                <p>
                    You understand that Contributions may be viewable by other users of the Services and possibly through third-party websites.
                </p>
                <p>
                    <strong>When you post Contributions, you grant us a licence (including use of your name, trademarks, and logos):</strong> By posting any Contributions, you grant us an unrestricted, unlimited, irrevocable, perpetual, non-exclusive, transferable, royalty-free, fully-paid, worldwide right, and licence to: use, copy, reproduce, distribute, sell, resell, publish, broadcast, retitle, store, publicly perform, publicly display, reformat, translate, excerpt (in whole or in part), and exploit your Contributions (including, without limitation, your image, name, and voice) for any purpose, commercial, advertising, or otherwise, to prepare derivative works of, or incorporate into other works, your Contributions, and to sublicense the licences granted in this section. Our use and distribution may occur in any media formats and through any media channels.
                </p>
                <p>
                    This licence includes our use of your name, company name, and franchise name, as applicable, and any of the trademarks, service marks, trade names, logos, and personal and commercial images you provide.
                </p>
                <p>
                    <strong>You are responsible for what you post or upload:</strong> By sending us Submissions and/or posting Contributions through any part of the Services or making Contributions accessible through the Services by linking your account through the Services to any of your social networking accounts, you:
                </p>
                <ul className="list-disc pl-5 space-y-1">
                    <li>confirm that you have read and agree with our &apos;PROHIBITED ACTIVITIES&apos; and will not post, send, publish, upload, or transmit through the Services any Submission nor post any Contribution that is illegal, harassing, hateful, harmful, defamatory, obscene, bullying, abusive, discriminatory, threatening to any person or group, sexually explicit, false, inaccurate, deceitful, or misleading;</li>
                    <li>to the extent permissible by applicable law, waive any and all moral rights to any such Submission and/or Contribution;</li>
                    <li>warrant that any such Submission and/or Contributions are original to you or that you have the necessary rights and licences to submit such Submissions and/or Contributions and that you have full authority to grant us the above-mentioned rights in relation to your Submissions and/or Contributions; and</li>
                    <li>warrant and represent that your Submissions and/or Contributions do not constitute confidential information.</li>
                </ul>
                <p>
                    You are solely responsible for your Submissions and/or Contributions and you expressly agree to reimburse us for any and all losses that we may suffer because of your breach of (a) this section, (b) any third party&apos;s intellectual property rights, or (c) applicable law.
                </p>
                <p>
                    <strong>We may remove or edit your Content:</strong> Although we have no obligation to monitor any Contributions, we shall have the right to remove or edit any Contributions at any time without notice if in our reasonable opinion we consider such Contributions harmful or in breach of these Legal Terms. If we remove or edit any such Contributions, we may also suspend or disable your account and report you to the authorities.
                </p>
                <p>
                    <strong>Copyright infringement:</strong> We respect the intellectual property rights of others. If you believe that any material available on or through the Services infringes upon any copyright you own or control, please immediately refer to the &apos;COPYRIGHT INFRINGEMENTS&apos; section below.
                </p>

                <p className="font-semibold pt-2">3. USER REPRESENTATIONS</p>
                <p>
                    By using the Services, you represent and warrant that: (1) all registration information you submit will be true, accurate, current, and complete; (2) you will maintain the accuracy of such information and promptly update such registration information as necessary; (3) you have the legal capacity and you agree to comply with these Legal Terms; (4) you are not under the age of 13; (5) you are not a minor in the jurisdiction in which you reside, or if a minor, you have received parental permission to use the Services; (6) you will not access the Services through automated or non-human means, whether through a bot, script or otherwise; (7) you will not use the Services for any illegal or unauthorised purpose; and (8) your use of the Services will not violate any applicable law or regulation.
                </p>
                <p>
                    If you provide any information that is untrue, inaccurate, not current, or incomplete, we have the right to suspend or terminate your account and refuse any and all current or future use of the Services (or any portion thereof).
                </p>

                <p className="font-semibold pt-2">4. USER REGISTRATION</p>
                <p>
                    You may be required to register to use the Services. You agree to keep your password confidential and will be responsible for all use of your account and password. We reserve the right to remove, reclaim, or change a username you select if we determine, in our sole discretion, that such username is inappropriate, obscene, or otherwise objectionable.
                </p>

                <p className="font-semibold pt-2">5. PURCHASES AND PAYMENT</p>
                <p>We accept the following forms of payment:</p>
                <ul className="list-disc pl-5 space-y-0.5">
                    <li>Visa</li>
                    <li>Mastercard</li>
                    <li>UPI</li>
                    <li>Netbanking</li>
                    <li>American Express</li>
                </ul>
                <p>
                    You agree to provide current, complete, and accurate purchase and account information for all purchases made via the Services. You further agree to promptly update account and payment information, including email address, payment method, and payment card expiration date, so that we can complete your transactions and contact you as needed. Sales tax will be added to the price of purchases as deemed required by us. We may change prices at any time. All payments shall be in Indian Rupees.
                </p>
                <p>
                    You agree to pay all charges at the prices then in effect for your purchases and any applicable shipping fees, and you authorise us to charge your chosen payment provider for any such amounts upon placing your order. We reserve the right to correct any errors or mistakes in pricing, even if we have already requested or received payment.
                </p>
                <p>
                    We reserve the right to refuse any order placed through the Services. We may, in our sole discretion, limit or cancel quantities purchased per person, per household, or per order. These restrictions may include orders placed by or under the same customer account, the same payment method, and/or orders that use the same billing or shipping address. We reserve the right to limit or prohibit orders that, in our sole judgement, appear to be placed by dealers, resellers, or distributors.
                </p>

                <p className="font-semibold pt-2">6. SUBSCRIPTIONS</p>
                <p className="underline">Billing and Renewal</p>
                <p>
                    Your subscription will continue and automatically renew unless cancelled. You consent to our charging your payment method on a recurring basis without requiring your prior approval for each recurring charge, until such time as you cancel the applicable order. The length of your billing cycle will depend on the type of subscription plan you choose when you subscribed to the Services.
                </p>
                <p className="underline">Free Trial</p>
                <p>
                    We offer a 60-day free trial to new users who register with the Services. The account will not be charged and the subscription will be suspended until upgraded to a paid version at the end of the free trial.
                </p>
                <p className="underline">Cancellation</p>
                <p>
                    You can cancel your subscription at any time by logging into your account. Your cancellation will take effect at the end of the current paid term. If you have any questions or are unsatisfied with our Services, please email us at <a href="mailto:support@eventory.in" className="text-[#04222D] underline font-medium">support@eventory.in</a>.
                </p>
                <p className="underline">Fee Changes</p>
                <p>
                    We may, from time to time, make changes to the subscription fee and will communicate any price changes to you in accordance with applicable law.
                </p>

                <p className="font-semibold pt-2">7. POLICY</p>
                <p>Please review our Return Policy posted on the Services prior to making any purchases.</p>

                <p className="font-semibold pt-2">8. PROHIBITED ACTIVITIES</p>
                <p>
                    You may not access or use the Services for any purpose other than that for which we make the Services available. The Services may not be used in connection with any commercial endeavours except those that are specifically endorsed or approved by us.
                </p>
                <p>As a user of the Services, you agree not to:</p>
                <ul className="list-disc pl-5 space-y-1">
                    <li>Systematically retrieve data or other content from the Services to create or compile, directly or indirectly, a collection, compilation, database, or directory without written permission from us.</li>
                    <li>Trick, defraud, or mislead us and other users, especially in any attempt to learn sensitive account information such as user passwords.</li>
                    <li>Circumvent, disable, or otherwise interfere with security-related features of the Services, including features that prevent or restrict the use or copying of any Content or enforce limitations on the use of the Services and/or the Content contained therein.</li>
                    <li>Disparage, tarnish, or otherwise harm, in our opinion, us and/or the Services.</li>
                    <li>Use any information obtained from the Services in order to harass, abuse, or harm another person.</li>
                    <li>Make improper use of our support services or submit false reports of abuse or misconduct.</li>
                    <li>Use the Services in a manner inconsistent with any applicable laws or regulations.</li>
                    <li>Engage in unauthorised framing of or linking to the Services.</li>
                    <li>Upload or transmit (or attempt to upload or to transmit) viruses, Trojan horses, or other material, including excessive use of capital letters and spamming (continuous posting of repetitive text), that interferes with any party&apos;s uninterrupted use and enjoyment of the Services or modifies, impairs, disrupts, alters, or interferes with the use, features, functions, operation, or maintenance of the Services.</li>
                    <li>Engage in any automated use of the system, such as using scripts to send comments or messages, or using any data mining, robots, or similar data gathering and extraction tools.</li>
                    <li>Delete the copyright or other proprietary rights notice from any Content.</li>
                    <li>Attempt to impersonate another user or person or use the username of another user.</li>
                    <li>Upload or transmit (or attempt to upload or to transmit) any material that acts as a passive or active information collection or transmission mechanism, including without limitation, clear graphics interchange formats (&apos;gifs&apos;), 1*1 pixels, web bugs, cookies, or other similar devices (sometimes referred to as &apos;spyware&apos; or &apos;passive collection mechanisms&apos; or &apos;pems&apos;).</li>
                    <li>Interfere with, disrupt, or create an undue burden on the Services or the networks or services connected to the Services.</li>
                    <li>Harass, annoy, intimidate, or threaten any of our employees or agents engaged in providing any portion of the Services to you.</li>
                    <li>Attempt to bypass any measures of the Services designed to prevent or restrict access to the Services, or any portion of the Services.</li>
                    <li>Copy or adapt the Services&apos; software, including but not limited to Flash, PHP, HTML, JavaScript, or other code.</li>
                    <li>Except as permitted by applicable law, decipher, decompile, disassemble, or reverse engineer any of the software comprising or in any way making up a part of the Services.</li>
                    <li>Except as may be the result of standard search engine or Internet browser usage, use, launch, develop, or distribute any automated system, including without limitation, any spider, robot, cheat utility, scraper, or offline reader that accesses the Services, or use or launch any unauthorised script or other software.</li>
                    <li>Use a buying agent or purchasing agent to make purchases on the Services.</li>
                    <li>Make any unauthorised use of the Services, including collecting usernames and/or email addresses of users by electronic or other means for the purpose of sending unsolicited email, or creating user accounts by automated means or under false pretences.</li>
                    <li>Use the Services as part of any effort to compete with us or otherwise use the Services and/or the Content for any revenue-generating endeavour or commercial enterprise.</li>
                    <li>Sell or otherwise transfer your profile.</li>
                </ul>

                <p className="font-semibold pt-2">9. USER GENERATED CONTRIBUTIONS</p>
                <p>
                    The Services may invite you to chat, contribute to, or participate in blogs, message boards, online forums, and other functionality. Any content you submit or post shall be deemed &apos;Contributions&apos;. You are responsible for ensuring that your Contributions comply with these Legal Terms and do not infringe any third-party rights.
                </p>

                <p className="font-semibold pt-2">10. CONTRIBUTION LICENCE</p>
                <p>
                    By posting Contributions to any part of the Services, you automatically grant, and you represent and warrant that you have the right to grant, to us an unrestricted, unlimited, irrevocable, perpetual, non-exclusive, transferable, royalty-free, fully-paid, worldwide right, and licence to host, use, copy, reproduce, disclose, sell, resell, publish, broadcast, retitle, archive, store, cache, publicly perform, publicly display, reformat, translate, transmit, excerpt, and distribute such Contributions for any purpose.
                </p>

                <p className="font-semibold pt-2">11. GUIDELINES FOR REVIEWS</p>
                <p>
                    We may provide you areas on the Services to leave reviews or ratings. When posting a review, you must comply with the following criteria: (1) you should have firsthand experience with the person/entity being reviewed; (2) your reviews should not contain offensive profanity, or abusive, racist, offensive, or hate language; (3) your reviews should not contain discriminatory references based on religion, race, gender, national origin, age, marital status, sexual orientation, or disability; (4) your reviews should not contain references to illegal activity; (5) you should not be affiliated with competitors if posting negative reviews; (6) you should not make any conclusions as to the legality of conduct; (7) you may not post any false or misleading statements; and (8) you may not organise a campaign encouraging others to post reviews, whether positive or negative.
                </p>

                <p className="font-semibold pt-2">12. MOBILE APPLICATION LICENCE</p>
                <p>
                    If you access the Services via a mobile application, then we grant you a revocable, non-exclusive, non-transferable, limited right to install and use the mobile application on wireless electronic devices owned or controlled by you, and to access and use the mobile application on such devices strictly in accordance with the terms and conditions of this mobile application licence.
                </p>

                <p className="font-semibold pt-2">13. SOCIAL MEDIA</p>
                <p>
                    As part of the functionality of the Services, you may link your account with online accounts you have with third-party service providers. By granting us access to any third-party accounts, you understand that we may access, make available, and store any content that you have provided to and stored in your third-party account so that it is available on and through the Services.
                </p>

                <p className="font-semibold pt-2">14. THIRD-PARTY WEBSITES AND CONTENT</p>
                <p>
                    The Services may contain links to other websites (&apos;Third-Party Websites&apos;) as well as articles, photographs, text, graphics, pictures, designs, music, sound, video, information, applications, software, and other content or items belonging to or originating from third parties (&apos;Third-Party Content&apos;). We are not responsible for any Third-Party Websites accessed through the Services or any Third-Party Content posted on, available through, or installed from the Services.
                </p>

                <p className="font-semibold pt-2">15. SERVICES MANAGEMENT</p>
                <p>
                    We reserve the right, but not the obligation, to: (1) monitor the Services for violations of these Legal Terms; (2) take appropriate legal action against anyone who, in our sole discretion, violates the law or these Legal Terms; (3) in our sole discretion and without limitation, refuse, restrict access to, limit the availability of, or disable any of your Contributions; and (4) otherwise manage the Services in a manner designed to protect our rights and property and to facilitate the proper functioning of the Services.
                </p>

                <p className="font-semibold pt-2">16. PRIVACY POLICY</p>
                <p>
                    We care about data privacy and security. Please review our Privacy Policy: <a href="https://eventorydev.netlify.app/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-[#04222D] underline font-medium">https://eventorydev.netlify.app/privacy-policy</a>. By using the Services, you agree to be bound by our Privacy Policy, which is incorporated into these Legal Terms. Please be advised the Services are hosted in India. If you access the Services from any other region of the world with laws or other requirements governing personal data collection, use, or disclosure that differ from applicable laws in India, then through your continued use of the Services, you are transferring your data to India, and you expressly consent to have your data transferred to and processed in India.
                </p>

                <p className="font-semibold pt-2">17. COPYRIGHT INFRINGEMENTS</p>
                <p>
                    We respect the intellectual property rights of others. If you believe that any material available on or through the Services infringes upon any copyright you own or control, please immediately notify us using the contact information provided below. A copy of your Notification will be sent to the person who posted or stored the material addressed in the Notification.
                </p>

                <p className="font-semibold pt-2">18. TERM AND TERMINATION</p>
                <p>
                    These Legal Terms shall remain in full force and effect while you use the Services. WITHOUT LIMITING ANY OTHER PROVISION OF THESE LEGAL TERMS, WE RESERVE THE RIGHT TO, IN OUR SOLE DISCRETION AND WITHOUT NOTICE OR LIABILITY, DENY ACCESS TO AND USE OF THE SERVICES (INCLUDING BLOCKING CERTAIN IP ADDRESSES), TO ANY PERSON FOR ANY REASON OR FOR NO REASON, INCLUDING WITHOUT LIMITATION FOR BREACH OF ANY REPRESENTATION, WARRANTY, OR COVENANT CONTAINED IN THESE LEGAL TERMS OR OF ANY APPLICABLE LAW OR REGULATION.
                </p>

                <p className="font-semibold pt-2">19. MODIFICATIONS AND INTERRUPTIONS</p>
                <p>
                    We reserve the right to change, modify, or remove the contents of the Services at any time or for any reason at our sole discretion without notice. However, we have no obligation to update any information on our Services. We will not be liable to you or any third party for any modification, price change, suspension, or discontinuance of the Services.
                </p>

                <p className="font-semibold pt-2">20. GOVERNING LAW</p>
                <p>
                    These Legal Terms and your use of the Services are governed by and construed in accordance with the laws of India, without regard to its conflict of law principles.
                </p>

                <p className="font-semibold pt-2">21. DISPUTE RESOLUTION</p>
                <p>
                    Any legal action of whatever nature brought by either you or us shall be commenced or prosecuted in the courts located in New Delhi, Delhi, India, and you hereby consent to, and waive all defences of lack of personal jurisdiction and forum non conveniens with respect to venue and jurisdiction in such courts.
                </p>

                <p className="font-semibold pt-2">22. CORRECTIONS</p>
                <p>
                    There may be information on the Services that contains typographical errors, inaccuracies, or omissions, including descriptions, pricing, availability, and various other information. We reserve the right to correct any errors, inaccuracies, or omissions and to change or update the information on the Services at any time, without prior notice.
                </p>

                <p className="font-semibold pt-2">23. DISCLAIMER</p>
                <p>
                    THE SERVICES ARE PROVIDED ON AN AS-IS AND AS-AVAILABLE BASIS. YOU AGREE THAT YOUR USE OF THE SERVICES WILL BE AT YOUR SOLE RISK. TO THE FULLEST EXTENT PERMITTED BY LAW, WE DISCLAIM ALL WARRANTIES, EXPRESS OR IMPLIED, IN CONNECTION WITH THE SERVICES AND YOUR USE THEREOF.
                </p>

                <p className="font-semibold pt-2">24. LIMITATIONS OF LIABILITY</p>
                <p>
                    IN NO EVENT WILL WE OR OUR DIRECTORS, EMPLOYEES, OR AGENTS BE LIABLE TO YOU OR ANY THIRD PARTY FOR ANY DIRECT, INDIRECT, CONSEQUENTIAL, EXEMPLARY, INCIDENTAL, SPECIAL, OR PUNITIVE DAMAGES, INCLUDING LOST PROFIT, LOST REVENUE, LOSS OF DATA, OR OTHER DAMAGES ARISING FROM YOUR USE OF THE SERVICES.
                </p>

                <p className="font-semibold pt-2">25. INDEMNIFICATION</p>
                <p>
                    You agree to defend, indemnify, and hold us harmless, including our subsidiaries, affiliates, and all of our respective officers, agents, partners, and employees, from and against any loss, damage, liability, claim, or demand, including reasonable attorneys&apos; fees and expenses, made by any third party due to or arising out of: (1) your Contributions; (2) use of the Services; (3) breach of these Legal Terms; (4) any breach of your representations and warranties set forth in these Legal Terms; (5) your violation of the rights of a third party, including but not limited to intellectual property rights; or (6) any overt harmful act toward any other user of the Services with whom you connected via the Services.
                </p>

                <p className="font-semibold pt-2">26. USER DATA</p>
                <p>
                    We will maintain certain data that you transmit to the Services for the purpose of managing the performance of the Services, as well as data relating to your use of the Services. Although we perform regular routine backups of data, you are solely responsible for all data that you transmit or that relates to any activity you have undertaken using the Services.
                </p>

                <p className="font-semibold pt-2">27. ELECTRONIC COMMUNICATIONS, TRANSACTIONS, AND SIGNATURES</p>
                <p>
                    Visiting the Services, sending us emails, and completing online forms constitute electronic communications. You consent to receive electronic communications, and you agree that all agreements, notices, disclosures, and other communications we provide to you electronically, via email and on the Services, satisfy any legal requirement that such communication be in writing.
                </p>

                <p className="font-semibold pt-2">28. SMS TEXT MESSAGING</p>
                <p>
                    By creating an Account, you agree that the Services may send you informational text (SMS) messages as part of the normal business operation of your use of the Services. You may opt-out of receiving text (SMS) messages from us at any time by contacting us.
                </p>

                <p className="font-semibold pt-2">29. MISCELLANEOUS</p>
                <p>
                    These Legal Terms and any policies or operating rules posted by us on the Services constitute the entire agreement and understanding between you and us. Our failure to exercise or enforce any right or provision of these Legal Terms shall not operate as a waiver of such right or provision. These Legal Terms operate to the fullest extent permissible by law.
                </p>

                <p className="font-semibold pt-2">30. CONTACT US</p>
                <p>
                    In order to resolve a complaint regarding the Services or to receive further information regarding use of the Services, please contact us at:
                </p>
                <p className="font-medium">
                    EVENTORY TECH SOLUTIONS PRIVATE LIMITED<br />
                    13 D, Atmaram House, 1-Tolstoy Marg, Connaught Place, New Delhi, Delhi 110001, India<br />
                    Phone: (+91)8800725840<br />
                    Email: <a href="mailto:support@eventory.in" className="text-[#04222D] underline font-medium">support@eventory.in</a>
                </p>
            </div>

            {/* Checkbox wrapper */}
            <div 
                className="flex items-start gap-3 pt-6 cursor-pointer select-none border-t border-[#E6E9EA]"
                onClick={() => setHasAcceptedTerms(!hasAcceptedTerms)}
            >
                <div className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center transition-all flex-shrink-0 ${hasAcceptedTerms ? 'border-[#04222D] bg-[#04222D]' : 'border-[#D4D4D8] bg-white'}`}>
                    {hasAcceptedTerms && (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                        </svg>
                    )}
                </div>
                <span className="text-[13px] text-[#3F3F47] font-semibold font-figtree">
                    I agree to all terms and services
                </span>
            </div>
        </motion.div>
    );
}
