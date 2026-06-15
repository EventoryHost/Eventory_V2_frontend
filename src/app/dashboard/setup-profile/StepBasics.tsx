'use client';
import { motion } from 'framer-motion';
import { FormData } from './types';

interface Props {
    formData: FormData;
    setFormData: React.Dispatch<React.SetStateAction<FormData>>;
    onContinue: () => void;
}

const stepVariants = {
    initial: { x: 20, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: -20, opacity: 0 },
};

export function StepBusinessName({ formData, setFormData }: Props) {
    return (
        <motion.div key="step1" {...stepVariants} className="pb-10">
            <div>
                <h1 className="text-[#030303] text-[24px] font-semibold leading-[32px] tracking-[0] font-figtree max-w-[315px]">
                    What&apos;s your business or brand name
                </h1>
            </div>

            <div className="mt-4 space-y-[18px]">
                <input
                    type="text"
                    value={formData.businessName}
                    onChange={(e) => setFormData((prev: FormData) => ({ ...prev, businessName: e.target.value }))}
                    placeholder={formData.isIndividual ? 'Your name' : 'Business name'}
                    className="flex w-full items-center gap-4 self-stretch rounded-[8px] border border-[#D4D4D8] bg-white px-[14px] py-4 outline-none focus:border-[#04222D] focus:ring-1 focus:ring-[#04222D] font-figtree text-[16px] leading-[24px] font-normal tracking-[0] text-[#030303] placeholder:text-[#9F9FA9] transition-all"
                />

                <div className="space-y-[10px]">
                    <p className="text-[#3F3F47] text-[14px] leading-[20px] font-normal tracking-[0] font-figtree max-w-[306px]">
                        Enter your business name. If you&apos;re an individual/Freelancer, you can use your own name.
                    </p>

                    <label className="flex items-center gap-2 text-[#030303] text-[13px] font-medium font-figtree cursor-pointer select-none">
                        <input
                            type="checkbox"
                            checked={formData.isIndividual}
                            onChange={(e) => setFormData((prev: FormData) => ({ ...prev, isIndividual: e.target.checked }))}
                            className="peer sr-only"
                        />
                        <span className={`w-[13px] h-[13px] rounded-[2px] border flex items-center justify-center ${formData.isIndividual ? 'border-[#04222D] bg-[#04222D]' : 'border-[#030303] bg-white'}`}>
                            {formData.isIndividual && (
                                <span className="block w-[7px] h-[4px] border-l border-b border-white -rotate-45 translate-y-[-1px]" />
                            )}
                        </span>
                        <span>I operate as an individual</span>
                    </label>
                </div>
            </div>
        </motion.div>
    );
}

export function StepPOCName({ formData, setFormData }: Props) {
    return (
        <motion.div key="step2" {...stepVariants} className="pb-10">
            <div>
                <h1 className="text-[#030303] text-[24px] font-semibold leading-[32px] tracking-[0] font-figtree">
                    Primary Point of Contact (POC)
                </h1>
            </div>

            <div className="mt-4 space-y-[18px]">
                <input
                    type="text"
                    value={formData.pocName}
                    onChange={(e) => setFormData((prev: FormData) => ({ ...prev, pocName: e.target.value }))}
                    placeholder="Enter full name"
                    className="flex w-full items-center gap-4 self-stretch rounded-[8px] border border-[#D4D4D8] bg-white px-[14px] py-4 outline-none focus:border-[#04222D] focus:ring-1 focus:ring-[#04222D] font-figtree text-[16px] leading-[24px] font-normal tracking-[0] text-[#030303] placeholder:text-[#9F9FA9] transition-all"
                />

                <p className="text-[#3F3F47] text-[14px] leading-[20px] font-normal tracking-[0] font-figtree max-w-[306px]">
                    Customers and Eventory will reach out to this person for booking-related communication.
                </p>
            </div>
        </motion.div>
    );
}

export function StepEmail({ formData, setFormData }: Props) {
    return (
        <motion.div key="step3" {...stepVariants} className="space-y-6 pb-10">
            <div className="space-y-2">
                <h1 className="text-[#030303] text-[24px] font-semibold leading-[32px] font-figtree">
                    Business Email
                </h1>
                <p className="text-[#3F3F47] text-[15px] font-normal font-figtree">
                    We&apos;ll use this for booking notifications and communication.
                </p>
            </div>
            <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData((prev: FormData) => ({ ...prev, email: e.target.value }))}
                placeholder="email@business.com"
                className="w-full px-5 py-4 border border-gray-300 rounded-[8px] bg-white outline-none focus:border-[#04222D] focus:ring-1 focus:ring-[#04222D] font-figtree text-[15px] text-[#030303] placeholder:text-gray-400 shadow-sm transition-all"
            />
        </motion.div>
    );
}

