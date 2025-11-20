// type start
const SalarySchemeTypeSettings = {
    FIX: { label: "FIX", classes: "!bg-yellow-400" },
    PER_DEPOSIT: { label: "PER_DEPOSIT", classes: "!bg-red-400" },
    PER_INCOME: { label: "PER_INCOME", classes: "!bg-blue-400" },
    FROM_SPEND: { label: "FROM_SPEND", classes: "!bg-gray-400" },
    FROM_TOTAL_PROFIT: { label: "FROM_TOTAL_PROFIT", classes: "!bg-gray-400" },
    FROM_TOTAL_INCOME: { label: "FROM_TOTAL_INCOME", classes: "!bg-gray-400" },
} as const;

enum SalarySchemeTypeEnum {
    FIX = 'FIX',
    PER_DEPOSIT = 'PER_DEPOSIT',
    PER_INCOME = 'PER_INCOME',
    FROM_SPEND = 'FROM_SPEND',
    FROM_TOTAL_PROFIT = 'FROM_TOTAL_PROFIT',
    FROM_TOTAL_INCOME = 'FROM_TOTAL_INCOME',
}
// type end

// position type start
const SalarySchemePositionTypeSettings = {
    FD: { label: "FD", classes: "!bg-yellow-400" },
    RD: { label: "RD", classes: "!bg-red-400" },
    BUYING: { label: "BUYING", classes: "!bg-blue-400" },
    ALL: { label: "ALL", classes: "!bg-gray-400" },
    PERSONAL: { label: "PERSONAL", classes: "!bg-gray-400" },
} as const;

enum SalarySchemePositionTypeEnum {
    FD = 'FD',
    RD = 'RD',
    BUYING = 'BUYING',
    ALL = 'ALL',
    PERSONAL = 'PERSONAL',
}
// position type end

// value type start
enum SalarySchemeValueTypeEnum {
    percent = 'percent',
    amount = 'amount',
}

const SalarySchemeValueTypeSettings = {
    percent: { label: "percent", classes: "!bg-yellow-400" },
    amount: { label: "amount", classes: "!bg-red-400" },
} as const;
// value type end


const salarySchemePositionTypeActiveFields = {
    ['']: [
        'date', 
        'project_id', 
        'value', 
        'type', 
        'position_type', 
        'value_type',
        'min', 
        'max'
    ],
    [SalarySchemePositionTypeEnum.FD]: [
        'date', 
        'project_id', 
        'value', 
        'type', 
        'position_type', 
        'value_type',
        'min', 
        'max'
    ],
    [SalarySchemePositionTypeEnum.RD]: [
        'date', 
        'project_id', 
        'value', 
        'type', 
        'position_type', 
        'value_type',

        'min', 
        'max'
    ],
    [SalarySchemePositionTypeEnum.BUYING]: [
        'date', 
        'project_id', 
        'value', 
        'type', 
        'position_type', 
        'value_type',
        'min', 
        'max'
    ],
    [SalarySchemePositionTypeEnum.ALL]: [
        'date', 
        'project_id', 
        'value', 
        'type', 
        'position_type', 
        'value_type',
        'min', 
        'max'
    ],
    [SalarySchemePositionTypeEnum.PERSONAL]: [
        'date', 
        'project_id', 
        'user_id',
        'value', 
        'value_type',
        'type', 
        'position_type', 
        'min', 
        'max'
    ],
}

const salarySchemeTypeActiveFields = {
    ['']: [
        'date', 
        'project_id', 
        'value', 
        'type', 
        'position_type', 
        'value_type',
        'min', 
        'max'
    ],
    [SalarySchemeTypeEnum.FIX]: [
        'date', 
        'project_id', 
        'value', 
        'value_type',
        'type', 
        'position_type', 
        'min', 
        'max'
    ],
    [SalarySchemeTypeEnum.PER_DEPOSIT]: [
        'date', 
        'project_id', 
        'value_type',
        'value', 
        'type', 
        'position_type', 
        'min', 
        'max'
    ],
    [SalarySchemeTypeEnum.PER_INCOME]: [
        'date', 
        'project_id', 
        'value', 
        'type', 
        'position_type', 
        'value_type',
        'min', 
        'max'
    ],
    [SalarySchemeTypeEnum.FROM_SPEND]: [
        'date', 
        'project_id', 
        'value', 
        'type', 
        'position_type', 
        'value_type',
        'min', 
        'max'
    ],
    [SalarySchemeTypeEnum.FROM_TOTAL_PROFIT]: [
        'date', 
        'project_id', 
        'value', 
        'type', 
        'position_type', 
        'min', 
        'value_type',
        'max'
    ],
    [SalarySchemeTypeEnum.FROM_TOTAL_INCOME]: [
        'date', 
        'project_id', 
        'value', 
        'value_type',
        'type', 
        'position_type', 
        'min', 
        'max'
    ],
}

type SalaryScheme = {
    id: number;
    date: string;
    value: number;
    type: SalarySchemeTypeEnum,
    min?: number;
    max?: number;
    position_type: SalarySchemePositionTypeEnum;
    value_type: SalarySchemeValueTypeEnum;
    project_id: number;
    user_id?: number;
}

const isFieldVisible = (row: SalaryScheme, field: string) => {
    const posFields = salarySchemePositionTypeActiveFields[row.position_type] || [];
    const typeFields = salarySchemeTypeActiveFields[row.type] || [];

    return posFields.includes(field) || typeFields.includes(field);
};

const isFieldVisibleForm = (form: SalaryScheme, field: string) => {
    const posFields = salarySchemePositionTypeActiveFields[form.position_type] || [];
    const typeFields = salarySchemeTypeActiveFields[form.type] || [];

    return posFields.includes(field) || typeFields.includes(field);
};

export { isFieldVisible, isFieldVisibleForm };
