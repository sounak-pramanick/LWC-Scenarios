public with sharing class AccountWithCasesAndOppsController {
    @AuraEnabled(cacheable=true)
    public static List<AccountWrapper> getAccounts() {
        List<AccountWrapper> accWrapList = new List<AccountWrapper>();

        for(Account acc : [SELECT Id, Name, Industry, BillingCountry FROM Account]) {
            AccountWrapper accWrap = new AccountWrapper();
            accWrap.nameUrl = '/' + acc.Id;
            accWrap.accountId = acc.Id;
            accWrap.accountName = acc.Name;
            accWrap.industry = acc.Industry;
            accWrap.billingCountry = acc.BillingCountry;
            accWrapList.add(accWrap);
        }

        return accWrapList;
    }

    @AuraEnabled(cacheable=true)
    public static List<RelatedDataWrapper> getRelatedData(List<String> accountIdList) {
        List<RelatedDataWrapper> relatedWrapList = new List<RelatedDataWrapper>();

        for(Account acc : [SELECT Id, (SELECT Id, Account.Name, CaseNumber, Priority, Status from Cases), 
                            (SELECT Id, Account.Name, Name, StageName from Opportunities)
                            FROM Account WHERE Id IN :accountIdList]) {
            RelatedDataWrapper relatedWrap = new RelatedDataWrapper();
            relatedWrap.accountId = acc.Id;
            relatedWrap.caseList = acc.Cases;
            relatedWrap.opportunityList = acc.Opportunities;
            relatedWrapList.add(relatedWrap);
        }

        return relatedWrapList;
    }

    public class AccountWrapper {
        @AuraEnabled
        public String nameUrl;

        @AuraEnabled
        public String accountId;

        @AuraEnabled
        public String accountName;

        @AuraEnabled
        public String industry;

        @AuraEnabled
        public String billingCountry;
    }

    public class RelatedDataWrapper {
        @AuraEnabled
        public String accountId;

        @AuraEnabled
        public List<Case> caseList;

        @AuraEnabled
        public List<Opportunity> opportunityList;
    }
}