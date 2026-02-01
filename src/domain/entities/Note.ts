export type NoteType = 'TEXT' | 'SHOPPING_LIST';

export interface ShoppingItem {
    id: string;
    text: string;
    checked: boolean;
    price?: number;
}

export class Note {
    public readonly id!: string;
    public title!: string;
    public farmId!: string;
    public type!: NoteType;
    public content: string = "";
    public items: ShoppingItem[] = [];
    public readonly createdAt!: Date;
    public updatedAt!: Date;
    public isDeleted: boolean = false;

    constructor(data?: Partial<Note>) {
        if (data) {
            Object.assign(this, data);
        }
    }

    get checkedTotal(): number {
        return this.items
            .filter(i => i.checked)
            .reduce((sum, i) => sum + (i.price || 0), 0);
    }

    get uncheckedTotal(): number {
        return this.items
            .filter(i => !i.checked)
            .reduce((sum, i) => sum + (i.price || 0), 0);
    }

    get grandTotal(): number {
        return this.items
            .reduce((sum, i) => sum + (i.price || 0), 0);
    }
}
