function buildOfflineFallback(userPlan) {
    const lower = userPlan.toLowerCase();
    let originalCost = 5000;
    let altCost = 3200;
    let originalTitle = 'Your original plan';
    let altTitle = 'Lower-cost alternative';
    let alt2Title = 'Second-hand / local swap';

    if (/trip|travel|flight|train|bus|mumbai|delhi|goa|bangalore/i.test(lower)) {
        originalCost = 4200;
        altCost = 2100;
        originalTitle = 'Direct peak-time booking';
        altTitle = 'Off-peak train / bus';
        alt2Title = 'Carpool or shared ride';
    } else if (/food|grocery|swiggy|zomato|restaurant/i.test(lower)) {
        originalCost = 650;
        altCost = 380;
        originalTitle = 'Delivery from premium outlet';
        altTitle = 'Pickup from local store';
        alt2Title = 'Meal prep at home';
    } else if (/phone|laptop|tablet|gadget|amazon|flipkart|buy|order/i.test(lower)) {
        originalCost = 28000;
        altCost = 19500;
        originalTitle = 'Brand-new retail purchase';
        altTitle = 'Certified refurbished unit';
        alt2Title = 'Exchange + refurbished deal';
    }

    return {
        isAlreadyOptimal: false,
        celebrationMessage: '',
        efficiencyStats: {
            costRating: 'Estimated Savings',
            carbonScore: '35% below average'
        },
        userOriginalWay: {
            title: originalTitle,
            costINR: originalCost,
            qualityMetric: 'Familiar convenient option',
            softSuggestion: 'Compare 2–3 sellers before you commit.'
        },
        smartAlternatives: [
            {
                badge: 'Cheapest Choice',
                title: altTitle,
                costINR: altCost,
                carbonSavedPercent: 42,
                qualityAssurance: 'Same outcome less spend',
                actionButtonText: 'Explore option',
                actionLink: `https://www.google.com/search?q=${encodeURIComponent(userPlan)}`
            },
            {
                badge: 'Eco Bonus',
                title: alt2Title,
                costINR: Math.round(altCost * 0.72),
                carbonSavedPercent: 68,
                qualityAssurance: 'Lower footprint same need',
                actionButtonText: 'Browse listings',
                actionLink: 'https://www.olx.in'
            }
        ]
    };
}

module.exports = { buildOfflineFallback };