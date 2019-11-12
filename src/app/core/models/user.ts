import { Site } from './site';
import { Company } from './company';
import { Hospital } from './hospital';

export interface User {
    empNo: number;
    roleId: string;
    role: Role;
    companyId: string;
    company: Company;
    siteId: number;
    site: Site;
    idCardNumber: string;
    dateIssued: Date;
    expiryDate: Date;
    title: string;
    firstName: string;
    lastName: string;
    titleEn: string;
    firstnameEn: string;
    lastnameEn: string;
    imageProfile: string;
    gender: string;
    birthdate: Date;
    height: number;
    weight: number;
    ethnicity: string;
    nationality: string;
    religion: string;
    email: string;
    phoneNo: string;
    currentAddress: string;
    permanentAddress: string;
    residenceStatus: string;
    parentName_1: string;
    parentAge_1: number;
    parentJob_1: string;
    parentName_2: string;
    parentAge_2: number;
    parentJob_2: string;
    militaryStatus: string;
    education: string;
    graduateSchool: string;
    faculty: string;
    disability: string;
    congenitalDisease: string;
    isPreviousConviction: boolean;
    numOfConviction: number;
    convictionCause: string;
    training_1: string;
    training_2: string;
    training_3: string;
    bankId: number;
    bankName: string;
    bankAccount: string;
    refName_1: string;
    refRelation_1: string;
    refPhoneNo_1: string;
    refAddress_1: string;
    refName_2: string;
    refRelation_2: string;
    refPhoneNo_2: string;
    refName_3: string;
    refRelation_3: string;
    refPhoneNo_3: string;
    subscribeId: number;
    notificationToken: string;
    startDate: Date;
    endDate: Date;
    resignationCause: string;
    defect: string;
    licenseNo: string;
    licenseStartDate: Date;
    licenseEndDate: Date;
    socialSecurityStartDate: Date;
    socialSecurityEndDate: Date;
    socialHospitalId: number;
    hospital: Hospital;
    isTemporary: boolean;
    isSocialSecurity: boolean;
    status: boolean;
    isComplete: boolean;
    registerOn: Date;
    createBy: string;
    createOn: Date;
    updateBy: string;
    updateOn: Date;
    token: string;
    documents: Document[];
    jobHistories: JobHistory[];
    languageAbilities: LanguageAbility[];
    timelineUsers: TimelineUser[];
}

export interface TimelineUser {
    id: number;
    empNo: number;
    company: string;
    siteName: string;
    reason: string;
    effectiveDate: Date;
    approveBy: string;
    isApprove: boolean;
    status: boolean;
    description: string;
    createOn: Date;
    updateOn: Date;
}

export interface JobHistory {
    id: number;
    empNo: number;
    companyName: string;
    position: string;
    resignationCause: string;
    seq: number;
    duration: string;
}

export interface LanguageAbility {
    id: number;
    empNo: number;
    language: string;
    read: string;
    write: string;
    conversation: string;
}

export interface Document {
    id: number;
    empNo: number;
    type: string;
    name: string;
    filePath: string;
    fileType: string;
    createOn: Date;
    createBy: string;
}

export interface Login {
    password: string;
    empNo: number;
}

export interface Role {
    id: string;
    code: string;
    name: string;
    nameTH: string;
    createOn: Date;
}

export interface BeginResign {
    companyId: string;
    siteId: number;
    oldStartDate: string;
    oldEndDate: string;
    startDate: string;
    description: string;
}
