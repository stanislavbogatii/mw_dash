import Deposit from "@/models/Deposit";
import Shift from "@/models/Shift";
import Spend from "@/models/Spend";

// dashboard/components/TopMetrics.tsx
type Props = {
    deposits: Deposit[];
    spends: Spend[];
    shifts: Shift[];

    includeShifts?: boolean;
    includeSpends?: boolean;
    includeDeposits?: boolean;
};

export default function TopMetrics({ deposits, spends, shifts, includeShifts = true, includeSpends = true, includeDeposits = true }: Props) {
    const totalSum = deposits.reduce((a, d) => a + +d.amount, 0);
    const paidSum = deposits.filter(d => d.status === "PAID").reduce((a, d) => a + +d.amount, 0);
    const pendingSum = deposits.filter(d => d.status === "PENDING").reduce((a, d) => a + +d.amount, 0);
    const failedSum = deposits.filter(d => d.status === "FAILED").reduce((a, d) => a + +d.amount, 0);

    const paidCount = deposits.filter(d => d.status === "PAID").length;
    const pendingCount = deposits.filter(d => d.status === "PENDING").length;
    const failedCount = deposits.filter(d => d.status === "FAILED").length;
    const totalCount = deposits.length;

    const totalSpends = spends.reduce((a, s) => a + +s.amount, 0);

    return (
        <div className="flex gap-4">
            {/* Deposits */}
           {includeDeposits && <div className="rounded-xl flex-1 p-5 border bg-white/40 dark:bg-neutral-900/40 flex flex-col items-center">
                <div className="text-lg font-medium">Total Deposits</div>
                <div>
                    <div className="flex flex-row gap-4 mt-2">
                        <span className="text-green-500 text-xl font-bold">${paidSum.toFixed(2)}</span>
                        <span className="text-yellow-500 text-xl">${pendingSum.toFixed(2)}</span>
                        <span className="text-red-500 text-xl">${failedSum.toFixed(2)}</span>
                    </div>
                    <div className="flex flex-row mt-2 justify-around w-full">
                        <span className="text-green-500 text-sm font-bold">{paidCount}</span>
                        <span className="text-yellow-500 text-sm">{pendingCount}</span>
                        <span className="text-red-500 text-sm">{failedCount}</span>
                    </div>
                </div>
            </div>}

            {includeShifts && <div className="rounded-xl flex-1 p-5 border bg-white/40 dark:bg-neutral-900/40 flex flex-col items-center">
                <div className="text-lg font-medium">Total Shifts</div>
                <div className="text-4xl font-bold mt-2">{shifts.length}</div>
            </div>}

            {includeSpends && <div className="rounded-xl flex-1 p-5 border bg-white/40 dark:bg-neutral-900/40 flex flex-col items-center">
                <div className="text-lg font-medium">Total Spends</div>
                <div className="text-4xl font-bold mt-2">${totalSpends.toFixed(2)}</div>
            </div>}
        </div>
    );
}
