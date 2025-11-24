// dashboard/components/ProjectCard.tsx

import DepositType  from "@/enums/DepositType";
import DepositStatus from "@/enums/DepositStatus";

type Props = {
    project: any;
    deposits: any[];
    spends: any[];
    shifts: any[];
};

export default function ProjectCard({ project, deposits, spends, shifts }: Props) {

    const dp = deposits ?? [];

    const dpFD = dp.filter(d => d.type === DepositType.FD);
    const dpRD = dp.filter(d => d.type === DepositType.RD);

    const sp = spends ?? [];
    const sh = shifts ?? [];

    const subscribers = sp.reduce((a, s) => a + +s.subscribers, 0);
    const dialogs = sp.reduce((a, s) => a + +s.dialogs, 0);

    const sumDeposits = dp.reduce((a, d) => a + +d.amount, 0);
    const sumFD = dpFD.reduce((a, d) => a + +d.amount, 0);
    const sumRD = dpRD.reduce((a, d) => a + +d.amount, 0);
    const sumSpends = sp.reduce((a, s) => a + +s.amount, 0);

    const pricePerSub = subscribers ? (sumSpends / subscribers).toFixed(2) : "-";
    const pricePerDialog = dialogs ? (sumSpends / dialogs).toFixed(2) : "-";

    const paid = dp.filter(d => d.status === DepositStatus.PAID).length;
    const pending = dp.filter(d => d.status === DepositStatus.PENDING).length;
    const failed = dp.filter(d => d.status === DepositStatus.FAILED).length;

    const countFD = dpFD.filter(d => d.status === DepositStatus.PAID).length;
    const countRD = dpRD.filter(d => d.status === DepositStatus.PAID).length;

    const paidFD = dpFD.filter(d => d.status === DepositStatus.PAID).reduce((a, d) => a + +d.amount, 0);
    const pendingFD = dpFD.filter(d => d.status === DepositStatus.PENDING).reduce((a, d) => a + +d.amount, 0);
    const failedFD = dpFD.filter(d => d.status === DepositStatus.FAILED).reduce((a, d) => a + +d.amount, 0);

    const paidRD = dpRD.filter(d => d.status === DepositStatus.PAID).reduce((a, d) => a + +d.amount, 0);
    const pendingRD = dpRD.filter(d => d.status === DepositStatus.PENDING).reduce((a, d) => a + +d.amount, 0);
    const failedRD = dpRD.filter(d => d.status === DepositStatus.FAILED).reduce((a, d) => a + +d.amount, 0);

    const paidFDCount = dpFD.filter(d => d.status === DepositStatus.PAID).length;
    const pendingFDCount = dpFD.filter(d => d.status === DepositStatus.PENDING).length;
    const failedFDCount = dpFD.filter(d => d.status === DepositStatus.FAILED).length;

    const paidRDCount = dpRD.filter(d => d.status === DepositStatus.PAID).length;
    const pendingRDCount = dpRD.filter(d => d.status === DepositStatus.PENDING).length;
    const failedRDCount = dpRD.filter(d => d.status === DepositStatus.FAILED).length;

    return (
        <div className="rounded-xl border p-4 bg-white/40 dark:bg-neutral-900/40">
            <div className="text-lg font-bold mb-4">{project.name}</div>

            <div className="space-y-2">
                
                {/* Deposits count */}
                <div className="flex justify-between">
                    <span className="font-medium">Deposits:</span>
                    <span>
                        <span className="text-green-600 font-bold">{paid}</span> / 
                        <span className="text-yellow-600">{pending}</span> /
                        <span className="text-red-600">{failed}</span>
                        <span className=""> | {dp.length}</span>
                    </span>
                </div>

                {/* Paid deposit sum */}
                <div className="flex justify-between">
                    <span className="font-medium">Deposits Sum:</span>
                    <span className="font-bold text-green-600">
                        <span className="text-green-600 font-bold">{paidRD + paidFD}$</span>
                    </span>
                </div>

                {/* Penging deposit sum */}
                <div className="flex justify-between">
                    <span className="font-medium">Pending Sum:</span>
                    <span className="font-bold text-yellow-600">
                        <span className="text-yellow-600 font-bold">{pendingRD + pendingFD}$</span>
                    </span>
                </div>
                
                {/* Failed deposit sum */}
                <div className="flex justify-between">
                    <span className="font-medium">Failed Sum:</span>
                    <span className="font-bold text-red-600">
                        <span className="text-red-600 font-bold">{failedRD + failedFD}$</span>
                    </span>
                </div>

                {/* FD */}
                <div className="flex justify-between">
                    <span className="font-medium">FD:</span>
                    <span className="font-bold">
                        <span className="text-green-600 font-bold">{paidFDCount}</span> / 
                        <span className="text-yellow-600">{pendingFDCount}</span> /
                        <span className="text-red-600">{failedFDCount}</span>
                        <span className=""> | { dpFD.length}</span>
                    </span>
                </div>

                {/* RD */}
                <div className="flex justify-between">
                    <span className="font-medium">RD:</span>
                    <span className="font-bold">
                        <span className="text-green-600 font-bold">{paidRDCount}</span> / 
                        <span className="text-yellow-600">{pendingRDCount}</span> /
                        <span className="text-red-600">{failedRDCount}</span>
                        <span className=""> | { dpRD.length}</span>
                    </span>
                </div>

                {/* FD/RD */}
                <div className="flex justify-between">
                    <span className="font-medium">FD Sum:</span>
                    <span className="font-semibold text-green-600">${paidFD.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                    <span className="font-medium">RD Sum:</span>
                    <span className="font-semibold text-green-600">${paidRD.toFixed(2)}</span>
                </div>

                {/* Spends */}
                <div className="flex justify-between">
                    <span className="font-medium">Spends:</span>
                    <span className="font-semibold text-red-600">${sumSpends.toFixed(2)}</span>
                </div>

                {/* Subscribers */}
                <div className="flex justify-between">
                    <span className="font-medium">Subscribers:</span>
                    <span>{subscribers} = {pricePerSub}$/sub</span>
                </div>

                {/* Dialogs */}
                <div className="flex justify-between">
                    <span className="font-medium">Dialogs:</span>
                    <span>{dialogs} = {pricePerDialog}$/dialog</span>
                </div>

                {/* Shifts */}
                <div className="flex justify-between mt-3 border-t pt-3 border-neutral-300/40">
                    <span className="font-medium">Shifts:</span>
                    <span className="font-bold">{sh.length}</span>
                </div>
            </div>
        </div>
    );
}
