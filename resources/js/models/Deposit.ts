import DepositType from "@/enums/DepositType";
import { User } from "@/types";
import Commission from "./Commission";
import Project from "./Project";
import DepositStatus from "@/enums/DepositStatus";

type Deposit = {
    id: number;
    date: string;
    time: string;
    amount: string;
    status: DepositStatus;
    user_id: number;
    project_id: number;
    commission_id: number;
    commission: Commission;
    type: DepositType;
    user: User | null;
    project: Project | null;
};

export default Deposit;