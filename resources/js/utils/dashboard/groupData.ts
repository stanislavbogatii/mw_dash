// dashboard/utils/groupData.ts

export const groupByProject = (items: any[]) => {
    if (!items) return {};
    return Object.groupBy(items, item => item.project_id);
};
