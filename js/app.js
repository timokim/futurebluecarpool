// (::) COOKIES (::)
// No expire. Our cookies are session dependent.
function createCookie(name, value) {
	console.log("Creating cookie: " + name + "=" + JSON.stringify(value) + "; path=/");
	document.cookie = name + "=" + JSON.stringify(value) + "; path=/";
}
function readCookie(name) {
	var result = document.cookie.match(new RegExp(name + '=([^;]+)'));
	result && (result = JSON.parse(result[1]));
	return result;
}

function eraseCookie(name) {
	if(readCookie(name)){
		console.log("cookie found");
    	document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:01 GMT; path=/";
    }
    return 0;
}

function login(email, callback){
	$.ajax({
		url: "http://futureblue.torolab.ibm.com:9082/futureblue-1.0-SNAPSHOT/user/validate/?email=" + email,
		dataType: 'jsonp',
		success: function(data){
			if(data.userid === -1){
				console.log("Login FAILED");
				callback(-1);
			}else{
				console.log("Login SUCCESS");
				console.log(data);
				createCookie("userinfo", data);
				callback(data);
			}
		}
	});
}

function logoff(){
	eraseCookie("userinfo");
	window.location.href="login.html";
}

function isloggedin(){
	return readCookie("userinfo")!==null;
}

// Replace with server-side stuff
function authenticate(){
	if(!isloggedin()){
		window.location.href="login.html?back=" + window.location.href;
	}
}

function register(lastname, firstname, email, phone, usertype, callback){
	$.ajax({
		url: "http://futureblue.torolab.ibm.com:9082/futureblue-1.0-SNAPSHOT/user/userdata/register/?lastname="
		+ lastname + "&firstname=" + firstname + "&email=" + email +"&phone=" + phone + "&usertype="+ usertype +"&teamid=1",
		dataType: 'jsonp',
		success: function(data){
			console.log("Registration test");
			console.log(data);
			if(data.response_code === 0){
				console.log(data.response_status);
				console.log("Registration SUCCESS");
				callback(data);
			}else{
				console.log("Registration FAIL");
				callback(-1);
			}
		}
	});
}

function getOwnerCarpool(callback){
	if(!readCookie("userinfo")) return -1;
	var userid = readCookie("userinfo").userid;
	$.ajax({
		url: "http://futureblue.torolab.ibm.com:9082/futureblue-1.0-SNAPSHOT/carpool/carpooldata/owner/?userid=" + userid,
		dataType: 'jsonp',
		success: function(data){
			if(data.carpoolid === 0){
				console.log("No carpool found");
				callback(-1);
			}
			else{
				console.log("Carpool retrieved for user " + userid);
				callback(data);
			}
		}
	})
}

//creates and retrieve carpool
function createCarpool(home, work, arrive, depart, numseats, description, callback){
	var userinfo = readCookie("userinfo");
	if(userinfo.usertype!="owner"){
		callback(-2);
	}else{
		$.ajax({
			url: "http://futureblue.torolab.ibm.com:9082/futureblue-1.0-SNAPSHOT/carpool/carpooldata/register/?"
			+ "ownerid=" + userinfo.userid
			+ "&pointa=" + home 
			+ "&pointb=" + work
			+ "&arrivetime=" + arrive
			+ "&departtime=" + depart
			+ "&seats=" + numseats
			+ "&pickuppoints=" + "" 
			+ "&description=" + description
			+ "&location=" + "Markham"
			+ "&teamid=1",
			dataType: 'jsonp',
			success: function(data){
				if(data.response_code !== 0){
					console.log(data.response_status);
					callback(-1);
				}
				else{
					console.log(data.response_status);
					callback(data);
					//getOwnerCarpool(callback);
				}
			}
		});
	}
}	

function getRiderCarpool(callback){
	//?????
}

// TODO: Add pagination or infinite scroll
function listAllCarpool(callback){
	var url = "http://futureblue.torolab.ibm.com:9082/futureblue-1.0-SNAPSHOT/carpool/carpooldata/list/available/?start=0&limit=100";
	$.ajax({
		url: url,
		dataType: 'jsonp',
		success: function(data){
			callback(data);
		}
	})
}

function listAllRequests(carpoolid, callback){
	var url = "http://futureblue.torolab.ibm.com:9082/futureblue-1.0-SNAPSHOT/carpool/carpooldata/?id=" + carpoolid;
	$.ajax({
		url: url,
		dataType: 'jsonp',
		success: function(data){
			callback(data);
		}
	})
}

