const fs = require('fs');
const djPath = 'c:/Users/Sumit/Desktop/Visual Studio Codes/Eventory/Eventory_V2_frontend/src/features/packages/flows/dj/Step3PricingAndPolicies.tsx';
let djContent = fs.readFileSync(djPath, 'utf8');

const makeupBlock = fs.readFileSync('dynamic_pricing_block.txt', 'utf8');

// Extract from DJ the guest count block
const guestCountRegex = /\{\/\* Guest Count Pricing inside Dynamic Pricing \*\/\}(.|\n)*?<\/button>\s*<\/div>/g;
const guestCountMatch = djContent.match(guestCountRegex)[0];

const destructureBlock = `
                    const {
                        packagePrice, weekendPricing, setWeekendPricing,
                        weekendIncreaseType, setWeekendIncreaseType,
                        weekendValue, setWeekendValue,
                        weekendDays, setWeekendDays,
                        weekendSeason, setWeekendSeason,
                        seasonIncreaseType, setSeasonIncreaseType,
                        seasonValue, setSeasonValue,
                        festivalPricing, setFestivalPricing,
                        selectedFestivals, setSelectedFestivals,
                        availableFestivals,
                        isAddingFestival, setIsAddingFestival,
                        newFestivalName, setNewFestivalName,
                        handleAddFestival,
                        festivalPrices, setFestivalPrices,
                        customDatesPricing, setCustomDatesPricing,
                        customDatesIncreaseType, setCustomDatesIncreaseType,
                        customDatesValue, setCustomDatesValue,
                        customDatesStartDate, setCustomDatesStartDate,
                        customDatesEndDate, setCustomDatesEndDate,
                    } = p;
`;

// Now combine destructure + makeupBlock + guestCountMatch + closing div
const combinedReplacement = `                {p.isDynamicPricingEnabled && (() => {${destructureBlock}
${makeupBlock}

                            ${guestCountMatch}

                        </div>
                    );
                })()}`;

// Replace the old block in DJ
const oldBlockRegex = /\{p\.isDynamicPricingEnabled && \(\(\) => \{[\s\S]*?\}\)\(\)\}/;
djContent = djContent.replace(oldBlockRegex, combinedReplacement);

fs.writeFileSync(djPath, djContent);
console.log('Successfully updated DJStep3PricingAndPolicies.tsx');
