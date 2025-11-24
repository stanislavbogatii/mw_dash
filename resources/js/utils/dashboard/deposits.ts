// dashboard/utils/deposits.ts

export const countDeposits = (items: any[]) => ({
    paid: items.filter(d => d.status === "PAID").length,
    pending: items.filter(d => d.status === "PENDING").length,
    failed: items.filter(d => d.status === "FAILED").length,

    sumPaid: items.filter(d => d.status === "PAID").reduce((a, d) => a + +d.amount, 0),
    sumPending: items.filter(d => d.status === "PENDING").reduce((a, d) => a + +d.amount, 0),
    sumFailed: items.filter(d => d.status === "FAILED").reduce((a, d) => a + +d.amount, 0),
});
