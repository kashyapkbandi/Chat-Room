public class ChatRoomController {
    
    
    @AuraEnabled
    public static String publishLogger()
    {
        //get current logged in user name
        // Add it in the PE params and publish
        
        
        User u = [SELECT Id,Name,SmallPhotoUrl ,Email FROM User WHERE Id=:UserInfo.getUserId() LIMIT 1];
        
        List<Logger__e> logeList = new List<Logger__e>();
        
        Logger__e logE = new Logger__e();
        logE.User_Name__c = UserInfo.getName();        
        logE.User_Email__c = u.Email;
        logE.User_Profile_Pic__c = u.SmallPhotoUrl;
        logeList.add(logE);
     	return   publishLoggerEventList(logeList);
    }
    
    @AuraEnabled
    public static String publishLoggerEventList(List<Logger__e> logEList)
    {
        String message='';
        // Call method to publish events
        List<Database.SaveResult> results = EventBus.publish(logEList);
        JSONGenerator gen = JSON.createGenerator(true);

        // Inspect publishing result for each event
        for (Database.SaveResult sr : results) {
            if (sr.isSuccess()) {
                System.debug('Successfully published event.');
                
                // Creating JSON object with Name , Message attribs.
                
                message =UserInfo.getName()+'__'+UserInfo.getUserEmail();
                
                
                
            } else {
                for(Database.Error err : sr.getErrors()) {
                    System.debug('Error returned: ' +
                                 err.getStatusCode() +
                                 ' - ' +
                                 err.getMessage());
                message =  err.getStatusCode() +
                                 ' - ' +
                                 err.getMessage();
                    
                }
            }       
        }
        return message;
    }
    
    
    @AuraEnabled
    public static String cacheAfterLogoff(List<String> updatedUserList)
    {
        
        try{
            Cache.Org.put('local.LogOff.updatedUserList', updatedUserList);
            return 'Success';
        }
        catch(Exception e)
        {
            return e.getMessage();
        }
        
    }
    
    @AuraEnabled
    public static List<String> retrieveCacheAfterLogoff()
    {
        
        return null;
    }

	@AuraEnabled
    public static String apexMessagePublisher(String message)
    {
        String returnMessage='';
        List<Messenger__e> messengerList= new List<Messenger__e>();
        Messenger__e msg = new Messenger__e();
        
        // prepare platform event object
        msg.From_Name__c = UserInfo.getName();
        msg.From_Email__c = UserInfo.getUserEmail();
        msg.MessageBody__c = message;
        messengerList.add(msg);
        
          List<Database.SaveResult> results = EventBus.publish(messengerList);
        for (Database.SaveResult sr : results) {
            if (sr.isSuccess()) {
                System.debug('Successfully published event.');
                returnMessage = msg.From_Name__c +'__'+ msg.From_Email__c;         
                
            } else {
                for(Database.Error err : sr.getErrors()) {
                    System.debug('Error returned: ' +
                                 err.getStatusCode() +
                                 ' - ' +
                                 err.getMessage());
                    returnMessage =  err.getStatusCode() +
                        ' - ' +
                        err.getMessage();
                    
                }
            }       
        }
        
        return returnMessage;
    }

 @AuraEnabled
    public static String logoutPublisher()
    {
        String returnMessage='';
        List<Logout__e> logoutList = new List<Logout__e>();
        Logout__e logout = new Logout__e();
        
        logout.User_Name__c = UserInfo.getName();
        logout.User_Email__c = UserInfo.getUserEmail();
        logout.Logout__c = true;
        
        logoutList.add(logout);
        
        List<Database.SaveResult> results = EventBus.publish(logoutList);
        for (Database.SaveResult sr : results) {
            if (sr.isSuccess()) {
                System.debug('Successfully published event.');
                returnMessage = logout.User_Name__c +'__'+ logout.User_Email__c+'__'+logout.Logout__c;         
                
            } else {
                for(Database.Error err : sr.getErrors()) {
                    System.debug('Error returned: ' +
                                 err.getStatusCode() +
                                 ' - ' +
                                 err.getMessage());
                    returnMessage =  err.getStatusCode() +
                        ' - ' +
                        err.getMessage();
                    
                }
            }       
        }
        return returnMessage;
    }
}