const fs = require('fs');
const file = '/Users/sumitkumar/Desktop/Eventory/eventory_V2/Eventory_V2_frontend/src/features/packages/flows/decorator/Step1EventAndCrew.tsx';
let content = fs.readFileSync(file, 'utf8');

// Update Props
content = content.replace(
    'poc: string;',
    'eventMinDuration: string;\n    setEventMinDuration: (v: string) => void;\n    eventMaxDuration: string;\n    setEventMaxDuration: (v: string) => void;\n    poc: string;'
);

// Add eventMinDuration to component signature
content = content.replace(
    'poc,\n    setPoc,',
    'eventMinDuration,\n    setEventMinDuration,\n    eventMaxDuration,\n    setEventMaxDuration,\n    poc,\n    setPoc,'
);

// Update Section 1 Heading
content = content.replace(
    '<h3 style={{ fontFamily: \'Figtree, sans-serif\' }} className={HEAD}>Package and Event Details *</h3>',
    '<h3 style={{ fontFamily: \'Figtree, sans-serif\' }} className={HEAD}>Package Details *</h3>'
);

// Update Package name placeholder
content = content.replace(
    'placeholder="e.g., Premium Wedding Buffet"',
    'placeholder="Package Name"'
);

// Add Event duration
const eventDurationHtml = `
                <div className="flex flex-col gap-2">
                    <label style={{ fontFamily: 'Figtree, sans-serif' }} className={LABEL}>Event duration *</label>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="relative">
                            <select
                                value={eventMinDuration}
                                onChange={(event) => setEventMinDuration(event.target.value)}
                                style={{ fontFamily: 'Figtree, sans-serif' }}
                                className={\`\${INPUT} appearance-none pr-12 \${eventMinDuration ? 'text-[#030303]' : 'text-[#9F9FA9]'}\`}
                            >
                                <option value="">hrs</option>
                                {[...Array(24)].map((_, i) => (
                                    <option key={i+1} value={i+1}>{i+1} hrs</option>
                                ))}
                            </select>
                            <ChevronDown size={20} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#9F9FA9]" />
                        </div>
                        <div className="relative">
                            <select
                                value={eventMaxDuration}
                                onChange={(event) => setEventMaxDuration(event.target.value)}
                                style={{ fontFamily: 'Figtree, sans-serif' }}
                                className={\`\${INPUT} appearance-none pr-12 \${eventMaxDuration ? 'text-[#030303]' : 'text-[#9F9FA9]'}\`}
                            >
                                <option value="">hrs</option>
                                {[...Array(24)].map((_, i) => (
                                    <option key={i+1} value={i+1}>{i+1} hrs</option>
                                ))}
                            </select>
                            <ChevronDown size={20} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#9F9FA9]" />
                        </div>
                    </div>
                </div>
`;

content = content.replace(
    '</section>\n\n            {/* Capacity & Crew */}',
    eventDurationHtml + '\n            </section>\n\n            {/* Capacity & Crew */}'
);

// Update Section 2 Heading
content = content.replace(
    '<h3 style={{ fontFamily: \'Figtree, sans-serif\' }} className={HEAD}>Capacity & Crew *</h3>',
    '<h3 style={{ fontFamily: \'Figtree, sans-serif\' }} className={HEAD}>Crew and Setup *</h3>'
);

// Swap Setup Duration and POC, change POC label, add helper texts
// Actually, let's just replace the whole section

const oldSection2 = `<section className={CARD}>
                <h3 style={{ fontFamily: 'Figtree, sans-serif' }} className={HEAD}>Capacity & Crew *</h3>

                <div className="flex flex-col gap-2">
                    <label style={{ fontFamily: 'Figtree, sans-serif' }} className={LABEL}>Setup Duration</label>
                    <div className="relative">
                        <select
                            value={setupDuration}
                            onChange={(event) => setSetupDuration(event.target.value)}
                            style={{ fontFamily: 'Figtree, sans-serif' }}
                            className={\`\${INPUT} appearance-none pr-12 \${setupDuration ? 'text-[#030303]' : 'text-[#9F9FA9]'}\`}
                        >
                            <option value="">E.g Upto 2 hours</option>
                            {setupDurationOptions.map((option) => (
                                <option key={option} value={option}>{option}</option>
                            ))}
                        </select>
                        <ChevronDown size={20} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#9F9FA9]" />
                    </div>
                </div>

                <div className="flex flex-col gap-2">
                    <label style={{ fontFamily: 'Figtree, sans-serif' }} className={LABEL}>POC</label>
                    <div className="relative">
                        <select
                            value={poc}
                            onChange={(event) => setPoc(event.target.value)}
                            style={{ fontFamily: 'Figtree, sans-serif' }}
                            className={\`\${INPUT} appearance-none pr-12 \${poc ? 'text-[#030303]' : 'text-[#9F9FA9]'}\`}
                        >
                            <option value="">Text + Dropdown</option>
                            {pocOptions.map((option) => (
                                <option key={option} value={option}>{option}</option>
                            ))}
                        </select>
                        <ChevronDown size={20} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#9F9FA9]" />
                    </div>
                </div>

                <div className="flex flex-col gap-2">
                    <label style={{ fontFamily: 'Figtree, sans-serif' }} className={LABEL}>Number of people in crew</label>
                    <div className="grid grid-cols-2 gap-4">
                        <input
                            type="text"
                            placeholder="Min. Crew Size"
                            value={supervisors}
                            onChange={(event) => setSupervisors(event.target.value.replace(/\\D/g, ''))}
                            style={{ fontFamily: 'Figtree, sans-serif' }}
                            className={INPUT}
                        />
                        <input
                            type="text"
                            placeholder="Max. Crew Size"
                            value={workers}
                            onChange={(event) => setWorkers(event.target.value.replace(/\\D/g, ''))}
                            style={{ fontFamily: 'Figtree, sans-serif' }}
                            className={INPUT}
                        />
                    </div>
                </div>
            </section>`;

