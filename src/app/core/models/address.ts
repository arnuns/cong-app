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
    province: Province;
}

export interface District {
    id: number;
    code: string;
    name: string;
    nameEn: string;
    amphurId: number;
    amphur: Amphur;
    provinceId: number;
    province: Province;
    geoId: number;
}

export interface Postcode {
    id: number;
    districtCode: string;
    code: string;
}
