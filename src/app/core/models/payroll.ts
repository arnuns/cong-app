export interface PayrollCycle {
    id: number;
    start: string;
    end: string;
    isMonthly: boolean;
    createOn: Date;
    createBy: string;
}

export class Salary {
    id: number;
    payrollCycleId: number;
    siteId: number;
    siteCode: string;
    siteName: string;
    roleId: string;
    roleNameTH: string;
    empNo: number;
    title: string;
    firstName: string;
    lastName: string;
    idCardNumber: string;
    startDate: string;
    bankAccount: string;
    bankId: number;
    minimumWage: number;
    minimumManday: number;
    hiringRatePerDay: number;
    siteManday: number;
    totalManday: number;
    totalWage: number;
    positionValue: number;
    pointValue: number;
    annualHoliday: number | 0;
    telephoneCharge: number | 0;
    refund: number | 0;
    dutyAllowance: number | 0;
    bonus: number | 0;
    overtime: number | 0;
    otherIncome: number | 0;
    extraReplaceValue: number;
    extraOvertime: number;
    extraPointValue: number;

    get socialSecurity(): number {
        if (!this.isSocialSecurity) { return 0; }
        let result = 0;
        let resultWage = 0;
        let resultManday = 0;
        const sumSiteManday = this.siteSalary.reduce(function (prevVal, elem) {
            return prevVal + elem.manday;
        }, 0) || 0;
        if (this.isMonthly) {
            if (sumSiteManday > this.minimumManday) {
                resultManday = this.minimumManday;
            } else {
                resultManday = sumSiteManday;
            }
        } else {
            if (sumSiteManday > (this.minimumManday / 2)) {
                resultManday = (this.minimumManday / 2);
            } else {
                resultManday = sumSiteManday;
            }
        }
        resultWage = (this.minimumWage * resultManday);
        result = (resultWage + this.positionValue) * 0.05;
        if (result < 42) {
            result = 42;
        } else if (result > 750) {
            result = 750;
        } else {
            result = Math.ceil(result);
        }
        return result;
    }

    inventory: number | 0;
    discipline: number | 0;
    transferFee: number | 0;
    absence: number | 0;
    licenseFee: number | 0;
    advance: number | 0;
    rentHouse: number | 0;
    cremationFee: number | 0;
    otherFee: number | 0;
    remark: string;
    withholdingTax: number | 0;
    isComplete: boolean;
    isPaid: boolean;
    payDay: string;
    isMonthly: boolean;
    isSuspend: boolean;
    isTemporary: boolean;
    isSocialSecurity: boolean;
    createBy: string;
    createOn: Date;
    updateBy: string;
    updateOn?: Date;
    siteSalary?: SiteSalary[];

    get totalIncome(): number {
        const totalManday = this.siteSalary.reduce(function (prevVal, elem) {
            return prevVal + elem.manday;
        }, 0) || 0;
        return (totalManday * this.hiringRatePerDay) +
            this.positionValue +
            this.pointValue +
            this.annualHoliday +
            this.telephoneCharge +
            this.refund +
            this.dutyAllowance +
            this.bonus +
            this.overtime +
            this.otherIncome;
    }

    get siteTotalIncome(): number {
        const siteManday = this.siteSalary.filter(s => s.isDefault).reduce(function (prevVal, elem) {
            return prevVal + elem.manday;
        }, 0) || 0;
        return (siteManday * this.hiringRatePerDay) +
            this.positionValue +
            this.pointValue +
            this.annualHoliday +
            this.telephoneCharge +
            this.refund +
            this.dutyAllowance +
            this.bonus +
            this.overtime +
            this.otherIncome;
    }

    get totalDeductible(): number {
        return this.socialSecurity +
            this.inventory +
            this.discipline +
            this.transferFee +
            this.absence +
            this.licenseFee +
            this.advance +
            this.rentHouse +
            this.cremationFee +
            this.otherFee +
            this.withholdingTax;
    }

    get siteTotalAmount(): number {
        return this.siteTotalIncome - this.totalDeductible;
    }

    get totalAmount(): number {
        return this.totalIncome - this.totalDeductible;
    }

