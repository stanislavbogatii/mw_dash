// dashboard/components/ShiftCard.tsx

type Props = {
    shift: any;
};

export default function ShiftCard({ shift }: Props) {
    return (
        <div className="flex flex-col rounded-lg p-3 bg-neutral-100 dark:bg-neutral-800 border border-neutral-300/60 dark:border-neutral-700/60">
            <div className="font-medium">
                {shift.user ? shift.user.name : "Unknown User"}
            </div>
            <div className="text-xs text-neutral-600 dark:text-neutral-400">
                {shift.start_time ?? "??"} – {shift.end_time ?? "??"}
            </div>

            <div className="mt-1 inline-flex items-center px-2 py-0.5 text-xs font-semibold rounded bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">
                {shift.type === "first_deposit" && "FD"}
                {shift.type === "recurring_deposit" && "RD"}
                {shift.type === "all_shifts" && "ALL"}
            </div>
        </div>
    );
}
