import { LightningElement, wire } from 'lwc';
import getAccounts from '@salesforce/apex/AccountWithCasesAndOppsController.getAccounts';
import getRelatedData from '@salesforce/apex/AccountWithCasesAndOppsController.getRelatedData';

export default class DisplayAccountWithCasesAndOpps extends LightningElement {
    @wire(getAccounts)
    accounts;

    accColumns = [
        { label: 'Account Name', fieldName: 'nameUrl', type: 'url', typeAttributes: {
            label: {
                fieldName: 'accountName'
            },
            target: '__blank'
        } },
        { label: 'Industry', fieldName: 'industry', type: 'text' },
        { label: 'Billing Country', fieldName: 'billingCountry', type: 'text' }
    ];


    caseColumns = [
        { label: 'Account Name', fieldName: 'accNameUrl', type: 'url', typeAttributes: {
            label: {
                fieldName: 'accountName'
            },
            target: '__blank'
        } },
        { label: 'Case Number', fieldName: 'caseNumberUrl', type: 'url', typeAttributes: {
            label: {
                fieldName: 'caseNumber'
            },
            target: '__blank'
        } },
        { label: 'Priority', fieldName: 'priority', type: 'text' },
        { label: 'Status', fieldName: 'status', type: 'text' }
    ];

    
    oppColumns = [
        { label: 'Account Name', fieldName: 'accNameUrl', type: 'url', typeAttributes: {
            label: {
                fieldName: 'accountName'
            },
            target: '__blank'
        } },
        { label: 'Opportunity Name', fieldName: 'oppUrl', type: 'url', typeAttributes: {
            label: {
                fieldName: 'oppName'
            },
            target: '__blank'
        } },
        { label: 'Stage', fieldName: 'stageName', type: 'text' }
    ];

    cases = [];
    opportunities = [];

    handleRowSelection(event) {
        const selectedRows = event.detail.selectedRows;
        const selectedAccIds = selectedRows.map(row => row.accountId);
        this.getCasesAndOpps(selectedAccIds);
    }

    async getCasesAndOpps(selectedAccIds) {
        const relatedData = await getRelatedData({ accountIdList: selectedAccIds });

        // process cases
        this.cases = relatedData.reduce((acc, eachData) => {
            if(eachData.caseList && eachData.caseList.length > 0) {
                let processedCase = eachData.caseList.map(eachCase => ({
                    accNameUrl: '/' + eachCase.Account.Id,
                    accountName: eachCase.Account.Name,
                    caseNumberUrl: '/' + eachCase.Id,
                    caseId: eachCase.Id,
                    caseNumber: eachCase.CaseNumber,
                    priority: eachCase.Priority,
                    status: eachCase.Status
                }));
                
                acc.push(...processedCase);
            }
            
            return acc;
        }, []);

        // process opportunities
        this.opportunities = relatedData.reduce((acc, eachData) => {
            if(eachData.opportunityList && eachData.opportunityList.length > 0) {
                let processedOpp = eachData.opportunityList.map(eachOpp => ({
                    accNameUrl: '/' + eachOpp.Account.Id,
                    accountName: eachOpp.Account.Name,
                    oppUrl: '/' + eachOpp.Id,
                    oppId: eachOpp.Id,
                    oppName: eachOpp.Name,
                    stageName: eachOpp.StageName
                }));
                
                acc.push(...processedOpp);
            }

            return acc;
        }, []);
    }

    
    get areCasesAvailable() {
        return this.cases && this.cases.length > 0? true : false;
    }

    get areOppsAvailable() {
        return this.opportunities && this.opportunities.length > 0? true : false;
    }
}