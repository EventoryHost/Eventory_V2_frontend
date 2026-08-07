'use client';
import { motion, AnimatePresence } from 'framer-motion';
import React, { useState } from 'react';

const sv = { initial: { x: 20, opacity: 0 }, animate: { x: 0, opacity: 1 }, exit: { x: -20, opacity: 0 } };

// ── Collapsible Section ──────────────────────────────────
function Section({ title, children, defaultOpen = false }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
    const [open, setOpen] = useState(defaultOpen);
    return (
        <div className="border border-[#E5E5E5] rounded-[12px] overflow-hidden">
            {/* Header */}
            <button
                type="button"
                onClick={() => setOpen(o => !o)}
                className="w-full flex items-center justify-between gap-3 px-4 py-3 bg-white text-left"
            >
                <span className="text-[#1C398E] font-figtree text-[16px] font-semibold leading-[24px]">{title}</span>
                <motion.svg
                    animate={{ rotate: open ? 180 : 0 }}
                    transition={{ duration: 0.22, ease: 'easeInOut' }}
                    width="18" height="18" viewBox="0 0 24 24" fill="none"
                    stroke="#1C398E" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
                    className="flex-shrink-0"
                >
                    <polyline points="6 9 12 15 18 9" />
                </motion.svg>
            </button>

            {/* Body */}
            <AnimatePresence initial={false}>
                {open && (
                    <motion.div
                        key="body"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: 'easeInOut' }}
                        className="overflow-hidden"
                    >
                        <div className="px-4 pb-4 pt-1 border-t border-[#E5E5E5] space-y-3">
                            {children}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

interface Props {
    hasAcceptedTerms: boolean;
    setHasAcceptedTerms: (v: boolean) => void;
    vendorName?: string;
    brandName?: string;
    pocName?: string;
    email?: string;
    vendorId?: string;
}

// ── Design tokens ────────────────────────────────────────
// Heading: #1C398E, 20px, 600, 28px line-height
const headingCls = 'text-[#1C398E] font-figtree text-[20px] font-semibold leading-[28px] tracking-[0]';
// Normal body text: #030303, 16px, 400, 24px line-height
const bodyCls = 'text-[#030303] font-figtree text-[16px] font-normal leading-[24px] tracking-[0]';
// Bold body text: #030303, 16px, 700, 24px line-height, justify
const boldCls = 'text-[#030303] font-figtree text-[16px] font-bold leading-[24px] tracking-[0] text-justify';
// Summary / small text
const smallCls = 'text-[#3F3F47] font-figtree text-[13px] font-normal leading-[20px]';

// ── Table style helpers ──────────────────────────────────
const tbl = 'w-full border-collapse text-[13px]';
const thC = 'border border-[#C8C8C8] bg-[#F5F5F5] px-3 py-2 font-semibold text-center text-[12px] font-figtree';
const thL = 'border border-[#C8C8C8] bg-[#F5F5F5] px-3 py-2 font-semibold text-left text-[12px] font-figtree';
const tdC = 'border border-[#C8C8C8] px-3 py-2 text-center font-figtree';
const tdL = 'border border-[#C8C8C8] px-3 py-2 text-left font-figtree';

// ── Data ────────────────────────────────────────────────
const dayHeaders = ['25+\nDays', '18-25\nDays', '13-18\nDays', '8-12\nDays', '4-7\nDays', '1-3\nDays', 'Event\nDay'];

const cancellationRows = [
    { range: '0-15K',    vals: ['0%','16%','24%','32%','40%','48%','56%'] },
    { range: '15-30K',   vals: ['0%','18%','26%','34%','42%','50%','58%'] },
    { range: '30-50K',   vals: ['0%','20%','28%','36%','44%','52%','60%'] },
    { range: '50-75K',   vals: ['0%','20%','32%','45%','57%','70%','82%'] },
    { range: '75-100K',  vals: ['0%','25%','37%','50%','62%','75%','87%'] },
    { range: '100-125K', vals: ['0%','28%','38%','48%','58%','68%','78%'] },
    { range: '125-150K', vals: ['0%','30%','40%','50%','60%','70%','80%'] },
    { range: '150-175K', vals: ['0%','32%','42%','52%','62%','72%','80%'] },
    { range: '175-200K', vals: ['0%','34%','44%','54%','64%','74%','80%'] },
    { range: '200-250K', vals: ['0%','38%','48%','58%','68%','78%','80%'] },
    { range: '250-300K', vals: ['0%','42%','52%','62%','72%','80%','80%'] },
];

const commissionRows = [
    { range: '0-15K',    val: '11%' },
    { range: '15-30K',   val: '10%' },
    { range: '30-50K',   val: '9%'  },
    { range: '50-75K',   val: '8%'  },
    { range: '75-100K',  val: '7%'  },
    { range: '100-125K', val: '6%'  },
    { range: '125-150K', val: '5%'  },
    { range: '150-175K', val: '4%'  },
    { range: '175-200K', val: '3%'  },
    { range: '200-250K', val: '2%'  },
    { range: '250-300K', val: '1%'  },
];

const tierRows = [
    { tier: 'CAT_1', commission: '2% to 12.8%',     cancellation: '10% to 100%' },
    { tier: 'CAT_2', commission: '1% to 11.8%',     cancellation: '0% to 87.5%' },
    { tier: 'CAT_3', commission: '0.5% to 11.3%',   cancellation: '0% to 78.5%' },
    { tier: 'CAT_4', commission: '0.5% to 11.3%',   cancellation: '0% to 69%'   },
    { tier: 'CAT_5', commission: '0.5% to 11.3%',   cancellation: '0% to 59%'   },
    { tier: 'CAT_6', commission: '0.25% to 11.05%', cancellation: '0% to 49%'   },
];

const profileScoreRows: [string, string, string, string][] = [
    ['0 – 24',     '0 – 2',     '1 – 5',    '5'],
    ['25 – 49',    '3 – 6',     '6 – 15',   '4'],
    ['50 – 74',    '7 – 10',    '16 – 30',  '3'],
    ['75 – 99',    '10 – 15',   '31 – 50',  '2'],
    ['100 – 1000', '15 – 1000', '50 – 100', '1'],
];

const consentItems = [
    'I confirm my business, KYC, bank, tax, and service details are accurate.',
    'I understand Eventory may assign/update my commercial tier based on profile, capacity, risk, and performance.',
    'I accept commission, convenience fee, cancellation, refund, and settlement rules shown in the app/admin-configured rate card.',
    'I agree to honor acknowledged/paid bookings and understand that settlement may be held until acknowledgement and verification.',
    'I agree that Eventory may reassign bookings, handle customer refunds, and recover applicable charges in exceptional cases.',
    'I agree to receive operational communication through app, phone, email, SMS, or WhatsApp.',
];

function DayHeaders() {
    return (
        <>
            {dayHeaders.map(h => (
                <th key={h} className={thC}>
                    {h.split('\n').map((l, i) => <span key={i} className="block">{l}</span>)}
                </th>
            ))}
        </>
    );
}

function ProfileScoreTable() {
    return (
        <div className="overflow-x-auto rounded-[8px] border border-[#C8C8C8]">
            <table className={tbl}>
                <thead>
                    <tr>
                        <th className={thC}>Booking<br/>per year</th>
                        <th className={thC}>Years of<br/>Operation</th>
                        <th className={thC}>Team<br/>size</th>
                        <th className={thC}>Reference<br/>Score</th>
                    </tr>
                </thead>
                <tbody>
                    {profileScoreRows.map(([b, y, t, s]) => (
                        <tr key={b}>
                            <td className={tdC}>{b}</td>
                            <td className={tdC}>{y}</td>
                            <td className={tdC}>{t}</td>
                            <td className={`${tdC} font-bold`}>{s}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

// Bullet list item
function Bullet({ children }: { children: React.ReactNode }) {
    return (
        <li className="flex gap-2">
            <span className="mt-[4px] flex-shrink-0">•</span>
            <span className={bodyCls}>{children}</span>
        </li>
    );
}

export function StepTerms({ hasAcceptedTerms, setHasAcceptedTerms, vendorName, brandName, pocName, email, vendorId }: Props) {
    const [checkedItems, setCheckedItems] = useState<boolean[]>(new Array(consentItems.length).fill(false));
    const allChecked = checkedItems.every(Boolean);

    const toggleItem = (i: number) => {
        setCheckedItems(prev => { const n = [...prev]; n[i] = !n[i]; return n; });
    };
    const toggleAll = () => setCheckedItems(new Array(consentItems.length).fill(!allChecked));

    const now = new Date();
    const acceptedAt = now.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })
        + ' at ' + now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

    return (
        <motion.div key="step14" {...sv} className="space-y-6 pb-10">

            {/* ── Main Title ── */}
            <h1 className="text-[#030303] font-figtree text-[22px] font-bold leading-[30px]">
                Eventory Vendor Agreement and Onboarding Consent Form
            </h1>

            {/* ── Summary Box ── */}
            <div className="bg-[#F4F4F5] rounded-[12px] p-4 space-y-1.5">
                <p className="text-[14px] font-bold text-[#030303] font-figtree">Summary of Key Points</p>
                <p className={smallCls}>
                    This document is designed to be shown at the final step of vendor onboarding. It explains the vendor&apos;s obligations, commercial terms, settlement logic, cancellation impact, and consent captured by Eventory. This is an operational draft and should be reviewed by legal counsel before production use.
                </p>
            </div>

            {/* ── Cancellation Table ── */}
            <div className="space-y-2">
                <p className="text-[14px] font-bold text-center text-[#04222D] font-figtree">Vendor Cancellation Range</p>
                <div className="overflow-x-auto rounded-[8px] border border-[#C8C8C8]">
                    <table className={tbl}>
                        <thead>
                            <tr>
                                <th className={thC}>Price<br/>Range</th>
                                <DayHeaders />
                            </tr>
                        </thead>
                        <tbody>
                            {cancellationRows.map(row => (
                                <tr key={row.range}>
                                    <td className={`${tdL} font-medium`}>{row.range}</td>
                                    {row.vals.map((v, i) => <td key={i} className={tdC}>{v}</td>)}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ── Commission Table ── */}
            <div className="space-y-2">
                <p className="text-[14px] font-bold text-center text-[#04222D] font-figtree">Vendor Commission Range</p>
                <div className="overflow-x-auto rounded-[8px] border border-[#C8C8C8]">
                    <table className={tbl}>
                        <thead>
                            <tr>
                                <th className={thC}>Price<br/>Range</th>
                                <DayHeaders />
                            </tr>
                        </thead>
                        <tbody>
                            {commissionRows.map(row => (
                                <tr key={row.range}>
                                    <td className={`${tdL} font-medium`}>{row.range}</td>
                                    {dayHeaders.map((_, i) => <td key={i} className={tdC}>{row.val}</td>)}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ══════════════ POLICY SECTIONS ══════════════ */}
            <div className="space-y-2">

                {/* 1 */}
                <Section title="1. Parties and Acceptance">
                    <p className={bodyCls}>This Vendor Agreement and Onboarding Consent Form is entered between Eventory Tech Solutions Private Limited, having its principal place of business at 13-D, Atmaram House, 1-Tolstoy Marg, Connaught Place, New Delhi-110001, and the vendor/business entity completing onboarding on the Eventory vendor app.</p>
                    <ul className="space-y-2 list-none">
                        <Bullet>The vendor confirms that all business profile, KYC, bank, tax, team, availability, service, package, pricing, and document details submitted during onboarding are true and current.</Bullet>
                        <Bullet>The vendor agrees that onboarding may cover one or multiple service lines, packages, cities, teams, or inventory types.</Bullet>
                        <Bullet>The vendor agrees that final activation, listing visibility, commercial tier, and settlement eligibility are subject to Eventory verification and approval.</Bullet>
                    </ul>
                </Section>

                {/* 2 */}
                <Section title="2. Definitions">
                    <ul className="space-y-2 list-none">
                        <Bullet><span className={boldCls}>2.1 Platform:</span> Eventory&apos;s online and offline event booking platform where services are offered to users</Bullet>
                        <Bullet><span className={boldCls}>2.2 Vendors:</span> The entity providing goods or services for events listed on the Platform.</Bullet>
                        <Bullet><span className={boldCls}>2.3 Users/Clients:</span> Individuals or businesses that hire the Vendor via the Platform.</Bullet>
                        <Bullet><span className={boldCls}>2.4 Services:</span> The services provided by the Vendor listed on the Platform (e.g., catering, photography, event planning, etc.)</Bullet>
                        <Bullet><span className={boldCls}>2.5 Booking Amount:</span> The base price of the goods or services offered by the Vendor (inclusive of applicable taxes)</Bullet>
                    </ul>
                </Section>

                {/* 3 */}
                <Section title="3. Scope of Services">
                    <ul className="space-y-2 list-none">
                        <Bullet><span className={boldCls}>3.1 Description of Services:</span> The Vendor agrees to provide the following services as listed during onboarding.</Bullet>
                        <Bullet><span className={boldCls}>3.2 Service Standards:</span> The Vendor agrees to deliver services in a professional manner, adhering to industry standards, and will comply with all legal and regulatory requirements.</Bullet>
                    </ul>
                </Section>

                {/* 4 */}
                <Section title="4. Term and Termination">
                    <ul className="space-y-2 list-none">
                        <Bullet><span className={boldCls}>4.1 Description of Services:</span> This Agreement is effective as of the date of onboarding completion and shall remain in effect until terminated by either Party as provided in this section.</Bullet>
                        <Bullet><span className={boldCls}>4.2 Service Standards:</span> The Vendor may terminate this Agreement by providing a written notice to the platform within 7 days of registration.</Bullet>
                        <Bullet><span className={boldCls}>4.3 Service Standards:</span> The Platform may terminate this Agreement immediately if the Vendor breaches any terms of this Agreement or fails to provide services up to the required standards.</Bullet>
                        <Bullet><span className={boldCls}>4.4 Effect of Termination:</span> Upon termination, all pending transactions or bookings will be completed unless mutually agreed otherwise. The Vendor shall be responsible for all commitments made prior to the date of termination.</Bullet>
                    </ul>
                </Section>

                {/* 5 */}
                <Section title="5. Multi-Service Onboarding Model">
                    <p className={bodyCls}>Eventory&apos;s vendor onboarding is not limited to a single service category. A vendor may provide catering, photography/videography, venue, decor, makeup, DJ, artist, package bundles, or other event services. Commercial category and commission treatment should therefore be calculated at the vendor profile and booking level, not only by the service label selected during onboarding.</p>
                    <div className="overflow-x-auto rounded-[8px] border border-[#C8C8C8]">
                        <table className={tbl}>
                            <thead>
                                <tr>
                                    <th className={thL}>Factor</th>
                                    <th className={thL}>How Eventory uses it</th>
                                </tr>
                            </thead>
                            <tbody>
                                {[
                                    ['Bookings per year',   'Indicates vendor maturity, operational capacity, and expected platform dependency.'],
                                    ['Years of operation',  'Helps determine experience level and service reliability.'],
                                    ['Team size',           'Helps determine whether the vendor can handle concurrent bookings, large events, and reassignment cases.'],
                                    ['Service criticality', 'High-impact services such as venue, caterer, decorator, photographer may require stricter review and higher operational controls.'],
                                    ['Verification status', 'Business documents, personal documents, bank verification, GST/PAN, address proof, and internal approval affect activation and payouts.'],
                                    ['Performance history', 'Acknowledgement speed, cancellation history, customer rating, package quality, and dispute record can update the tier over time.'],
                                ].map(([f, d]) => (
                                    <tr key={f}>
                                        <td className={`${tdL} align-top w-[38%]`}>{f}</td>
                                        <td className={`${tdL} align-top`}>{d}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Section>

                {/* 6 */}
                <Section title="6. Multi-Service Vendor Category Assignment">
                    <p className={bodyCls}>Eventory&apos;s vendor onboarding is not limited to a single service category. A vendor may provide catering, photography/videography, venue, decor, makeup, DJ, artist, package bundles, or other event services.</p>
                    <p className={bodyCls}>While general operational factors (such as experience and team size) apply across the profile, <strong>the assigned category is dependent on both the overall profile score and the specific service type.</strong> Therefore, for multi-service vendors, commercial category and commission treatment are calculated per service line and booking level, rather than applying a single blanket category to the entire profile.</p>
                    <p className={boldCls}>A. Vendor Profile Inputs Captured</p>
                    <p className={bodyCls}>During onboarding, the system captures the following primary profile inputs from the vendor:</p>
                    <ul className="space-y-2 list-none">
                        <Bullet><strong>Selected Service(s):</strong> (e.g., Caterer OR Decorator &amp; DJ OR Venue &amp; Caterer &amp; DJ)</Bullet>
                        <Bullet><strong>Bookings / Year:</strong> Selected annual capacity range</Bullet>
                        <Bullet><strong>Years of Operation:</strong> Total operational history</Bullet>
                        <Bullet><strong>Team Size:</strong> Total dedicated staff count</Bullet>
                    </ul>
                    <p className={boldCls}>B. Profile Reference Score Table</p>
                    <p className={bodyCls}>Based on the operational inputs selected (Bookings/Year, Years of Operation, Team Size), a baseline profile reference score is assigned:</p>
                    <ProfileScoreTable />
                    <p className={boldCls}>C. Multi-Service Vendor Category Assignment</p>
                    <p className={bodyCls}>Because single profile factors evaluate overall capability while category mapping is service-dependent, a vendor onboarding multiple services will be assigned specific categories for each service line:</p>
                    <div className="rounded-[8px] border border-[#C8C8C8] overflow-hidden">
                        <div className="bg-[#F5F5F5] px-3 py-2 border-b border-[#C8C8C8]">
                            <p className="text-[13px] font-semibold text-[#030303] font-figtree">Onboarding Input Selected</p>
                        </div>
                        <div className="px-3 py-2 border-b border-[#C8C8C8] space-y-1">
                            <p className="text-[13px] font-medium text-[#3F3F47] font-figtree">Multi-Vendor Selection:</p>
                            <ul className="text-[13px] text-[#3F3F47] font-figtree pl-2 space-y-0.5">
                                <li>• Venue</li><li>• Decorator</li><li>• DJ</li>
                            </ul>
                        </div>
                        <table className={tbl}>
                            <thead><tr><th className={thL}>Service Line Offered</th><th className={thL}>Category Assigned</th></tr></thead>
                            <tbody>
                                {[['Venue','CAT_2'],['Decorator','CAT_3'],['DJ','CAT_4']].map(([s, c]) => (
                                    <tr key={s}><td className={tdL}>{s}</td><td className={tdC}>{c}</td></tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Section>

                {/* 7 */}
                <Section title="7. Commercial Tiering and Fees">
                    <p className={bodyCls}>After the Eventory Free trial period, Eventory will assign you a category tag, and commission fees will be applied to every booking.</p>
                    <p className={bodyCls}>Eventory assigns commercial tiers <strong>(from CAT_1 to CAT_6)</strong> based on the vendor profile score, service type criticality, operational risk, and business rules configured in the admin portal. The final commission, convenience fee, and cancellation impact for each booking depend on the assigned tier, booking value slab, and days remaining until the event.</p>
                    <div className="overflow-x-auto rounded-[8px] border border-[#C8C8C8]">
                        <table className={tbl}>
                            <thead><tr><th className={thC}>Tier</th><th className={thC}>Vendor Commission Range 🔵</th><th className={thC}>Vendor Cancellation Range 🔵</th></tr></thead>
                            <tbody>
                                {tierRows.map(r => (
                                    <tr key={r.tier}><td className={`${tdC} font-bold`}>{r.tier}</td><td className={tdC}>{r.commission}</td><td className={tdC}>{r.cancellation}</td></tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="bg-[#EEF2FF] rounded-[8px] p-3 space-y-1">
                        <p className="text-[13px] font-semibold text-[#030303] font-figtree">View Details 🔵 Breakdown Note:</p>
                        <p className={smallCls}>🔵 icon next to any percentage range in the app displays the exact breakdown by <strong>days remaining before the event</strong> (event-date proximity slabs). Category-wise day breakdown tables and exact commercial values are mapped per category in the Eventory commercial configuration table.</p>
                    </div>
                    <p className={boldCls}>Vendor Profile Score Reference</p>
                    <ProfileScoreTable />
                    <p className={bodyCls}>The score is a reference input, not the only determinant. Eventory may adjust tiering using verification status, service risk, customer complaints, cancellation behavior, operational reliability, or manual admin review.</p>
                </Section>

                {/* 8 */}
                <Section title="8. Booking, Payment and Settlement Terms">
                    <ol className="space-y-2 list-none">
                        {[
                            'Customers may book through instant booking, enquiry-first flow, free booking/zero-advance booking, or advance-payment booking, depending on the vendor package configuration.',
                            'For paid bookings, Eventory collects customer payment through its payment gateway and records the payment against the booking ledger.',
                            'Vendor settlement is processed after required booking acknowledgement, internal verification, and applicable event/payment milestone completion.',
                            'Eventory may deduct platform commission, applicable taxes, gateway charges, penalties, refunds, cancellation charges, or adjustment entries before vendor payout.',
                            'For zero-advance/free bookings, vendors may be required to accept or decline within the defined time window. For paid confirmed bookings, vendors are required to acknowledge the booking and fulfill it.',
                            'If a paid booking is not acknowledged, Eventory may contact the vendor, hold settlement, reassign the booking through admin operations, or apply operational penalties as per policy.',
                        ].map((text, i) => (
                            <li key={i} className="flex gap-2">
                                <span className={`${bodyCls} flex-shrink-0`}>{i + 1}.</span>
                                <span className={bodyCls}>{text}</span>
                            </li>
                        ))}
                    </ol>
                </Section>

                {/* 9 */}
                <Section title="9. Vendor Obligations">
                    <ul className="space-y-2 list-none">
                        <Bullet>Maintain accurate package, pricing, menu, inventory, availability, time slots, service area, and team capacity.</Bullet>
                        <Bullet>Honor all acknowledged bookings and avoid off-platform diversion of customers acquired through Eventory.</Bullet>
                        <Bullet>Hold valid business documents, licenses, permits, tax registrations, food/service licenses, insurance, and local permissions where applicable.</Bullet>
                        <Bullet>Provide safe, lawful, professional, and timely service delivery as represented in the package listing.</Bullet>
                        <Bullet>Inform Eventory immediately about capacity issues, unavoidable delays, force majeure, quality incidents, or customer disputes.</Bullet>
                        <Bullet>Accept that package content, payment breakdowns, refund logic, and cancellation handling may be reviewed or corrected through the admin portal for compliance and customer protection.</Bullet>
                    </ul>
                </Section>

                {/* 10 */}
                <Section title="10. Cancellation, Refund and Reassignment">
                    <p className={bodyCls}>Cancellation charges are applied according to the booking value, commercial tier, and number of days remaining before the event. Vendor-side cancellation after confirmation may result in cancellation charges, recovery of disbursed advance, reduced visibility, temporary listing suspension, or internal reassignment.</p>
                    <ul className="space-y-2 list-none">
                        <Bullet>If the customer cancels, applicable customer cancellation charges and refund treatment are calculated by Eventory and shown in customer/vendor records.</Bullet>
                        <Bullet>If the vendor cancels or refuses to fulfill an acknowledged booking, Eventory may assign another available vendor and recover applicable charges from the original vendor.</Bullet>
                        <Bullet>If a booking has been paid by the customer, vendor payout may be held until acknowledgement and operational confirmation are complete.</Bullet>
                        <Bullet>Refunds, replacements, chargebacks, disputes, and exception approvals are handled through the Eventory admin portal with audit logs.</Bullet>
                    </ul>
                </Section>

                {/* 11 */}
                <Section title="11. Cancellation, Refund and Reassignment">
                    <p className={bodyCls}>Cancellation charges are applied according to the booking value, commercial tier, and number of days remaining before the event. Vendor-side cancellation after confirmation may result in cancellation charges, recovery of disbursed advance, reduced visibility, temporary listing suspension, or internal reassignment.</p>
                    <ul className="space-y-2 list-none">
                        <Bullet>If the customer cancels, applicable customer cancellation charges and refund treatment are calculated by Eventory and shown in customer/vendor records.</Bullet>
                        <Bullet>If the vendor cancels or refuses to fulfill an acknowledged booking, Eventory may assign another available vendor and recover applicable charges from the original vendor.</Bullet>
                        <Bullet>If a booking has been paid by the customer, vendor payout may be held until acknowledgement and operational confirmation are complete.</Bullet>
                        <Bullet>Refunds, replacements, chargebacks, disputes, and exception approvals are handled through the Eventory admin portal with audit logs.</Bullet>
                    </ul>
                </Section>

                {/* 12 */}
                <Section title="12. Data, Consent and Audit Trail">
                    <ul className="space-y-2 list-none">
                        <Bullet>Vendor consent is captured with timestamp, user ID, business ID, device/app metadata, agreement version, IP/location where available, and accepted checkbox states.</Bullet>
                        <Bullet>Eventory may store onboarding documents, agreement acceptance, booking records, payment ledger, settlement ledger, communication logs, and support history.</Bullet>
                        <Bullet>Vendors may receive an email/SMS/WhatsApp confirmation or downloadable copy of the accepted agreement.</Bullet>
                    </ul>
                </Section>

                {/* 13 */}
                <Section title="13. Vendor's Representation and Warranties">
                    <ul className="space-y-2 list-none">
                        <Bullet><span className={boldCls}>13.1 Performance:</span> The Vendor warrants that it has the necessary skills, experience, and resources to perform the services professionally and efficiently.</Bullet>
                        <Bullet><span className={boldCls}>13.2 Non-Infringement:</span> The Vendor warrants that all services provided do not infringe on any third-party intellectual property rights.</Bullet>
                        <Bullet><span className={boldCls}>13.3 Compliance:</span> The Vendor represents that it complies with all laws and regulations related to the performance of its services.</Bullet>
                    </ul>
                </Section>

                {/* 14 */}
                <Section title="14. Vendor Visibility, Booking Numbers, and ROI">
                    <ul className="space-y-2 list-none">
                        <Bullet><span className={boldCls}>14.1 Visibility and Marketing:</span> The Vendor&apos;s visibility on the Platform depends on factors such as quality of service, pricing competitiveness, and profile updates.</Bullet>
                        <Bullet><span className={boldCls}>14.2 No Guarantee of Bookings:</span> The Platform does not guarantee a fixed number of bookings or orders to any Vendor. Success depends on several factors such as customer preferences and service quality.</Bullet>
                    </ul>
                </Section>

                {/* 15 */}
                <Section title="15. Dispute Resolution">
                    <ul className="space-y-2 list-none">
                        <Bullet><span className={boldCls}>15.1 Disputes with Users:</span> The Platform will act as an intermediary in any disputes between the Vendor and the user.</Bullet>
                        <Bullet><span className={boldCls}>15.2 Arbitration:</span> Any disputes between the Vendor and Platform shall be settled by arbitration in accordance with the rules of [Arbitration Body]</Bullet>
                    </ul>
                </Section>

                {/* 16 */}
                <Section title="16. Governing Law">
                    <p className={bodyCls}>This Agreement shall be governed by and construed in accordance with the laws of India.</p>
                </Section>

                {/* 17 */}
                <Section title="17. Miscellaneous">
                    <ul className="space-y-2 list-none">
                        <Bullet><span className={boldCls}>17.1 Amendments:</span> This Agreement may only be amended in writing signed by both Parties.</Bullet>
                        <Bullet><span className={boldCls}>17.2 Entire Agreement:</span> This Agreement constitutes the entire agreement between the Parties regarding its subject matter and supersedes any prior agreements.</Bullet>
                    </ul>
                </Section>

                {/* 18 */}
                <Section title="18. Signature / Digital Acceptance Block">
                    <div className="rounded-[12px] border border-[#C8C8C8] overflow-hidden">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-[#F5F5F5]">
                                    <th className="text-left px-4 py-3 text-[13px] font-semibold text-[#030303] font-figtree w-[40%] border-b border-[#C8C8C8]">Field</th>
                                    <th className="text-left px-4 py-3 text-[13px] font-semibold text-[#030303] font-figtree border-b border-[#C8C8C8]">Captured Value</th>
                                </tr>
                            </thead>
                            <tbody>
                                {[
                                    ['Vendor\nLegal Name',    vendorName || '—'],
                                    ['Brand\nName',           brandName  || vendorName || '—'],
                                    ['Authorised\nSignatory', pocName    || vendorName || '—'],
                                    ['Mobile/\nEmail',        email      || '—'],
                                    ['Vendor\nID',            vendorId   || '—'],
                                    ['Accepted\nat',          acceptedAt],
                                ].map(([field, val], idx, arr) => (
                                    <tr key={field} className={idx < arr.length - 1 ? 'border-b border-[#E5E5E5]' : ''}>
                                        <td className="px-4 py-3 text-[14px] text-[#71717B] font-figtree align-top whitespace-pre-line">{field}</td>
                                        <td className="px-4 py-3 text-[14px] text-[#030303] font-figtree align-top">{val}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Section>

                {/* 19 — App Consent Checklist (not collapsible — user must interact) */}
                <div className="border border-[#E5E5E5] rounded-[12px] overflow-hidden">
                    <div className="px-4 py-3 bg-white border-b border-[#E5E5E5]">
                        <p className="text-[#1C398E] font-figtree text-[16px] font-semibold leading-[24px]">19. App Consent Checklist</p>
                    </div>
                    <div className="px-4 pb-4 pt-3 space-y-4">
                        {consentItems.map((item, i) => (
                            <div key={i} className="flex items-start gap-3 cursor-pointer" onClick={() => toggleItem(i)}>
                                <div className={`mt-[2px] w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${checkedItems[i] ? 'border-[#04222D] bg-[#04222D]' : 'border-[#C8C8C8] bg-white'}`}>
                                    {checkedItems[i] && (
                                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                                            <polyline points="20 6 9 17 4 12" />
                                        </svg>
                                    )}
                                </div>
                                <p className={`${checkedItems[i] ? bodyCls : 'text-[#71717B] font-figtree text-[16px] font-normal leading-[24px]'}`}>{item}</p>
                            </div>
                        ))}
                        <div className="border-t border-[#E6E9EA] pt-3">
                            <div className="flex items-center gap-3 cursor-pointer" onClick={toggleAll}>
                                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${allChecked ? 'border-[#04222D] bg-[#04222D]' : 'border-[#C8C8C8] bg-white'}`}>
                                    {allChecked && (
                                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                                            <polyline points="20 6 9 17 4 12" />
                                        </svg>
                                    )}
                                </div>
                                <p className="text-[16px] font-semibold text-[#030303] font-figtree">Agree all</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Legal Review Note */}
                <div className="bg-[#F5F5F5] border border-[#E5E5E5] rounded-[12px] p-4 space-y-1.5">
                    <p className="text-[14px] font-bold text-[#030303] font-figtree">Legal Review Note</p>
                    <p className={smallCls}>
                        This document is a product and operations draft intended for transparent vendor onboarding. Before production deployment, Eventory should have counsel review governing law, arbitration, indemnity, limitation of liability, chargeback handling, tax treatment, data protection, and e-sign enforceability.
                    </p>
                </div>

            </div>{/* end policy sections */}

            {/* ── Final Agreement Checkbox ── */}
            <div
                className="flex items-start gap-3 pt-4 cursor-pointer select-none border-t border-[#E6E9EA]"
                onClick={() => setHasAcceptedTerms(!hasAcceptedTerms)}
            >
                <div className={`mt-[2px] w-5 h-5 rounded border-2 flex items-center justify-center transition-all flex-shrink-0 ${hasAcceptedTerms ? 'border-[#04222D] bg-[#04222D]' : 'border-[#D4D4D8] bg-white'}`}>
                    {hasAcceptedTerms && (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                        </svg>
                    )}
                </div>
                <span className="text-[14px] text-[#3F3F47] font-semibold font-figtree leading-[22px]">
                    I have read and agree to the Eventory Vendor Agreement and Onboarding Consent Form
                </span>
            </div>
        </motion.div>
    );
}
