public with sharing class AccountWithOpportunityController {
    @AuraEnabled(cacheable=true)
    public static string getAccountWithOpp(){
        try {
            for(Account acc : [SELECT Id, Name, Type, BillingCountry, (SELECT Id FROM Opportunities) 
                                FROM Account
                                WHERE OwnerId = :UserInfo.getUserId()]) {
                AccountWithOppWrapper accWrap = new AccountWithOppWrapper();
                accWrap.nameUrl = '/' + acc.Id;
                accWrap.accountId = acc.Id;
                accWrap.accountType = acc.Type;
                accWrap.billingCountry = acc.BillingCountry;
                accWrap.totalOpps = acc.Opportunities.size(); 
            }
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }


    public class AccountWithOppWrapper {
        @AuraEnabled
        String nameUrl;

        @AuraEnabled
        String accountId;

        @AuraEnabled
        String accountType;

        @AuraEnabled
        String billingCountry;

        @AuraEnabled
        Number totalOpps;
    }
}