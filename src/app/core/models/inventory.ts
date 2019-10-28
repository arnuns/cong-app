export interface Inventory {
    id: number;
    name: string;
    unitPrice: number;
    isDefault: boolean;
    status: boolean;
    createOn: Date;
    createBy: string;
    quantity: number;
    total: number;
}
