// dashboard/utils/kpi.ts

export const formatKpi = (item: any) => ({
    income: item.total_income,
    spend: item.total_spend,
    subscribers: item.total_subscribers,
    dialogs: item.total_dialogs,

    pricePerSub: item.total_subscribers ? item.total_spend / item.total_subscribers : null,
    pricePerDialog: item.total_dialogs ? item.total_spend / item.total_dialogs : null,
});