function acceptRequest(carpoolid, userid, callback){
	var url = "http://futureblue.torolab.ibm.com:9082/futureblue-1.0-SNAPSHOT/join/request/changestatus/?" +
	"carpoolid=" + carpoolid + "&userid=" + userid + "&status=accepted";
	$.ajax({
		url: url,
		dataType: 'jsonp',
		success: function(data){
			callback(data);
		}
	});
}

function rejectRequest(carpoolid, userid, callback){
	var url = "http://futureblue.torolab.ibm.com:9082/futureblue-1.0-SNAPSHOT/join/request/changestatus/?" +
	"carpoolid=" + carpoolid + "&userid=" + userid + "&status=rejected";
	$.ajax({
		url: url,
		dataType: 'jsonp',
		success: function(data){
			callback(data);
		}
	});
}

function getCarpool(carpoolid, callback){
	var url = "http://futureblue.torolab.ibm.com:9082/futureblue-1.0-SNAPSHOT/carpool/carpooldata/list/available/?start=0&limit=100";
	$.ajax({
		url: url,
		dataType: 'jsonp',
		success: function(carpools){
			for(carpool in carpools){
				if(carpoolid === carpools[carpool].carpoolid){
					callback(carpools[carpool]);
					return;
				}
			}
		}
	})
}

function removeFromCarpool(carpoolid, userid, callback){
	var url = "http://futureblue.torolab.ibm.com:9082/futureblue-1.0-SNAPSHOT/join/request/remove/?carpoolid="+ carpoolid +"&userid=" + userid + "&changeseatcount=true";
 	console.log(url);
	$.ajax({
		url:url,
		dataType: 'jsonp',
		success: function(data){

			callback((data.response_code===0));
		}		
	})
}

function getRiderRequests(callback){
	var url = "http://futureblue.torolab.ibm.com:9082/futureblue-1.0-SNAPSHOT/join/request/?userid=" + readCookie("userinfo").userid;
	$.ajax({
		url: url,
		dataType: 'jsonp',
		success: function(data){
			callback(data);
		}
	});
}

function getRiderRequestsCarpoolids(callback){
	var url = "http://futureblue.torolab.ibm.com:9082/futureblue-1.0-SNAPSHOT/join/request/?userid=" + readCookie("userinfo").userid;
	$.ajax({
		url: url,
		dataType: 'jsonp',
		success: function(data){
			var carpoolids = [];
			for(i in data){
				if(data[i].status!=="rejected")
					carpoolids.push(data[i].carpoolid);
			}
			callback(carpoolids);
		}
	});
}

function getRiderAcceptedRequest(callback){ // returns carpoolid of selected
	var url = "http://futureblue.torolab.ibm.com:9082/futureblue-1.0-SNAPSHOT/join/request/?userid=" + readCookie("userinfo").userid;
	$.ajax({
		url: url,
		dataType: 'jsonp',
		success: function(data){
			for(index in data){
				if(data[index].status === "accepted"){
					callback(data[index].carpoolid);
				}
			}
			callback(-1);
		}
	})
}

function requestCarpool(carpoolid,callback){
	var userid = readCookie("userinfo").userid;
	$.ajax({
		url: "http://futureblue.torolab.ibm.com:9082/futureblue-1.0-SNAPSHOT/join/request/register/?status=pending&teamid=1&userid=" + userid + "&carpoolid=" + carpoolid,
		dataType: 'jsonp',
		success: function(data){
			callback(data);
		}
	});
}

function getSlotsTaken(carpool){
	var count = 0;
	for(rider in carpool.riders){
		if(carpool.riders[rider].ridestatus === "accepted")
			++ count;
	}
	return count;
}

var QueryString = function () {
  var query_string = {};
  var query = window.location.search.substring(1);
  var vars = query.split("&");
  for (var i=0;i<vars.length;i++) {
    var pair = vars[i].split("=");
    	// If first entry with this name
    if (typeof query_string[pair[0]] === "undefined") {
      query_string[pair[0]] = pair[1];
    	// If second entry with this name
    } else if (typeof query_string[pair[0]] === "string") {
      var arr = [ query_string[pair[0]], pair[1] ];
      query_string[pair[0]] = arr;
    	// If third or later entry with this name
    } else {
      query_string[pair[0]].push(pair[1]);
    }
  } 
    return query_string;
} ();