export function StepSingleChoice({
    stepKey, title, subtitle, options, value, onChange,
}: {
    stepKey: string; title: string; subtitle: string;
    options: string[]; value: string;
    onChange: (v: string) => void;
}) {
    const isTeamStep = stepKey === 'step4';
    const isBookingsStep = stepKey === 'step5';
    const isExperienceStep = stepKey === 'step6';
    const useChipLayout = isTeamStep || isBookingsStep || isExperienceStep;
    const hasSelection = value.length > 0;

    return (
        <motion.div key={stepKey} {...stepVariants} className={`${useChipLayout ? 'pb-10' : 'space-y-6 pb-10'}`}>
            <div className={useChipLayout ? 'space-y-3' : 'space-y-2'}>
                <h1 className={`text-[#030303] font-semibold font-figtree ${useChipLayout ? 'text-[24px] leading-[32px] tracking-[0] max-w-[320px]' : 'text-[24px] leading-[32px]'}`}>{title}</h1>
                <p className={`text-[#3F3F47] font-normal font-figtree ${useChipLayout ? 'text-[14px] leading-[20px] tracking-[0] max-w-[320px]' : 'text-[15px]'}`}>{subtitle}</p>
            </div>

            <div className={useChipLayout ? 'mt-8 flex flex-wrap gap-x-[10px] gap-y-4' : 'space-y-3'}>
                {options.map((opt) => (
                    <button
                        key={opt}
                        onClick={() => onChange(opt)}
                        className={`font-figtree transition-all ${useChipLayout
                            ? `inline-flex w-fit whitespace-nowrap rounded-[9999px] border px-4 py-2 text-[14px] leading-[20px] font-medium ${value === opt
                                ? 'border-[#04222D] bg-white text-[#04222D]'
                                : hasSelection
                                    ? 'border-[#D4D4D8] bg-white text-[#D4D4D8]'
                                    : 'border-[#04222D] bg-white text-[#04222D]'}` 
                            : `px-5 py-4 rounded-[8px] border text-[15px] font-medium ${value === opt
                                ? 'border-[#04222D] bg-[#04222D]/5 text-[#04222D]'
                                : 'border-[#71717B] bg-[#E6E9EA] text-[#030303]'}`}`}
                    >
                        {opt}
                    </button>
                ))}
            </div>
        </motion.div>
    );
}

export function StepDescription({
    formData,
    setFormData,
}: {
    formData: FormData;
    setFormData: React.Dispatch<React.SetStateAction<FormData>>;
}) {
    return (
        <motion.div
            key="step10"
            {...stepVariants}
            className="space-y-6 pb-10"
        >
            <div className="space-y-2">
                <h1 className="text-[#030303] text-[24px] font-semibold leading-[32px] tracking-normal font-figtree">
                    Tell us about your brand
                </h1>
                <p className="text-[#3F3F47] text-[15px] font-normal font-figtree leading-relaxed">
                    Effective descriptions highlight key details and what makes your venue stand out to attract clients.
                </p>
            </div>

            <div className="space-y-2 relative">
                <div className="flex justify-end pr-1">
                    <span className={`text-[12px] font-medium font-figtree transition-colors ${
                        formData.description.length > 400
                            ? 'text-rose-500'
                            : formData.description.length >= 200
                                ? 'text-emerald-500'
                                : 'text-gray-400'
                        }`}>
                        {formData.description.length} / 400
                    </span>
                </div>
                <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Description about your brand"
                    className={`w-full min-h-[220px] p-5 rounded-[8px] border transition-all resize-none font-figtree text-[15px] leading-relaxed placeholder:text-gray-400 outline-none text-[#030303] shadow-sm ${formData.description.length > 400
                            ? 'border-rose-300 bg-rose-50/10 focus:border-rose-500'
                            : 'border-gray-300 focus:border-[#04222D] bg-white focus:ring-1 focus:ring-[#04222D]'
                        }`}
                />
                <p className={`text-[13px] font-medium font-figtree transition-colors ${
                    formData.description.length > 400
                        ? 'text-rose-500'
                        : 'text-gray-400'
                }`}>
                    {formData.description.length > 400
                        ? `Too long — trim ${formData.description.length - 400} character${formData.description.length - 400 === 1 ? '' : 's'}`
                        : 'Between 200 and 400 characters required'
                    }
                </p>
            </div>
        </motion.div>
    );
}
