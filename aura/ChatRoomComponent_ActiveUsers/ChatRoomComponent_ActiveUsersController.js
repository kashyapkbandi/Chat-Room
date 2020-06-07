({
  onLoadActions: function(component, event, helper) {
      
      // Due to the fact for some reason, helper is not being called from the call back method
      // of the subscribe, We will subscribe the Logout Platform event during the onload.
      // That will be done as soon as the component Loads and the whole Logoff Logic will be in the helper
     
        // Get the empApi component
      const empApi_Logout = component.find('empApi_Logout');
      // Uncomment below line to enable debug logging (optional)
      // empApi.setDebugFlag(true);
      // Register error listener and pass in the error handler function
      empApi_Logout.onError($A.getCallback(error => {
          // Error can be any type of error (subscribe, unsubscribe...)
          console.error('EMP API error: ', error);
      }));
          
          
     helper.subscribeLogout(component, event, helper);
      
      
      
    /*
        As soon as the User logs in , We fire a platform event called Logger 
        so that the existing subscribed users know that some one has joined
        
        After firing the PE - Logger 2 things happen
        1 -> Active users component updates with latest user
        2 -> pop up notification 
        */

    // Get the empApi component
    const empApi = component.find("empApi_Logger");

    // Uncomment below line to enable debug logging (optional)
    // empApi.setDebugFlag(true);

    // Register error listener and pass in the error handler function
    empApi.onError(
      $A.getCallback(error => {
        // Error can be any type of error (subscribe, unsubscribe...)
        console.error("EMP API error: ", error);
      })
    );
  },
  // Invokes the subscribe method on the empApi component
  subscribe: function(component, event, platformEvent) {
      // Get the empApi component
    const empApi = component.find("empApi_Logger");
    // Platform Event name is passed from controller
    const channel = "/event/Logger__e";
    // Replay option to get new events
    const replayId = -1;

    // Subscribe to an event
    empApi
      .subscribe(
        channel,
        replayId,
        $A.getCallback(eventReceived => {
          // Process event (this is called each time we receive an event)
          console.log("Received event ", JSON.stringify(eventReceived));

          // since this event only for the logging of users
          // this will capture all the publish done by other online users

          var jsonRes = JSON.parse(JSON.stringify(eventReceived));
          console.log(jsonRes.data.payload.User_Name__c);
          var users = [];
          users = component.get("v.userList");

          // prepare an object with name, email and dp
          var userObj = {};
          // take the List , add current user obj from event received

          userObj.name = jsonRes.data.payload.User_Name__c;
          userObj.dp = jsonRes.data.payload.User_Profile_Pic__c;
          userObj.email = jsonRes.data.payload.User_Email__c;
          console.log("user " + JSON.stringify(userObj));

          users.push(userObj);

          // set it back.
          component.set("v.userList", users);
          console.log("users" + users);

          var toastEvent = $A.get("e.force:showToast");
          toastEvent.setParams({
            title: jsonRes.data.payload.User_Name__c + " is now available!",
            message: "The user can see the messages in the chat room"
          });
          toastEvent.fire();
        })
      )
      .then(subscription => {
        // Confirm that we have subscribed to the event channel.
        // We haven't received an event yet.
        console.log("Subscribed to channel ", subscription.channel);
          
        // you cannot subscribe after subscribing once
        // set the Go Online Button Disabled.
        // On line and Offline buttons are set contradictary
        // So setting one button would set the other opposite
        component.set("v.isDisabled", true);

        // Fire the Platform Event  Logger__e to register your self
        /*
                We will handle below points in the Apex Class itself
                1 => Fetching current logged in users Name
                2 => Publishing PE
                */
        var action = component.get("c.publishLogger");
        action.setCallback(this, function(response) {
          var state = response.getState();
          if (state === "SUCCESS") {
            // Alert the user with the value returned
            // from the server
            console.log("From server: " + response.getReturnValue());

            // Split the result based on the __ and get the first part for the Name
            var res = response.getReturnValue().split("__");
            var name = res[0];
            component.set("v.username", name);
          	component.set("v.currentUserEmail",res[1]);
          
          
          // Fire the UserLoggedinEvent to let the Chatsection component 
          // to make changes with the data sent
          var appEvent = $A.get("e.c:UserLoggedInEvent");
          appEvent.setParams({
          "userLoggedin" : true,
          "userName": component.get("v.username"),
          "userEmail":component.get("v.currentUserEmail")});
        appEvent.fire();
      
          
          
          
          
          } else  {
            var errors = response.getError();
            if (errors) {
              if (errors[0] && errors[0].message) {
                console.log("Error message: " + errors[0].message);
              }
            } else {
              console.log("Unknown error");
            }
          }
        });
        $A.enqueueAction(action);

        // Save subscription to unsubscribe later
        component.set("v.subscription", subscription);
      });

  },

  // Invokes the unsubscribe method on the empApi component
  unsubscribe: function(component, event, helper) {
      
      // Unsubscribe from Messenger Events as well
     var appEvent = $A.get("e.c:UnsubscribeMessengerEvent");
      appEvent.setParams({
          "messengerSwitch" : false });
      appEvent.fire();
      
      
      // call apex action to publish logout event
      helper.apexLogoutPublisher(component, event, helper);
      
      
    // Get the empApi component
    const empApi = component.find("empApi_Logger");
    // Get the subscription that we saved when subscribing
    const subscription = component.get("v.subscription");

    // Unsubscribe from event
    empApi.unsubscribe(
      subscription,
      $A.getCallback(unsubscribed => {
        // Confirm that we have unsubscribed from the event channel
        console.log(
          "Unsubscribed from channel " + JSON.stringify(unsubscribed)
        );

        // You cannot unsubscribe more than once
        component.set("v.isDisabled", false);
        component.set("v.subscription", null);
      })
    );

          
          
  }
});