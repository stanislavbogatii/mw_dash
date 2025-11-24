// dashboard/utils/spends.ts

export const calcSpends = (spends: any[]) => {
    const total = spends.reduce((a, s) => a + +s.amount, 0);
    const subscribers = spends.reduce((a, s) => a + +s.subscribers, 0);
    const dialogs = spends.reduce((a, s) => a + +s.dialogs, 0);

    return {
        total,
        subscribers,
        dialogs,
        pricePerSub: subscribers ? total / subscribers : null,
        pricePerDialog: dialogs ? total / dialogs : null,
    };
};
