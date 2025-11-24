import User from "./User";
import Project from "./Project";
import ShiftType from "@/enums/ShiftType";

type Shift = {
    id: number;
    date: string;
    start_time: string | null;
    end_time: string | null;
    type: ShiftType;
    user: User | null;
    project: Project | null;
    project_id: number;
};

export default Shift;