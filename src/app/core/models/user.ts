import { Inventory } from './inventory';
import { DatePicker } from './datepicker';

export interface User {
    empNo: number;
    password: string;
    company: string;
    site: string;
    siteId: number;
    roleId: string;
    roleName: string;
    idCardNumber: string;
    dateIssued: string;
    dateIssuedPicker: DatePicker;
    expiryDate: string;
    expiryDatePicker: DatePicker;
    birthdate: string;
    birthdatePicker: DatePicker;
    title: string;
    firstname: string;
    lastname: string;
    titleEn: string;
    firstnameEn: string;
    lastnameEn: string;
    gender: string;
    ethnicity: string;
    nationality: string;
    religion: string;
    email: string;
    phoneNo: string;
    currentAddress: string;
    permanentAddress: string;
    residenceStatus: string;
    parentName_1: string;
    parentJob_1: string;
    parentName_2: string;
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
    isTemporary: boolean;
    status: boolean;
    isComplete: boolean;
    isSocialSecurity: boolean;
    createBy: string;
    updateBy: string;
    token: string;
    training_1: string;
    training_2: string;
    training_3: string;
    inventory: Inventory[];
    timelineUser: TimelineUser[];
    startDate: string;
    startDatePicker: DatePicker;
    endDate: string;
    endDatePicker: DatePicker;
    resignationCause: string;
    defect: string;
    licenseNo: string;
    licenseStartDate: string;
    licenseStartDatePicker: DatePicker;
    licenseEndDate: string;
    licenseEndDatePicker: DatePicker;
    socialSecurityStartDate: string;
    ssoStartDatePicker: DatePicker;
    socialSecurityEndDate: string;
    ssoEndDatePicker: DatePicker;
    socialHospitalId: number;
    socialHospitalName: string;
    age: number;
    height: number;
    weight: number;
    parentAge_1: number;
    parentAge_2: number;
    jobHistorys: JobHistory[];
    languageAbilitys: LanguageAbility[];
    importantDocuments: Document[];
    imageProfile: string;
    registerOn: string;
    registerOnPicker: DatePicker;
    createOn: Date;
    updateOn: Date;
    hiringRatePerDay: number;
    minimumManday: number;
    minimumWage: number;
    retiredAge: number;
    workExperience: number;
    minimumSalary: number;
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