const oldSection2Regex = /<section className=\{CARD\}>\s*<h3 style=\{\{ fontFamily: 'Figtree, sans-serif' \}\} className=\{HEAD\}>Crew and Setup \*\s*<\/h3>[\s\S]*?<\/section>/;

const newSection2 = `<section className={CARD}>
                <h3 style={{ fontFamily: 'Figtree, sans-serif' }} className={HEAD}>Crew and Setup *</h3>

                <div className="flex flex-col gap-2">
                    <label style={{ fontFamily: 'Figtree, sans-serif' }} className={LABEL}>Point of Contact(POC)</label>
                    <div className="relative">
                        <select
                            value={poc}
                            onChange={(event) => setPoc(event.target.value)}
                            style={{ fontFamily: 'Figtree, sans-serif' }}
                            className={\`\${INPUT} appearance-none pr-12 \${poc ? 'text-[#030303]' : 'text-[#9F9FA9]'}\`}
                        >
                            <option value="">Enter POC name</option>
                            {pocOptions.map((option) => (
                                <option key={option} value={option}>{option}</option>
                            ))}
                        </select>
                        <ChevronDown size={20} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#9F9FA9]" />
                    </div>
                </div>

                <div className="flex flex-col gap-2">
                    <label style={{ fontFamily: 'Figtree, sans-serif' }} className={LABEL}>Setup Duration</label>
                    <div className="relative">
                        <select
                            value={setupDuration}
                            onChange={(event) => setSetupDuration(event.target.value)}
                            style={{ fontFamily: 'Figtree, sans-serif' }}
                            className={\`\${INPUT} appearance-none pr-12 \${setupDuration ? 'text-[#030303]' : 'text-[#9F9FA9]'}\`}
                        >
                            <option value="">E.g Upto 1 hour</option>
                            {setupDurationOptions.map((option) => (
                                <option key={option} value={option}>{option}</option>
                            ))}
                        </select>
                        <ChevronDown size={20} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#9F9FA9]" />
                    </div>
                    <p style={{ fontFamily: 'Figtree, sans-serif' }} className={HELPER}>Helper Text according to Input field.</p>
                </div>

                <div className="flex flex-col gap-2">
                    <label style={{ fontFamily: 'Figtree, sans-serif' }} className={LABEL}>Number of people in crew</label>
                    <div className="grid grid-cols-2 gap-4">
                        <input
                            type="text"
                            placeholder="Supervisors"
                            value={supervisors}
                            onChange={(event) => setSupervisors(event.target.value.replace(/\\D/g, ''))}
                            style={{ fontFamily: 'Figtree, sans-serif' }}
                            className={INPUT}
                        />
                        <input
                            type="text"
                            placeholder="Workers"
                            value={workers}
                            onChange={(event) => setWorkers(event.target.value.replace(/\\D/g, ''))}
                            style={{ fontFamily: 'Figtree, sans-serif' }}
                            className={INPUT}
                        />
                    </div>
                </div>
            </section>`;

content = content.replace(oldSection2Regex, newSection2);

// Section 3
content = content.replace(
    '<h3 style={{ fontFamily: \'Figtree, sans-serif\' }} className={HEAD}>On-site Requirements *</h3>',
    '<h3 style={{ fontFamily: \'Figtree, sans-serif\' }} className={HEAD}>Venue Needs *</h3>'
);

content = content.replace(
    'Helper Text according to Input field.</p>',
    'Enter your Venue needs in the text box</p>'
);

fs.writeFileSync(file, content);