    constructor(
        id: number,
        payrollCycleId: number,
        siteId: number,
        siteCode: string,
        siteName: string,
        roleId: string,
        roleNameTH: string,
        empNo: number,
        title: string,
        firstName: string,
        lastName: string,
        idCardNumber: string,
        startDate: string,
        bankAccount: string,
        bankId: number,
        minimumWage: number,
        minimumManday: number,
        hiringRatePerDay: number,
        siteManday: number,
        totalManday: number,
        totalWage: number,
        positionValue: number,
        pointValue: number,
        annualHoliday: number,
        telephoneCharge: number,
        dutyAllowance: number,
        refund: number,
        bonus: number,
        overtime: number,
        otherIncome: number,
        extraReplaceValue: number,
        extraOvertime: number,
        extraPointValue: number,
        inventory: number,
        discipline: number,
        transferFee: number,
        absence: number,
        licenseFee: number,
        advance: number,
        rentHouse: number,
        cremationFee: number,
        otherFee: number,
        remark: string,
        withholdingTax: number,
        isComplete: boolean,
        isPaid: boolean,
        payDay: string,
        isMonthly: boolean,
        isSuspend: boolean,
        isTemporary: boolean,
        isSocialSecurity: boolean
    ) {
        this.id = id;
        this.payrollCycleId = payrollCycleId;
        this.siteId = siteId;
        this.siteCode = siteCode;
        this.siteName = siteName;
        this.roleId = roleId;
        this.roleNameTH = roleNameTH;
        this.empNo = empNo;
        this.title = title;
        this.firstName = firstName;
        this.lastName = lastName;
        this.idCardNumber = idCardNumber;
        this.startDate = startDate;
        this.bankAccount = bankAccount;
        this.bankId = bankId;
        this.minimumWage = minimumWage;
        this.minimumManday = minimumManday;
        this.hiringRatePerDay = hiringRatePerDay;
        this.siteManday = siteManday;
        this.totalManday = totalManday;
        this.totalWage = totalWage;
        this.positionValue = positionValue;
        this.pointValue = pointValue;
        this.annualHoliday = annualHoliday;
        this.telephoneCharge = telephoneCharge;
        this.refund = refund;
        this.dutyAllowance = dutyAllowance;
        this.bonus = bonus;
        this.overtime = overtime;
        this.otherIncome = otherIncome;
        this.inventory = inventory;
        this.discipline = discipline;
        this.transferFee = transferFee;
        this.absence = absence;
        this.licenseFee = licenseFee;
        this.advance = advance;
        this.rentHouse = rentHouse;
        this.cremationFee = cremationFee;
        this.otherFee = otherFee;
        this.remark = remark;
        this.withholdingTax = withholdingTax;
        this.isComplete = isComplete;
        this.isPaid = isPaid;
        this.payDay = payDay;
        this.isMonthly = isMonthly;
        this.isSuspend = isSuspend;
        this.isTemporary = isTemporary;
        this.isSocialSecurity = isSocialSecurity;
        this.siteSalary = [];
    }
}

export interface SiteSalary {
    payrollCycleId: number;
    empNo: number;
    siteId: number;
    salaryId: number;
    siteCode: string;
    siteName: string;
    manday: number;
    isDefault: boolean;
    createOn: Date;
    createBy: string;
    updateOn: Date;
    updateBy: string;
}

export interface SitePayrollCycleSalary {
    payrollCycleId: number;
    siteId: number;
    siteCode: string;
    siteName: string;
    numOfRow: number;
    siteManday: number;
    totalManday: number;
    totalAmount: number;
    status: string;
    payDay: string;
}

export interface SocialSecurityHistory {
    payrollYear: number;
    payrollMonth: number;
    idCardNumber: string;
    siteName: string;
    title: string;
    firstName: string;
    lastName: string;
    totalWage: number;
    socialSecurity: number;
    hospitalName: string;
    createOn: Date;
    socialHospitalId: number;
    updateOn: Date;
}

export interface PayrollYearMonth {
    year: number;
    month: number;
}

export interface SummarySalaryBySite {
    payrollCycleId: number;
    siteId: number;
    siteCode: string;
    siteName: string;
    totalEmployee: number;
    totalManday: number;
    totalWage: number;
    positionValue: number;
    pointValue: number;
    annualHoliday: number;
    telephoneCharge: number;
    refund: number;
    dutyAllowance: number;
    bonus: number;
    overtime: number;
    otherIncome: number;
    replaceValue: number;
    extraReplaceValue: number;
    extraOvertime: number;
    extraPointValue: number;
    socialSecurity: number;
    inventory: number;
    discipline: number;
    transferFee: number;
    absence: number;
    licenseFee: number;
    advance: number;
    rentHouse: number;
    cremationFee: number;
    otherFee: number;
    withholdingTax: number;
    totalIncome: number;
    totalDeductible: number;
    totalAmount: number;
    approveOn: string;
    approveBy: string;
}

export interface PayrollDeductible {
    cremationFee: number;
}
