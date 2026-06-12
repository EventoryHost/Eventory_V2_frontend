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
        <motion.div key="step1" {...stepVariants} className="space-y-6 pb-10">
            <div className="space-y-2">
                <h1 className="text-[#030303] text-[24px] font-semibold leading-[32px] font-figtree">
                    What&apos;s your business name?
                </h1>
                <p className="text-[#3F3F47] text-[15px] font-normal font-figtree">
                    This will be displayed on your profile and visible to clients.
                </p>
            </div>
            <div className="space-y-3">
                <div className="flex items-center gap-3 p-4 rounded-[8px] border border-[#71717B] bg-[#E6E9EA] cursor-pointer"
                    onClick={() => setFormData((prev: FormData) => ({ ...prev, isIndividual: false }))}
                >
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${!formData.isIndividual ? 'border-[#04222D]' : 'border-gray-300'}`}>
                        {!formData.isIndividual && <div className="w-2.5 h-2.5 rounded-full bg-[#04222D]" />}
                    </div>
                    <span className="text-[15px] font-medium font-figtree text-[#030303]">Business / Company</span>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-[8px] border border-[#71717B] bg-[#E6E9EA] cursor-pointer"
                    onClick={() => setFormData((prev: FormData) => ({ ...prev, isIndividual: true }))}
                >
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${formData.isIndividual ? 'border-[#04222D]' : 'border-gray-300'}`}>
                        {formData.isIndividual && <div className="w-2.5 h-2.5 rounded-full bg-[#04222D]" />}
                    </div>
                    <span className="text-[15px] font-medium font-figtree text-[#030303]">Individual / Freelancer</span>
                </div>
                <input
                    type="text"
                    value={formData.businessName}
                    onChange={(e) => setFormData((prev: FormData) => ({ ...prev, businessName: e.target.value }))}
                    placeholder={formData.isIndividual ? 'Your Name' : 'Business Name'}
                    className="w-full px-5 py-4 border border-gray-300 rounded-[8px] bg-white outline-none focus:border-[#04222D] focus:ring-1 focus:ring-[#04222D] font-figtree text-[15px] text-[#030303] placeholder:text-gray-400 shadow-sm transition-all"
                />
            </div>
        </motion.div>
    );
}

export function StepPOCName({ formData, setFormData }: Props) {
    return (
        <motion.div key="step2" {...stepVariants} className="space-y-6 pb-10">
            <div className="space-y-2">
                <h1 className="text-[#030303] text-[24px] font-semibold leading-[32px] font-figtree">
                    Point of Contact Name
                </h1>
                <p className="text-[#3F3F47] text-[15px] font-normal font-figtree">
                    Who should clients reach out to?
                </p>
            </div>
            <input
                type="text"
                value={formData.pocName}
                onChange={(e) => setFormData((prev: FormData) => ({ ...prev, pocName: e.target.value }))}
                placeholder="Full Name"
                className="w-full px-5 py-4 border border-gray-300 rounded-[8px] bg-white outline-none focus:border-[#04222D] focus:ring-1 focus:ring-[#04222D] font-figtree text-[15px] text-[#030303] placeholder:text-gray-400 shadow-sm transition-all"
            />
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
    return (
        <motion.div key={stepKey} {...stepVariants} className="space-y-6 pb-10">
            <div className="space-y-2">
                <h1 className="text-[#030303] text-[24px] font-semibold leading-[32px] font-figtree">{title}</h1>
                <p className="text-[#3F3F47] text-[15px] font-normal font-figtree">{subtitle}</p>
            </div>
            <div className="space-y-3">
                {options.map((opt) => (
                    <button
                        key={opt}
                        onClick={() => onChange(opt)}
                        className={`w-full px-5 py-4 rounded-[8px] border text-left font-figtree text-[15px] font-medium transition-all ${value === opt
                            ? 'border-[#04222D] bg-[#04222D]/5 text-[#04222D]'
                            : 'border-[#71717B] bg-[#E6E9EA] text-[#030303]'}`}
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
                    <span className={`text-[12px] font-medium font-figtree transition-colors ${formData.description.length > 400
                            ? 'text-rose-500'
                            : 'text-gray-400'
                        }`}>
                        {formData.description.length}/400
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
                <p className="text-[13px] font-medium font-figtree text-gray-400">
                    A minimum of 200 characters is required
                </p>
            </div>
        </motion.div>
    );
}
