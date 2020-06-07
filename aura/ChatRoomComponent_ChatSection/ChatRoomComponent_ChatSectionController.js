({
    // Sets an empApi error handler on component initialization
    onLoadActions : function(component, event, helper) {
        // Get the empApi component
        const empApi = component.find('empApi_Messenger');
        
        // Uncomment below line to enable debug logging (optional)
        // empApi.setDebugFlag(true);
        
        // Register error listener and pass in the error handler function
        empApi.onError($A.getCallback(error => {
            // Error can be any type of error (subscribe, unsubscribe...)
            console.error('EMP API error: ', error);
        }));
            
         
            
        },
            sendMessage: function(component,event,helper){
                console.log('Calling click handler functionality');
                helper.callApexMessagePublisher(component,event,helper,component.get("v.message"));
            },
            
              changeNameEnableMessageInput: function(component, event,helper){
                            var isUserLoggedIn = event.getParam("userLoggedin");
                            var name = event.getParam("userName");
                            var email = event.getParam("userEmail");
                            console.log('isUserLoggedIn , name, Email  - '+isUserLoggedIn+'-'+name+'-'+email);
                            component.set("v.username",name);
                            component.set("v.userEmail",email);
                            component.set("v.isUserRegistered",isUserLoggedIn);
                           
                            // call subscribe method
                            helper.subscribe(component, event, helper,component.find('empApi_Messenger'));
                        },
            // Invokes the unsubscribe method on the empApi component
            unsubscribe : function(component, event) {
                
                console.log('Ubsubscribing begin for Messenger.......');
                var message = event.getParam("messengerSwitch");
                console.log('messengerSwitch - '+message);
                
                if(!message)
                {
                    // Get the empApi component
                    const empApi = component.find('empApi_Messenger');
                    // Get the subscription that we saved when subscribing
                    const subscription = component.get('v.subscription');
                    
                    // Unsubscribe from event
                    empApi.unsubscribe(subscription, $A.getCallback(unsubscribed => {
                        // Confirm that we have unsubscribed from the event channel
                        console.log('Unsubscribed from channel '+ unsubscribed.subscription);
                        component.set('v.subscription', null);
                    }));
                    }
                    }
                        
                        
                        
                    })