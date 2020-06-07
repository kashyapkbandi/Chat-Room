({
   // Invokes the subscribe method on the empApi component
    subscribe : function(component, event, helper,empApi) {
       
        console.log('Subscription Started for Messenger.......');
        
        // Get the channel from the input box
        const channel = '/event/Messenger__e';
        // Replay option to get new events
        const replayId = -1;

        // Subscribe to an event
        empApi.subscribe(channel, replayId, $A.getCallback(eventReceived => {
            // Process event (this is called each time we receive an event)
            console.log('Received event ', JSON.stringify(eventReceived));
            
            var jsonRes = JSON.parse(JSON.stringify(eventReceived));
            //console.log(jsonRes.data.payload.From_Name__c+'------'+jsonRes.data.payload.From_Email__c+'------'+jsonRes.data.payload.MessageBody__c);
            
            // If sender is current user, message should be displayed to Right 
            // else left
            // First get all messages
            
            var updatedList =[];   
            var msgObj =new Object();
            
            updatedList = component.get("v.messageStack");
			
         
            msgObj.senderName = jsonRes.data.payload.From_Name__c;
            msgObj.senderEmail = jsonRes.data.payload.From_Email__c;
            msgObj.senderMessage = jsonRes.data.payload.MessageBody__c;
            console.log('Message Object   '+ JSON.stringify(msgObj));
            
            updatedList.push(msgObj);
            console.log('updatedList   '+ JSON.stringify(updatedList[0]));

            //add it back to component attrib
            component.set("v.messageStack",updatedList);
            
            //clear the message field.
           component.set("v.message",'');
            
        }))
        .then(subscription => {
            // Confirm that we have subscribed to the event channel.
            // We haven't received an event yet.
            console.log('Subscribed to channel ', subscription.channel);
            // Save subscription to unsubscribe later
            component.set('v.subscription', subscription);
        });
    },
            
            callApexMessagePublisher: function(component, event, helper,message) {
                
                var action = component.get("c.apexMessagePublisher");
                action.setParams({ message : message });
                
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