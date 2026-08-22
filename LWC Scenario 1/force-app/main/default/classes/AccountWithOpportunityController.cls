public with sharing class AccountWithOpportunityController {
    @AuraEnabled(cacheable=true)
    public static List<AccountWithOppWrapper> getAccountWithOpp(){
        try {
            List<AccountWithOppWrapper> accountWithOppWrapperResult = new List<AccountWithOppWrapper>();

            for(Account acc : [SELECT Id, Name, Type, BillingCountry, (SELECT Id FROM Opportunities) 
                                FROM Account
                                WHERE OwnerId = :UserInfo.getUserId()]) {
                AccountWithOppWrapper accWrap = new AccountWithOppWrapper();
                accWrap.nameUrl = '/' + acc.Id;
                accWrap.accountId = acc.Id;
                accWrap.accountName = acc.Name;
                accWrap.accountType = acc.Type;
                accWrap.billingCountry = acc.BillingCountry;
                accWrap.totalOpps = acc.Opportunities.size(); 
                accountWithOppWrapperResult.add(accWrap);
            }

            return accountWithOppWrapperResult;
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    @AuraEnabled
    public static void deleteAccountWithNoOpenOpps(String accountId) {
        try {
            List<Account> accWithOpenOpps = [SELECT Id, (SELECT Id FROM Opportunities WHERE IsClosed = false) FROM Account WHERE Id = :accountId];
        
            if(accWithOpenOpps[0].Opportunities.size() > 0) { 
                AuraHandledException ex = new AuraHandledException('This account cannot be deleted as it has open opportunities');
                ex.setMessage('This account cannot be deleted as it has open opportunities');
                throw ex;
            }
            delete accWithOpenOpps[0];
        }
        catch(Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }


    public class AccountWithOppWrapper {
        @AuraEnabled
        public String nameUrl;

        @AuraEnabled
        public String accountId;

        @AuraEnabled
        public String accountName;

        @AuraEnabled
        public String accountType;

        @AuraEnabled
        public String billingCountry;

        @AuraEnabled
        public Integer totalOpps;
    }
}