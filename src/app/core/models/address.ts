export interface Province {
    id: number;
    code: string;
    name: string;
    nameEn: string;
    geoId: number;
    minimumWage: number;
}

export interface Amphur {
    id: number;
    code: string;
    name: string;
    nameEn: string;
    geoId: number;
    provinceId: number;
}

export interface District {
    id: number;
    code: string;
    name: string;
    nameEn: string;
    amphurId: number;
    provinceId: number;
    geoId: number;
}
