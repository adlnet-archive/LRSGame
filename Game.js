	
	var gCurrentAction = '';
	var gBoxes = [];
	var gIDs = [];
	var gUserName = "";
	var Game = {};
	var dim = 7;
	var QueryString = null;
	var Progress;
	var Count = 0;
	var initialized = false;
	var tc_lrs = null;
	var gProfiles = null;
	var gActiveQuestion;
	var codes = [ "star","home","bike","kale","code","left","base","find","wrap","word","case","file","plan","door","save","hard","knife","latch","gecko","phone","geese","thumb","blink","night","house",
	              "games","duck","math","monitor","jumprope","pixel","shader","normal","genus","gabby","sailboat","dell","plain","ridge","bush","tree","farm","nice","giant","cape","knot","mast","coffee","number","chain"];
	var tilestates = 'workingcode000trumps000all0000000000Theory00000000';
	var specialCodes = [{code:'start',type:'extra point',points:1},
						{code:'match',type:'extra point',points:1},
						{code:'motor',type:'free tile',points:0},
						{code:'image',type:'free tile',points:0},
						{code:'fence',type:'smackdown',points:0}];
						
	var gQuestions;
    function GetQuestion(id)
	{
		if(gQuestions == null)
			InitQuestions();
		return gQuestions[id];	
	}
    function Question(text, a1, a2, a3, a4, ca,id)
	{
		this.questiontext = text;
		this.answer1 = a1;
		this.answer2 = a2;
		this.answer3 = a3;
		this.answer4 = a4;
		this.correctAnswer = ca;
		this.id = id;
	}	
	function InitQuestions()
	{
		gQuestions = {};
		
		var questions = [];
		questions.push(new Question("Test Question Text","dog","cat","horse","mouse",1,"Question 1"));
		questions.push(new Question("What is the name of the spec using the <actor><verb><object> construct used in Tin Can API?","Activity Streams","cat","horse","mouse",1,"Question 2"));
		questions.push(new Question("Which former ADL mobile learning guru was just inducted into the the USDLA Hall of Fame?","Judy Brown","cat","horse","mouse",1,"Question 3"));
		questions.push(new Question("What was the primary problem ADL was formed to solve?","interoperability","cat","horse","mouse",1,"Question 4"));
		questions.push(new Question("What is the technology used in the Tin Can API to communicate between systems?","web services","cat","horse","mouse",1,"Question 5"));
		questions.push(new Question("What is the name of Mozilla's effort to assign images for competencies or achievements?","Open Badges","cat","horse","mouse",1,"Question 6"));
		questions.push(new Question("Who is the ADL Technical Team Lead?","Jonathan Poltrack","cat","horse","mouse",1,"Question 7"));
		questions.push(new Question("Which country hosts the central american partnership lab?","Mexico","cat","horse","mouse",1,"Question 8"));
		questions.push(new Question("What state is the ADL academic colab located in?","Wisconsin","cat","horse","mouse",1,"Question 9"));
		questions.push(new Question("Who is the head of the academic colab? ","Rovy Brannon","cat","horse","mouse",1,"Question 10"));
		questions.push(new Question("what is the URL to ADL's TinCan API wiki?","http://tincanapi.wikispaces.com/","cat","horse","mouse",1,"Question 11"));
		questions.push(new Question("what is the URL to the Tin Can spec on the Tin Can Wiki?","http://tincanapi.wikispaces.com/Tin+Can+API+Specification","cat","horse","mouse",1,"Question 12"));
		for(var i = 0; i < codes.length; i++)
		gQuestions[codes[i]] = questions[Math.floor(Math.random() * questions.length)];
	}
	function DeInitialize()
	{
		if(initialized == true)
		{
		   // var BaseImage = document.getElementById("BaseImage");
			// BaseImage.parentElement.removeChild(BaseImage);
					
		   for(var i =0; i < dim; i++)
				for(var j =0; j < dim; j++)
				{
					var id = ("tile" + i ) + j;
					var div = document.getElementById(id);
					if(div) div.parentElement.removeChild(div);
					
					var id2 = ("tilebacking" + i ) + j;
					var div2 = document.getElementById(id2);
					if(div2) div2.parentElement.removeChild(div2);
				}
			initialized = false;	
		}
	}
	function Initialize()
	{
	    // document.getElementById('three').style.display = 'none';
		
	    if(initialized == true)
			return;
		initialized = true;
		$('#one').trigger('create');
		$('#GameBoard').trigger('create');
		var BaseImage = document.createElement('Img');
		BaseImage.src = "blankTile.png";
		BaseImage.style.width = "100%";
		BaseImage.style.height = "100%";
		BaseImage.style.left = "0";
		BaseImage.style.top = "0";
		BaseImage.style.margin = "0";
		BaseImage.style.padding = "0";
		BaseImage.style.position = 'fixed';
		BaseImage.id = "BaseImage";
		// document.getElementById('gamebase').appendChild(BaseImage);
		
		
		document.getElementById('gamebase').style.position = 'fixed';
		document.getElementById('gamebase').style.width = '100%';
		document.getElementById('gamebase').style.height = '100%';
		document.getElementById('gamebase').style.top = '0%';
		document.getElementById('gamebase').style.left = '0%';
		document.getElementById('gamebase').style.backgroundImage = 'url(blanktile.png)';
		document.getElementById('gamebase').style.backgroundSize = (100/dim + '% ') + (100/dim + '%');
    
		
		
		for(var i =0; i < dim; i++)
			for(var j =0; j < dim; j++)
				CreateTile(i,j,dim,codes[(i*dim)+j]);
				
		if(!localStorage.getItem("Progress"))
		localStorage.setItem("Progress",JSON.stringify([]));
		Count = 0;			
		Progress = JSON.parse(localStorage.getItem("Progress"));
		
		
	}
	function ReadProgress()
	{
			var hit = RemoveTile(Progress[Count],500);
			
			if( Count < Progress.length)
			{
			   Count++;
			   window.setTimeout(ReadProgress,150);
			   return;
			}
		
		if(gCurrentAction == 'Discovered')
		{
		    	console.log("action is discovered");
			var id = gCurrentId;
			console.log(id);
			gCurrentAction = '';
			gCurrentId = -1;
			for(var i = 0; i< Progress.length; i++)
			   if(Progress[i] == id)
			   {
			       
			       jqmSimpleMessage('Already Found!!');
				   return;
			   }
			if(IsValidCode(id))
			{			
			    LogAttempt(localStorage["UserEMail"],localStorage["UserName"],id,function(){		
				
			    jqmSimpleMessage('New Letter!', function(){RemoveTile(id,500);});})
			}
			else
			{
			    jqmSimpleMessage('Invalid Code!');
			}
		}
	}
	function containsRegex(a, regex){
	  for(var i = 0; i < a.length; i++) {
		if(a[i] == regex){
		  return i;
		}
	  }
	  return -1;
	}
	function IsValidCode(identifier)
	{
	   for(var i =0; i < dim; i++)
			for(var j =0; j < dim; j++)
			{
				
				var id = ("tile" + i ) + j;
				var div = document.getElementById(id);
				
				if(div && div.identifier == identifier)
				{ return true;}
			}
		
        return false;		
	}
	function IsNewCode(identifier)
	{
	   return containsRegex(Progress,identifier) == -1;
	}
	function RemoveTile(identifier,time)
	{
	
		for(var i =0; i < dim; i++)
			for(var j =0; j < dim; j++)
			{
				var id = ("tile" + i ) + j;
				var div = document.getElementById(id);
				
				if(div && div.identifier == identifier && div.removed == false)
				{
					if(containsRegex(Progress,identifier) == -1)
					{
						Progress.push(identifier);	
						localStorage.setItem("Progress",JSON.stringify(Progress));
					}
					newtop = (((100/dim) * j) + ((100/dim) * .5)) + "%";
					// $(div).stop().animate({'top':newtop,'height':"0%",'opacity':'0'},time);
					
					$(div).css('animation','fadeout3 1s').css('-moz-animation','fadeout3 1s').css('-webkit-animation','fadeout3 1s');
					window.setTimeout(function(){
					$(div).toggleClass('ui-page ui-body-c ui-page-active');
					$(div).css('animation','').css('-moz-animation','').css('-webkit-animation','');
					$(div).css('opacity','0');
					},900);
					div.removed = true;
					return true;
				}
			
			}
		return false;	
	}
		/* Other Util functions */
	function parseQueryString() {
		var loc, qs, pairs, pair, ii, parsed = {};
		
		loc = window.location.href.split(/[\?,\#]/);
		if (loc.length > 1) {
			qs = loc[1];
			pairs = qs.split('&');
			
		}
		if(loc.length > 2){
		    	qs = loc[2];
		    	pairs.concat(qs.split('&'));
		    
		}
		if(pairs != null)
		for ( ii = 0; ii < pairs.length; ii++) {
			pair = pairs[ii].split('=');
			if (pair.length === 2 && pair[0]) {
				parsed[pair[0]] = decodeURIComponent(pair[1]);
			}
		}
		    
		
		return parsed;
	}
	function ShowVendorData(tile)
	{
		jqmSimpleMessage("Visit " + tile + '`s booth to reveal this tile.');
		
	}
	function CreateTile(x,y,count,id)
	{
		var tilestate = tilestates[y*dim+x];
		if(tilestate !== '0')
		{
		
		var tile = document.createElement('Div');
		tile.style.width = ((100/count) + .1) + "%";
		tile.style.height = ((100/count)+ .1) + "%";
		tile.style.left = (((100/count) * x)) + "%";
		tile.style.top = (((100/count) * y)) + "%";
		tile.style.margin = "0";
		tile.style.padding = "0";
		tile.style.position = 'fixed';
		tile.style.background = 'url(whitetile.png)';
		tile.style.backgroundSize = '100% 100%';
		tile.style.fontSize = (window.innerHeight/dim)*.75 +'px';
		tile.style.color = 'black';
		tile.style.textAlign = 'center';
		tile.id = ("tilebacking" + x ) + y;
		document.getElementById('gamebase').appendChild(tile);
		
		
	        var tilecover = document.createElement('Img');
	        tilecover.style.width = ((100/count) + .1) + "%";
	        tilecover.style.height = ((100/count)+ .1) + "%";
	        tilecover.style.left = (((100/count) * x)) + "%";
	        tilecover.style.top = (((100/count) * y)) + "%";
	        tilecover.style.margin = "0";
	        tilecover.style.padding = "0";
	        tilecover.style.position = 'fixed';
	        // tilecover.style.background = 'url(yellowtile.png)';
	        // tilecover.style.backgroundSize = '100% 100%';
	        tilecover.src = 'yellowtile.png';
	        tilecover.id = ("tile" + x ) + y;
	        tilecover.onload = function(){
	            tile.innerHTML = tilestate;
	        }
	        tilecover.identifier = id;
	        tilecover.removed = false;
		document.getElementById('gamebase').appendChild(tilecover);
	        $(tilecover).click(function(){
			if(!tilecover.removed)
			ShowVendorData(tilecover.identifier);
			});
		}
	}
	Game.Initialize = Initialize;
	Game.CreateTile = CreateTile;
	Game.RemoveTile = RemoveTile;
	function GetTCProps()
	{
	
		var props = {
		 endpoint:"https://cloud.scorm.com/ScormEngineInterface/TCAPI/X5423TBH2O/sandbox/",
		 auth:"Basic " + Base64.encode('X5423TBH2O:Bxz4Cm9sp57i4R4ockiLQ4TFGKFlqdyS8v50ZpNG'),
		 actor:{ "mbox":[localStorage["UserName"]], "name":[localStorage["UserEMail"]] },
		 // registration:"",
		 // activity_id:"NDXS9EO128",
		 // grouping:"",
		 // activity_platform:""
		 
		};
		console.log(props);
		return props
	}
	
	function InitLRSConnection()
	{
	if(tc_lrs == null)
	 tc_lrs = TCDriver_GetLRSObject();
	}
	
	
	function ShowGamePage()
	{
		Initialize();
	
	     $.mobile.changePage($("#GameBoard"),{transition:"slide"});
		
	}
	function ShowStartPage()
	{
	$.mobile.changePage($("#one"),{transition:"slide"});	
	}
	function GetRawURL()
	{
		var url = window.location.href;
		var hash = url.indexOf('#');
		var q = url.indexOf('?');
		url = url.substr(0,q);
		if(url == "")
		url =  window.location.href;
		return url;
	}
	function ResetGame()
	{
	   $('#reset').addClass('ui-btn-active'); window.setTimeout(function(){$('#reset').removeClass('ui-btn-active');
	   
	   jqmSimpleMessage("Resetting", function(){ 
	   localStorage['UserName'] = ''; 
	   localStorage['Progress'] = '[]'; 
	   Progress = [];
	   Count = 0;
	   DeInitialize();
	   $.mobile.changePage($('#login'));
	   });
	   
	   },200);
	   
	}
	var gEmailCheck;
	var gTempUsername;
	var gPassword;
	function ProfilesReceivedSignUp(e)
	{
	    
	    if(e) gProfiles = JSON.parse(e.responseText).statements;
				
			var profile = null;
			for(var i = 0; i < gProfiles.length; i++)
			{
				if( gProfiles[i].actor.mbox[0] == "mailto:" + gEmailCheck)
					profile = gProfiles[i];
			}
			jqmDialogClose();
			if(	profile == null)
			{
				 localStorage["UserEMail"] = gEmailCheck;
				 localStorage["UserName"] = gTempUsername;
				 CreateProfile(localStorage["UserEMail"],localStorage["UserName"],gPassword);
				
				 window.setTimeout(function(){
				 
				 window.location  = $.mobile.path.parseUrl(window.location.href).hrefNoHash;
				 
				 },200);
			}else
			{
				jqmSimpleMessage("Email Taken. Try Again");
			}
		
		
	}
	
	function ProfilesReceivedSignIn(e)
	{
	    
	    if(e) 
		{   gProfiles = JSON.parse(e.responseText).statements;
			
			var profile = null;
			for(var i = 0; i < gProfiles.length; i++)
			{
				
				if( gProfiles[i].actor.mbox[0] == "mailto:" + gEmailCheck)
				{
					if(gProfiles[i].context.contextActivities.grouping.id == Base64.encode(gPassword))
						profile = gProfiles[i];
				}
			}
			jqmDialogClose();
			if(	profile != null)
			{
				 localStorage["UserEMail"] = profile.actor.mbox[0].substr(7);
				 localStorage["UserName"] = profile.actor.name[0];
				
				 window.setTimeout(function(){
				 
				 // window.location =
				    // $.mobile.path.parseUrl(window.location.href).hrefNoHash;
				 LoadProgressFromLRS();
				 },200);
			}else
			{
				jqmSimpleMessage("Invalid Login");
			}
		}
	}
		
	
	
	function GetProfiles()
	{
		
		if(!gProfiles)
			TCDriver_GetStatements(tc_lrs,null,'imported',null,ProfilesReceivedSignUp);
		ProfilesReceivedSignUp();
	}
	
// Email Validation Javascript
// copyright 23rd March 2003, by Stephen Chapman, Felgall Pty Ltd

// You have permission to copy and use this javascript provided that
// the content of the script is not changed in any way.

function validateEmail(addr,man,db) {
if (addr == '' && man) {
   if (db) alert('email address is mandatory');
   return false;
}
if (addr == '') return true;
var invalidChars = '\/\'\\ ";:?!()[]\{\}^|';
for (i=0; i<invalidChars.length; i++) {
   if (addr.indexOf(invalidChars.charAt(i),0) > -1) {
      if (db) alert('email address contains invalid characters');
      return false;
   }
}
for (i=0; i<addr.length; i++) {
   if (addr.charCodeAt(i)>127) {
      if (db) alert("email address contains non ascii characters.");
      return false;
   }
}

var atPos = addr.indexOf('@',0);
if (atPos == -1) {
   if (db) alert('email address must contain an @');
   return false;
}
if (atPos == 0) {
   if (db) alert('email address must not start with @');
   return false;
}
if (addr.indexOf('@', atPos + 1) > - 1) {
   if (db) alert('email address must contain only one @');
   return false;
}
if (addr.indexOf('.', atPos) == -1) {
   if (db) alert('email address must contain a period in the domain name');
   return false;
}
if (addr.indexOf('@.',0) != -1) {
   if (db) alert('period must not immediately follow @ in email address');
   return false;
}
if (addr.indexOf('.@',0) != -1){
   if (db) alert('period must not immediately precede @ in email address');
   return false;
}
if (addr.indexOf('..',0) != -1) {
   if (db) alert('two periods must not be adjacent in email address');
   return false;
}
var suffix = addr.substring(addr.lastIndexOf('.')+1);
if (suffix.length != 2 && suffix != 'com' && suffix != 'net' && suffix != 'org' && suffix != 'edu' && suffix != 'int' && suffix != 'mil' && suffix != 'gov' & suffix != 'arpa' && suffix != 'biz' && suffix != 'aero' && suffix != 'name' && suffix != 'coop' && suffix != 'info' && suffix != 'pro' && suffix != 'museum') {
   if (db) alert('invalid primary domain in email address');
   return false;
}
return true;
}

	function DoSetupActor()
	{
	    jqmDialogOpen("Creating Profile");
	    InitLRSConnection();
		gTempUsername = $("#username").val();
		gEmailCheck = $("#email").val();
		gPassword = $("#password").val();
		
		if($("#password").val() != $("#password1").val())
		{
		     jqmSimpleMessage("Passwords must match", function(){});
			 return;
		}
		
		if(!validateEmail(gEmailCheck,1,0))
		{
		     jqmSimpleMessage("Invaild Email. Try Again", function(){});
			 return;
		}
		
		
		GetProfiles(localStorage["UserEMail"]);
		
		
	}
    
    function DoSignIn()
	{
	    jqmDialogOpen("Signing In");
	    InitLRSConnection();
		
		gEmailCheck = $("#email2").val();
		gPassword = $("#password2").val();
		
		if(!validateEmail(gEmailCheck,1,0))
		{
		     jqmSimpleMessage("Invaild Email. Try Again", function(){});
			 return;
		}
		
		if(!gProfiles)
			TCDriver_GetStatements(tc_lrs,null,'imported',null,ProfilesReceivedSignIn);
		ProfilesReceivedSignIn();
		
	}	
	 
	function jqmDialogClose(){
	 $('#popup').stop();
	 $('#popup').remove();
	}
	function jqmDialogOpen(message) {
	 $('#popup').stop();
	 $('#popup').remove();
    $("<div id='popup' style = 'border-width:2px; border-color:black; border-style:solid;height:70%;top:15%;width:80%;left:10%;text-align:center;vertical-align:center;position:fixed' class='ui-loader ui-overlay-shadow ui-body-c ui-corner-all'><h1 style='top:50%;left:0%;height:10em;margin-top:-5em;width:100%;position:absolute;margin-top:auto;margin-bottom:auto;line-height:100%'>" + message + "</br><img src='ajax-loader.gif'></h1></img></div>")
        .css({
            display: "block",
            opacity: 0.96
        })
        .appendTo("body");
	}
	
	function jqmSimpleMessage(message,callback) {
	 $('#popup').stop();
	 $('#popup').remove();
    $("<div id='popup' style = 'border-width:2px; border-color:black; border-style:solid;height:70%;top:15%;width:80%;left:10%;text-align:center;vertical-align:center;position:fixed' class='ui-loader ui-overlay-shadow ui-body-c ui-corner-all'><h1 style='top:50%;left:0%;height:10em;margin-top:-5em;width:100%;position:absolute;margin-top:auto;margin-bottom:auto;line-height:100%'>" + message + "</h1></div>")
        .css({
            display: "block",
            opacity: 0.96
           
        })
        .appendTo("body").delay(3200).css('animation','fadeout2 2s').css('-moz-animation','fadeout2 2s').css('-webkit-animation','fadeout2 2s');
		
		
        window.setTimeout(function(){
            $('#popup').remove();
			if(callback)
				callback();
        },2000
		)
		;
		
	}
	
	function LogAttempt(email,name,id,callback)
	{
	
	            var tcCourseObj = {
                    "id":id,
                    "definition":{
                    	"type":"Course",
                        "name":{"en-US":"Find tile number" + id},
                        "description":{"en-US":"A simple game example for the Rustici LRS"}
                    }
                };
                var contextObj = {
                    "contextActivities":{
                        "grouping":{"id":"http://asdf"}
                    }
                };
                var stmt = {
                    "verb":"attempted",
                    "object":tcCourseObj,
                    "actor":{ "mbox":["mailto:" + email], "name":[name] },
					"context": contextObj
                };

				console.log("TCDriver_SendStatement");
                TCDriver_SendStatement(tc_lrs, stmt,callback);
	}
	function LogQuestion(name,email,Question,answer,callback)
	{
	
	            var obj = {
                    "id":GetRawURL()+"/"+Question.id,
                    "definition":{
                    	"type":"Question",
                        "name":{"en-US":Question.id},
                        "description":{"en-US":Question.questiontext}
                    }
                };
                
		var result = {success:(answer == Question.correctAnswer),completion : true};
                var stmt = {
                    "verb":"answered",
                    "object":obj,
                    "actor":{ "mbox":["mailto:" + email], "name":[name] },
					"result":result
                };

				console.log("TCDriver_SendStatement");
                TCDriver_SendStatement(tc_lrs, stmt,callback);
	}
	function CreateProfile(email,name, password,callback)
	{
	
		
	            var tcCourseObj = {
                    "id":window.location.href,
                    "definition":{
                    	"type":"Course",
                        "name":{"en-US":"LRSGame"},
                        "description":{"en-US":"A simple game to demo the LRS"}
                    }
                };
                var contextObj = {
                    "contextActivities":{
                        "grouping":{"id":Base64.encode(password)}
                    }
                };
                var stmt = {
                    "verb":"imported",
                    "object":tcCourseObj,
                    "actor":{ "mbox":["mailto:" + email], "name":[name] },
					"context": contextObj
                };

				console.log("TCDriver_SendStatement");
                TCDriver_SendStatement(tc_lrs, stmt,null,callback);
	}
	function compare(x,y)
	{
		if(x.count < y.count)
		return 1;
		else
		return -1;
	}
	
	function PopulateVendorPage(name)
	{
	    $('#VendorName').html(name);
	}
	
	function PopulateScorePage(name,email,count)
	{
	
	    $('#scorename').html(name);
		$('#scoreemail').html(email);
		$('#scoreval').html(count);
	}
	var LeaderboardPopulated = false;
	function PopulateLeaderBoardCallback(e)
	{
		// alert(e);
		$('#lboard').listview('refresh');
		var counts = [];
		LeaderboardPopulated = true;
	    var statements = JSON.parse(e.responseText).statements;
		for(var i in statements)
		{
			var found = false;
			var actorname = statements[i].actor.name[0];
			var actoremail = statements[i].actor.mbox[0];
			for(var j in counts)
			{
				if(counts[j].name && counts[j].name == actorname)
				{
					counts[j].count += 1;
					found = true;
				}
			}
			if(!found)
			{
				counts.push({name:actorname,count:1,email:actoremail});
				
			}
				
		}
		counts.sort(compare);
		document.getElementById('lboard').innerHTML = "";
		
		for(var j =0; j < Math.min(20,counts.length);j++)
		{
			var li = "<li><a onclick=\"PopulateScorePage('"+counts[j].name+"','"+counts[j].email+ "','"+counts[j].count +"')\" href='#UserScore'>"+counts[j].name+"</a><span class='ui-li-count'>"+counts[j].count+"</span></li>"
			document.getElementById('lboard').innerHTML += li;
		}
		$('#lboard').listview('refresh');
		jqmDialogClose();
	}
	
	function LoadProgressFromLRSCallback(e)
	{
		
		var counts = [];
	    var statements = JSON.parse(e.responseText).statements;
		var progress=[];
		for(var i in statements)
		{
			var found = false;
			var actorname = statements[i].actor.name[0];
			var actoremail = statements[i].actor.mbox[0];
			
			if(actoremail == "mailto:" + localStorage['UserEMail'])
			{
				progress.push(statements[i].object.id);
				console.log('got progress ' + statements[i].object.id);
			}
		}
		Progress = progress;
		localStorage['Progress'] = JSON.stringify(Progress);
		ShowGamePage();
		jqmDialogClose();
	}
	
	function LoadProgressFromLRS()
	{
	     try{
	        InitLRSConnection();
	        jqmDialogOpen("Loading progress");
			TCDriver_GetStatements(tc_lrs,null,'attempted',null,LoadProgressFromLRSCallback);
			}catch(e)
			{
			// alert(JSON.stringify(e));
			// jqmDialogClose();
			}
	}
	
	function PopulateLeaderBoard()
	{
	     try{
	       InitLRSConnection();
	        jqmDialogOpen("Downloading Stats");
			// alert('PopulateLeaderBoard');
			$('#refresh').addClass('ui-btn-active'); window.setTimeout(function(){$('#refresh').removeClass('ui-btn-active');},200);
			TCDriver_GetStatements(tc_lrs,null,'attempted',null,PopulateLeaderBoardCallback);
			}catch(e)
			{
			// alert(JSON.stringify(e));
			// jqmDialogClose();
			}
	}
	function DoManualEntry()
	{
	
		var code = $('#manualcode').val().toLowerCase();
		Initialize();
		if(IsValidCode(code))
        {
			if(IsNewCode(code) == true)
			{
				gCurrentAction = 'Question';
				gCurrentId = code;
				$.mobile.changePage($('#questionpage'));
				
			}else
			{
			    jqmSimpleMessage('Already Found!');
			}
		}else
		{
		   jqmSimpleMessage('Invalid Code!');
		}
	}

	function PollForEventsCallback(e)
	{
	    var statements = [];
	    if(e)
	    {
		statements = JSON.parse(e.responseText).statements;
		
		for(var i =0; i<statements.length; i++)
		{
		    var listcode = $('#EventList').html();
		    var newline = "<li>"+ statements[i].actor.name[0] + " " +  statements[i].verb + " " + statements[i].object.definition.name['en-US'] +"</li>";
		    		
		    $('#EventList').html(newline + listcode);
		  
		}
		$('#EventList').listview('refresh');
	    }
	    window.setTimeout(PollForEvents,5000);
	}
	function PollForEvents()
	{
	    InitLRSConnection();
	    var now = new Date();
	    now.setMilliseconds(0);
	    tc_lrs.until = now;
	    tc_lrs.since = new Date(now.getFullYear(),now.getMonth(),now.getDate(),now.getHours(),now.getMinutes(),now.getSeconds()-5);
	    
	    console.log(TCDriver_ISODateString(tc_lrs.until));
	    console.log(TCDriver_ISODateString(tc_lrs.since));
	    
	    TCDriver_GetStatements(tc_lrs,null,null,null,PollForEventsCallback);
	}
	function AnswerQuestion(answer)
	{
			LogQuestion(localStorage['UserName'],localStorage['UserEMail'],gActiveQuestion,answer,function(){});
			if(gActiveQuestion.correctAnswer == answer)
			{
				jqmSimpleMessage('Correct!',function(){
									gCurrentAction = "Discovered";
									$.mobile.changePage($('#GameBoard'),{transition:'slide'});
								});
			}else
			{
				jqmSimpleMessage('Wrong!',function(){gCurrentAction = "Failed";
														$.mobile.changePage($('#one'),{transition:'fade'});
								});
			}
	}
	$(document).ready(function(){
	
	   jQuery.fx.interval = 100;

	   
	   InitLRSConnection();
	   
	   // $('#one').css('z-index',"1000");
	 
	   QueryString = parseQueryString();
	   gCurrentAction = QueryString["action"];
	   gCurrentId = QueryString["id"];
	   	
	   if(window.location.hash.indexOf('&') > -1)
	       window.location.hash = window.location.hash.substr(0,window.location.hash.indexOf('&'));
	   if(localStorage['UserName'] == null || localStorage['UserName'] == "" && $.mobile.path.parseUrl(window.location).hash != '#login' )
	   {
	     jqmDialogOpen('New User Login');
		 window.setTimeout(function(){$.mobile.changePage($('#login'));},500);
	    
		 return;
	   }
	   


	});
	
	$(document).bind("mobileinit", function () {
	    
       
    });
	
	$("#login").live("pageinit",function (event) {InitLRSConnection();});
	$("#login").live("pageshow",function (event) {jqmDialogClose();});
	
	$('#LeaderBoard').live('pageinit', function (event) {if(LeaderboardPopulated == false) PopulateLeaderBoard();});
	$('#GameBoard').live('pageshow', function (event) {Initialize();ReadProgress();});		 

	$('#togameboard').live('vmousedown',function(){
	   $('#togameboard').addClass('ui-btn-active'); window.setTimeout(function(){$('#togameboard').removeClass('ui-btn-active');},1000); ShowGamePage();
	   });
	
	$('#refresh').live('vmousedown',function(){
	   $('#refresh').addClass('ui-btn-active'); window.setTimeout(function(){$('#refresh').removeClass('ui-btn-active');PopulateLeaderBoard();},300); 
	   });
		
	$('#ManualEntryOk').live('vmousedown',function(){
	   $('#ManualEntryOk').addClass('ui-btn-active'); window.setTimeout(function(){$('#ManualEntryOk').removeClass('ui-btn-active');DoManualEntry();},300); 
	   });
	
	$('#usernameok').live('vmousedown',function(){
	   $('#usernameok').addClass('ui-btn-active'); window.setTimeout(function(){$('#usernameok').removeClass('ui-btn-active');DoSetupActor()},300); ;
	   });
	
	$('#reset').live('vmousedown',function(){
	   $('#reset').addClass('ui-btn-active'); window.setTimeout(function(){$('#reset').removeClass('ui-btn-active');ResetGame();},300); 
	   });

	
    $('#gameboardBack').live('vmousedown',function(){
	   ShowStartPage(); $('#gameboardBack').addClass('ui-btn-active'); window.setTimeout(function(){$('#gameboardBack').removeClass('ui-btn-active');},1000);
	   });
	
	$('#gameboardGuess').live('vmousedown',function(){
	   $.mobile.changePage('#SubmitGuess',{transition:'slide'}); $('#gameboardGuess').addClass('ui-btn-active'); window.setTimeout(function(){$('#gameboardGuess').removeClass('ui-btn-active');},1000);
	   });	
	   
	$('#UserInfo').live('pagebeforeshow',function(){
	   $('#currentusername').html(localStorage['UserName']);
	   $('#currentuseremail').html(localStorage['UserEMail']);
	   });   

	$('#one').live('pagebeforeshow',function(){
	 
	   if(gCurrentAction == "Discovered")
	   {
		         Initialize();
				 window.setTimeout(ReadProgress,100);	
				 // $('#GameBoard').toggleClass('ui-page
				    // ui-body-c ui-page-active');
				 // $('#one').toggleClass('ui-page ui-body-c
				    // ui-page-active');
				 ShowGamePage();
				 
	   }
	   if(gCurrentAction == "Question")
	   {
		 gActiveQuestion = GetQuestion(gCurrentId);
		 $.mobile.changePage($('#questionpage'));
		 return;
	   }
});     
	$('#questionpage').live('pagebeforeshow',function(){
	   
	   gActiveQuestion = GetQuestion(gCurrentId);
	   $('#answer1').html("<br/>"+gActiveQuestion.answer1+"<br/><br/>");
	   $('#answer2').html("<br/>"+gActiveQuestion.answer2+"<br/><br/>");
	   $('#answer3').html("<br/>"+gActiveQuestion.answer3+"<br/><br/>");
	   $('#answer4').html("<br/>"+gActiveQuestion.answer4+"<br/><br/>");
	   $('#questiontext').html(gActiveQuestion.questiontext);
	   });
	   
$('#answer1').live('vmousedown',function(){
		AnswerQuestion(1);
});	
$('#answer2').live('vmousedown',function(){
		AnswerQuestion(2);
});	
$('#answer3').live('vmousedown',function(){
		AnswerQuestion(3);
});	
$('#answer4').live('vmousedown',function(){
		AnswerQuestion(4);
});	
$('#signinok').live('vmousedown',function(){
	   $('#signinok').addClass('ui-btn-active'); window.setTimeout(function(){$('#signinok').removeClass('ui-btn-active');DoSignIn()},300); ;
	   });	  
var gPageLoading = false;		   
$('#LeaderBoard').live('pagechange',function(){
	  $('[data-role=navbar] a').removeClass("ui-btn-active"); $('.footerbuttonLB').addClass('ui-btn-active');gPageLoading = false;	
	   });
$('#GameBoard').live('pagechange',function(){
	  $('[data-role=navbar] a').removeClass("ui-btn-active"); $('.footerbuttonGB').addClass('ui-btn-active');gPageLoading = false;	
	   });
$('#ManualEntry').live('pagechange',function(){
	  $('[data-role=navbar] a').removeClass("ui-btn-active"); $('.footerbuttonME').addClass('ui-btn-active');gPageLoading = false;	
	   });
$('#Help').live('pagechange',function(){
	  $('[data-role=navbar] a').removeClass("ui-btn-active"); $('.footerbuttonA').addClass('ui-btn-active');gPageLoading = false;	
	   });		   
	   
$('.footerbuttonGB').live('vmouseup',function(){
	// if(gPageLoading == true) return;
	$('[data-role=navbar] a').removeClass("ui-btn-active"); $('.footerbuttonGB').addClass('ui-btn-active');
	$.mobile.changePage('#GameBoard',{transition:'slide'});
    gPageLoading = true;		
});	   
$('.footerbuttonLB').live('vmouseup',function(){
	// if(gPageLoading == true) return;
	$('[data-role=navbar] a').removeClass("ui-btn-active"); $('.footerbuttonLB').addClass('ui-btn-active');
	if($.mobile.activePage[0].id == 'GameBoard')
		$.mobile.changePage('#LeaderBoard',{transition:'slide'});	
	else
		$.mobile.changePage('#LeaderBoard');
	gPageLoading = true;		
});
$('.footerbuttonME').live('vmouseup',function(){
	// if(gPageLoading == true) return;
	$('[data-role=navbar] a').removeClass("ui-btn-active"); $('.footerbuttonME').addClass('ui-btn-active');
	if($.mobile.activePage[0].id == 'GameBoard')
		$.mobile.changePage('#ManualEntry',{transition:'slide'});	
	else
		$.mobile.changePage('#ManualEntry');
	gPageLoading = true;	
});
$('.footerbuttonA').live('vmouseup',function(){
	// if(gPageLoading == true) return;
	$('[data-role=navbar] a').removeClass("ui-btn-active"); $('.footerbuttonA').addClass('ui-btn-active');
	if($.mobile.activePage[0].id == 'GameBoard')
		$.mobile.changePage('#Help',{transition:'slide'});	
	else
		$.mobile.changePage('#Help');
	gPageLoading = true;	
});
	 
	 
$('.footerbuttonGB').live('touchstart',function(){
	$('[data-role=navbar] a').removeClass("ui-btn-active"); $('.footerbuttonGB').addClass('ui-btn-active');
	
});	   
$('.footerbuttonLB').live('touchstart',function(){
	$('[data-role=navbar] a').removeClass("ui-btn-active"); $('.footerbuttonLB').addClass('ui-btn-active');

		
});
$('.footerbuttonME').live('touchstart',function(){
	$('[data-role=navbar] a').removeClass("ui-btn-active"); $('.footerbuttonME').addClass('ui-btn-active');
	
});
$('.footerbuttonA').live('touchstart',function(){
	$('[data-role=navbar] a').removeClass("ui-btn-active"); $('.footerbuttonA').addClass('ui-btn-active');
	
});						
	
$('#LiveStream').live('pageinit', function (event) {PollForEvents();});