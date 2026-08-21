import { LightningElement, wire } from 'lwc';
import getAccountWithOpp from '@salesforce/apex/AccountWithOpportunityController.getAccountWithOpp';
import deleteAccountWithNoOpenOpps from '@salesforce/apex/AccountWithOpportunityController.deleteAccountWithNoOpenOpps';
import { NavigationMixin } from 'lightning/navigation';
import { encodeDefaultFieldValues } from 'lightning/pageReferenceUtils';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { refreshApex } from '@salesforce/apex';

export default class DisplayAccountWithOpportunity extends NavigationMixin(LightningElement) {
    @wire(getAccountWithOpp)
    accounts;

    columns = [
        { label: 'Account Name', fieldName: 'nameUrl', type: 'url', typeAttributes: {
            label: {
                fieldName: 'accountName'
            },
            target: '__blank'
        }},
        { label: 'Type', fieldName: 'accountType', type: 'text' },
        { label: 'Billing Country', fieldName: 'billingCountry', type: 'text' },
        { label: 'Total Opportunities', fieldName: 'totalOpps', type: 'number' },
        {
            type: 'button',
            typeAttributes: {
                label: 'New Contact',
                name: 'New Contact',
                variant: 'brand',
                iconPosition: 'left'
            }
        },
        {
            type: 'button',
            typeAttributes: {
                label: 'Delete Account',
                name: 'Delete Account',
                variant: 'destructive',
                iconPosition: 'left'
            }
        }
    ];

    
    get isAccountDataAvailable() {
        return this.accounts && this.accounts.data && this.accounts.data.length != 0;
    }

    handleRowAction(event) {
        const action = event.detail.action;
        const row = event.detail.row;
        
        switch(action.name) {
            case 'New Contact':
                this.createContact(row.accountId);
                break;
            case 'Delete Account':
                this.deleteAccount(row.accountId);
                break;
        }
    }

    createContact(accountId) {
        const defaultFieldValues = encodeDefaultFieldValues({
            AccountId : accountId
        });
        const pageRef = {
            type: 'standard__objectPage',
            attributes: {
                objectApiName: 'Contact',
                actionName: 'new'
            },
            state: {
                defaultFieldValues
            }
        };
        this[NavigationMixin.Navigate](pageRef);
    }

    async deleteAccount(accountId) {
        try {
            await deleteAccountWithNoOpenOpps({ accountId: accountId });
            await refreshApex(this.accounts);
            this.showToast('Success', 'Account has been deleted successfully', 'success');
        } catch (error) {
             this.showToast('Error', error.body.message, 'error');
        }
    }

    showToast(title, message, variant) {
        this.dispatchEvent(new ShowToastEvent({
            title,
            message,
            variant
        }))
    }
}