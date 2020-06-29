//our username 
var name; 
var connectedUser;
  
//connecting to our signaling server
var conn = new WebSocket('ws://10.6.5.77:9090');

  
conn.onopen = function () { 
   console.log("Connected to the signaling server"); 
   
};
function gotStream(myStream)
 { 
		console.log("Got the Stream - manual login");
         stream = myStream; 
		if(window.webkitURL === undefined ){
			console.log('window.webkitURL not defined');
			localAudio.src = stream;
		}
		else	
		{
			//displaying local video stream on the page 
			//localVideo.srcObject = stream;
			//localVideo.src = window.webkitURL.createObjectURL(stream);
			//localAudio.src = stream;
			
			try {
					localVideo.srcObject = stream;
					console.log('Assigned to srcObject');
				} 
			catch (error) {
					console.log(error);
					localVideo.src = URL.createObjectURL(stream);
			}
			
			console.log('Local Video Streaming');
		}
		
		stream.getTracks().forEach(function(track) {
			console.log('Adding track');
		yourConn.addTrack(track, stream);
		});
		/*if (yourConn.addStream === undefined)
		{
			console.log('add stream not defined');
		}
		else{
		// setup stream listening 
         yourConn.addStream(stream); 
		 			console.log('add stream defined');
		}*/
		
         //when a remote user adds stream to the peer connection, we display it 
         yourConn.ontrack = function (e) { 
            console.log("On  Add track");
			//var c = document.getElementById("canvas1");
			//var ctx = c.getContext("2d");
			//ctx.fillStyle = "#FF0000";
			//ctx.fillRect(20, 20, 150, 100);
			/*if(window.webkitURL === undefined ){
				//remoteVideo.src = e.stream;
				console.log('window.webkitURL not defined - Remote VIdeo/Audio Stream');
			}
			else
			{*/
				try {
					remoteVideo.srcObject = e.streams[0];
					console.log('Assigned to srcObject');
				} 
				catch (error) {
					console.log(error);
					remoteVideo.src = URL.createObjectURL(stream);
					remoteVideo.src.applyConstraints({ width: 100, height: 100});
					console.log('Assigned to src');
				}	
				//remoteVideo.src = window.URL.createObjectURL(e.stream); 
				//remoteVideo.src = e.stream;
				//console.log('window.webkitURL defined.. Remote Audio/Video Stream');
			//}
			
         };
}
  
//when we got a message from a signaling server 
conn.onmessage = function (msg) { 
   console.log("Got message", msg.data);
	
   var data = JSON.parse(msg.data); 
	console.log("Got message", data.type);
   switch(data.type) { 
      case "login": 
         handleLogin(data.success); 
         break; 
      //when somebody wants to call us 
      case "offer": 
         handleOffer(data.offer, data.name); 
         break; 
      case "answer": 
         handleAnswer(data.answer); 
         break; 
      //when a remote peer sends an ice candidate to us 
      case "candidate": 
         handleCandidate(data.candidate); 
         break; 
      case "leave": 
         handleLeave(); 
         break; 
	  case "call":
	     handleCall();
		 break;
      default: 
         break; 
   }
};
  
conn.onerror = function (err) { 
   console.log("Got error", err); 
};
  
//alias for sending JSON encoded messages 
function send(message) { 
   //attach the other peer username to our messages 
   if (connectedUser) { 
      message.name = connectedUser; 
   } 
	
   conn.send(JSON.stringify(message)); 
};
  
//****** 
//UI selectors block 
//******
 
var loginPage = document.querySelector('#loginPage'); 
var usernameInput = document.querySelector('#usernameInput'); 
var loginBtn = document.querySelector('#loginBtn'); 

var callPage = document.querySelector('#callPage'); 
var callToUsernameInput = document.querySelector('#callToUsernameInput');
var callBtn = document.querySelector('#callBtn'); 

var hangUpBtn = document.querySelector('#hangUpBtn');
  
var localVideo = document.querySelector('#localVideo'); 
var remoteVideo = document.querySelector('#remoteVideo'); 

var yourConn; 
var stream;
  
callPage.style.display = "none";

// Login when the user clicks the button 
loginBtn.addEventListener("click", function (event) { 
   name = usernameInput.value; 
	
   if (name.length > 0) { 
      send({ 
         type: "login", 
         name: name 
      }); 
   } 
	
});
  
