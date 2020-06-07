({
     // Invokes the subscribe method on the empApi component
    subscribeLogout : function(component, event, helper) {
        
        console.log('Logout Subscribed...........');
        
        // Get the empApi component
        const empApi = component.find('empApi_Logout');
        // Get the channel from the input box
        const channel = "/event/Logout__e";
        // Replay option to get new events
        const replayId = -1;

        // Subscribe to an event
        empApi.subscribe(channel, replayId, $A.getCallback(eventReceived => {
            // Process event (this is called each time we receive an event)
            console.log('*** Received Logout event ', JSON.stringify(eventReceived));
            
            
            var jsonRes = JSON.parse(JSON.stringify(eventReceived));
            console.log(jsonRes.data.payload.User_Name__c+'------'+jsonRes.data.payload.User_Email__c+'------'+jsonRes.data.payload.Logout__c);

            // Get the current userList
            // remove the current User name from the List and hold the index
            var activeUsers =[];
            activeUsers = component.get("v.userList");
            console.log("activeUsers  " +  JSON.stringify(activeUsers));
            
            for(var item in activeUsers )
            {
            if(activeUsers[item].email == jsonRes.data.payload.User_Email__c){
            //console.log(activeUsers[item].email+'----'+jsonRes.data.payload.User_Email__c);
            // Remove the item at that index
            if (item > -1) {
            activeUsers.splice(item, 1);
        }        }
            
        }
            console.log("activeUsers  " +  JSON.stringify(activeUsers));
            
            component.set("v.userList",activeUsers);
            
        }))
        .then(subscription => {
            // Confirm that we have subscribed to the event channel.
            // We haven't received an event yet.
            console.log('Subscribed to channel ', subscription.channel);
            // Save subscription to unsubscribe later
            component.set('v.subscriptionLogout', subscription);
        });
    },

    // Invokes the unsubscribe method on the empApi component
    unsubscribe : function(component, event, helper) {
        // Get the empApi component
        const empApi = component.find('empApi_Logout');
        // Get the subscription that we saved when subscribing
        const subscription = component.get('v.subscriptionLogout');

        // Unsubscribe from event
        empApi.unsubscribe(subscription, $A.getCallback(unsubscribed => {
          // Confirm that we have unsubscribed from the event channel
          console.log('Unsubscribed from channel '+ unsubscribed.subscription);
          component.set('v.subscription', null);
        }));
    },
            
            
     // apex call to publish logout event
     
            apexLogoutPublisher: function(component,event,helper)
            {
                var action = component.get("c.logoutPublisher");                
                action.setCallback(this, function(response) {
                    var state = response.getState();
                    if (state === "SUCCESS") {
                        
                        console.log("From server: " + response.getReturnValue());
                        
                    }
                    else  {
                        var errors = response.getError();
                        if (errors) {
                            if (errors[0] && errors[0].message) {
                                console.log("Error message: " + 
                                            errors[0].message);
                            }
                        } else {
                            console.log("Unknown error");
                        }
                    }
                });
                
        $A.enqueueAction(action);
            }
   
    
})