function handleLogin(success) { 
   if (success === false) { 
      alert("Ooops...try a different username"); 
   } else { 
      loginPage.style.display = "none"; 
      callPage.style.display = "block";
		
      //********************** 
      //Starting a peer connection 
      //********************** 
		//using Google public stun server 
		//sequence<RTCIceServer> iceServers = [{ "url": "stun:stun2.1.google.com:19302" }];

	var configuration = null/*{ 
			//iceServers;
          "iceServers" :[{ "url": 'stun:stun2.1.google.com:19302' }]
    }; */
	/*		
    if ( typeof(webkitRTCPeerConnection)) !== 'undefined')
	{
		console.log("using webkitRTCPeerConnection");
		yourConn = new webkitRTCPeerConnection(configuration) | new RTCPeerConnection(configuration);
	}
	else
	{		
		console.log("using RTCPeerConnection");
		yourConn = new RTCPeerConnection(configuration);
	}*/
	try{
		yourConn = new webkitRTCPeerConnection(configuration);
		console.log("webkitRTCPeerConnection defined here in the try block");
	}
	catch(exception){
		yourConn =  new RTCPeerConnection(configuration);
		console.log("in exception block");
	}
	console.log("RTC connection good");	
	 
	 yourConn.ontrack = function (e) { 
            console.log("On  Add track");
				try {
					remoteVideo.srcObject = e.streams[0];
					remoteVideo.applyConstraints({ width: 100, height: 100});
					console.log('Assigned to srcObject');
				} 
				catch (error) {
					console.log(error);
					remoteVideo.src = URL.createObjectURL(stream);
					remoteVideo.src.applyConstraints({ width: 100, height: 100});
					console.log('Assigned to src');
				}	
			
    };
	 //getting local video stream 
      navigator.mediaDevices.getUserMedia({ video: true })
	  .then(gotStream)
	  .catch(function (err) { 
	   console.log(err.name + ": " + err.message);
         /*console.log("Auto login");
			send({ 
				type: "login", 
				name: "stb"
			});  */		 
      });
	 
	 // Setup ice handling 
         yourConn.onicecandidate = function (event) { 
            if (event.candidate) { 
               send({ 
                  type: "candidate", 
                  candidate: event.candidate 
               }); 
            } 
         };  
     
	 
		
   } 
};
  
//initiating a call 
callBtn.addEventListener("click", function () {
   var callToUsername = callToUsernameInput.value;
   	 console.log("to call " + callToUsernameInput.value);
	
   if (callToUsername.length > 0) { 
	
      connectedUser = callToUsername;
		
      // create an offer 
yourConn.createOffer().then(function(offer) {
	console.log("offer create success");
    return yourConn.setLocalDescription(offer);
  })
  .then(function() {
   send({ 
            type: "offer", 
            offer: yourConn.localDescription 
         }); 
        //console.log(offer);
  })
  .catch(function(reason) {
    // An error occurred, so handle the failure to connect
    console.log("exception in creating offer" + reason);
  });
		
   } 
   //document.getElementById("all").style.visibility = "hidden";
});

function handleCall() {  
     var callToUsername = "stb";
   	 console.log("handleCall starting callToUsername="+callToUsername);
	
   if (callToUsername.length > 0) { 
	
      connectedUser = callToUsername;
		
      // create an offer 
 yourConn.createOffer().then(function(offer) {
    return yourConn.setLocalDescription(offer);
  })
  .then(function(offer) {
   send({ 
            type: "offer", 
            offer: offer 
         }); 
        console.log(offer);
  })
  .catch(function(reason) {
    // An error occurred, so handle the failure to connect
    console.log("exception in creating offer" + reason);
  });
		
   } 
};
 /* 
//when somebody sends us an offer 
function handleOffer(offer, name) { 
   connectedUser = name; 
   yourConn.setRemoteDescription(new RTCSessionDescription(offer));
	
   //create an answer to an offer 
   yourConn.createAnswer().then(function(answer) {
      console.log("promise resolved, setLocalDescription");
      return yourConn.setLocalDescription(answer);
    })
    .then(function() {
      // Send the answer to the remote peer through the signaling server.
      console.log("setLocalDescription success : Sending answer");
       send({ 
             type: "answer", 
             answer: yourConn.currentLocalDescription 
          }); 
    })
    .catch();
};*/
function handleOffer(offer, name) { 
   connectedUser = name; 
   yourConn.setRemoteDescription(new RTCSessionDescription(offer));
    
   //create an answer to an offer 
   yourConn.createAnswer().then(function(answer) {
	  console.log("promise resolved, setLocalDescription");
	  return yourConn.setLocalDescription(answer);
	})
	.then(function() {
	  // Send the answer to the remote peer through the signaling server.
	  console.log("setLocalDescription success : Sending answer");
	   send({ 
			 type: "answer", 
			 answer: yourConn.currentLocalDescription 
		  }); 
	})
	.catch(); 
};
 
//when we got an answer from a remote user
function handleAnswer(answer) { 
   yourConn.setRemoteDescription(new RTCSessionDescription(answer)); 
};
  
//when we got an ice candidate from a remote user 
function handleCandidate(candidate) { 
   yourConn.addIceCandidate(new RTCIceCandidate(candidate)); 
};
   
//hang up 
hangUpBtn.addEventListener("click", function () { 

   send({ 
      type: "leave" 
   });  
	
   //handleLeave(); 
});
  
function handleLeave() { 
   connectedUser = null; 
   remoteVideo.src = null; 
	remoteAudio.srcObject = null; 
   yourConn.close(); 
   yourConn.onicecandidate = null; 
   yourConn.onaddstream = null; 
};