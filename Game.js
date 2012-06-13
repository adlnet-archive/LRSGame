//Some Global variables to hold state
var gCurrentAction = '';	//This is the currently executing action of the system. Holds things like "discovered"
var Game = {};			//A global to namespace all this stuff
var dim = 7;			//the dimentions of the game board
var Progress;			//The array of gCodes already discovered
var Count = 0;			//A global counter used during the progressive reveal of tiles on initialize
var initialized = false;	//Flag for initialized
var tc_lrs = null;		//holds LRS connection data
var gProfiles = null;		//array of profiles from LRS
var gActiveQuestion;		//The currently executing question
var gGuessMaximum = 5;
//These are all the gCodes that will be assigned to tiles on the gameboard
var gCodes = [ "star","home","bike","kale","code","left","base","find","wrap","word","case","file","plan","door","save","hard","knife","latch","gecko","phone","geese","thumb","blink","night","house",
              "games","duck","math","monitor","jumprope","pixel","shader","normal","genus","gabby","sailboat","dell","plain","ridge","bush","tree","farm","nice","giant","cape","knot","mast","coffee","number","chain"];
//these are the letters under the tiles. '0' means inactive
var gTilestates = 'workingcode000trumps000all0000000000Theory00000000';
var gPuzzleAnswer = 'working code trumps all theory';
var gOrder = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50];
var gTileCounter = 0;
//not currently used
var specialCodes = [{code:'start',type:'extra point',points:1},
                    {code:'match',type:'extra point',points:1},
                    {code:'motor',type:'free tile',points:0},
                    {code:'image',type:'free tile',points:0},
                    {code:'fence',type:'smackdown',points:0}];

// Holds all the questions
var gQuestions;

//Get a questiong by ID, and init the questions if not inited	
function GetQuestion(id)
{
    if(gQuestions == null)
	InitQuestions();
    return gQuestions[id];	
}
//Constructor for a questiong
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
//Create all the question objects
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

    //Associate questions with gCodes
    for(var i = 0; i < gCodes.length; i++)
	{
		gQuestions[gCodes[i]] = questions[Math.floor(Math.random() * questions.length)];
		
	}
}
//Remove from the gameboard all the elements createded during initilaize
function DeInitialize()
{
    if(initialized == true)
    {
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
//Setup the gameboard, create all the divs, letters, and images
function Initialize()
{
    
    //Bail if already initialized
    if(initialized == true)
	return;
    initialized = true;
    
    //jQuery setup for some buttons
    //Can probably be removed
    $('#one').trigger('create');
    $('#GameBoard').trigger('create');
    
    //Setup the gameboard div with the background image
    document.getElementById('gamebase').style.position = 'fixed';
    document.getElementById('gamebase').style.width = '100%';
    document.getElementById('gamebase').style.height = '90%';
    document.getElementById('gamebase').style.top = '10%';
    document.getElementById('gamebase').style.left = '0%';
    document.getElementById('gamebase').style.backgroundImage = 'url(blanktile.png)';
    document.getElementById('gamebase').style.backgroundSize = (101/dim + '% ') + (101/dim + '%');


    //Create a tile in a dim x dim grid
    for(var i =0; i < dim; i++)
	for(var j =0; j < dim; j++)
	    CreateTile(i,j,dim,gOrder[(i*dim)+j]);
    
    //If local storage "Progress is blank, make it empty array
    if(!localStorage.getItem("Progress"))
	localStorage.setItem("Progress",JSON.stringify([]));
    Count = 0;
    
    //Load global Progress array
    Progress = JSON.parse(localStorage.getItem("Progress"));
}

//This is called iterivly over time to reveal tiles
function ReadProgress()
{
    

    //If there are more tiles, wait 150 milliseconds, then remove the next
    if( Count < Progress.length)
    {
	//Remove the current tile, ennurmerated by 'Count'
	if(Progress[Count].success == true)
	var hit = RemoveTile(gOrder[Count],500);
	Count++;
	window.setTimeout(ReadProgress,150);
	return;
    }

    //If all the tiles are removed, then check if this is a new tile discovery
    if(gCurrentAction == 'Discovered')
    {
	console.log("action is discovered");
	var id = gCurrentId;
	console.log(id);
	gCurrentAction = '';
	gCurrentId = -1;
	
	//If for some reason it's the same tile, show a prompt
	//This should be pretty hard to get to, unless manually entering URL's
	for(var i = 0; i< Progress.length; i++)
	    if(Progress[i].code == id)
	    {

		jqmSimpleMessage('Already Found!!');
		return;
	    }
	//Same for invalid gCodes. The GUI on the manual entry page should prevent this, but
	//someone could enter it directly in the url
	if(IsValidCode(id))
	{	
	    //Log the attempt to the LRS if it's a good code.
	    //Removed! this is not handled during the question answer phase
	    //LogAttempt(localStorage["UserEMail"],localStorage["UserName"],id,function(){		
		
		Progress.push({code:id,success:true});	
		localStorage.setItem("Progress",JSON.stringify(Progress));
		
		jqmSimpleMessage('New Letter!', function(){RemoveTile(gOrder[Progress.length-1],500);})
		
		
	}
	else
	{
	    jqmSimpleMessage('Invalid Code!');
	}
    }
}
//Find in a list of strings
function contains(a, regex){
    for(var i = 0; i < a.length; i++) {
	if(a[i].code == regex){
	    return i;
	}
    }
    return -1;
}
//True of a code corresponds to a covered tile
function IsValidCode(identifier)
{
	for(var i = 0; i < gCodes.length; i++)
	{
		if(gCodes[i] == identifier)
			return true;
	}
    return false;		
}
//True if the code is not in the list of previously discovered gCodes
function IsNewCode(identifier)
{
    return contains(Progress,identifier) == -1;
}
//Remove a tile from the gameboard, to reveal it's leter
function RemoveTile(OrderNumber,time)
{
    //Walk over all the tiles
    for(var i =0; i < dim; i++)
	for(var j =0; j < dim; j++)
	{
	    var id = ("tile" + i ) + j;
	    var div = document.getElementById(id);

	    //If the tile exists, and it's code is the right code, and it's not been removed already
	    if(div && div.OrderNumber == OrderNumber && div.removed == false)
	    {
		//*** Rob - removed now that tiles are revealed in an order.
		//Should not be in progress anyway, just in case
		//if(contains(Progress,identifier) == -1)
		//{
		//    //Set the progress to include this new code
		//    Progress.push({code:identifier,success:true});	
		//    localStorage.setItem("Progress",JSON.stringify(Progress));
		//}
		newtop = (((100/dim) * j) + ((100/dim) * .5)) + "%";
		
		//Do the GUI CSS Animations
		$(div).css('animation','fadeout3 1s').css('-moz-animation','fadeout3 1s').css('-webkit-animation','fadeout3 1s');
		window.setTimeout(function(){
		    $(div).toggleClass('ui-page ui-body-c ui-page-active');
		    $(div).css('animation','').css('-moz-animation','').css('-webkit-animation','');
		    $(div).css('opacity','0');
		},900);
		div.removed = true;
		//Return true if you removed a tile
		return true;
	    }
	}
    //Return false if no tile was removed
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
//Pop up a dialog with the data from a tile
//Used for debugging only.
function ShowVendorData(tile)
{
    jqmSimpleMessage("Visit " + tile + '`s booth to reveal this tile.');
}

//Create a game tile
function CreateTile(x,y,count)
{
    //Read the letter that goes under this tile
    var tilestate = gTilestates[x*dim+y];
    
    //Don't bother createing yellow blocking tiles for letters that are Zero.
    //Zero marks that there is no letter to see
    if(tilestate !== '0')
    {
	//Create the white background tile
	var tile = document.createElement('Div');
	tile.style.width = ((100/count) + .1) + "%";
	tile.style.height = ((90/count)+ .1) + "%";
	tile.style.left = (((100/count) * y)) + "%";
	tile.style.top = ((10+(90/count) * x)) + "%";
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

	//Create the yellow covering tile
	var tilecover = document.createElement('Img');
	tilecover.style.width = ((100/count) + .1) + "%";
	tilecover.style.height = ((90/count)+ .1) + "%";
	tilecover.style.left = (((100/count) * y)) + "%";
	tilecover.style.top = ((10+(90/count) * x)) + "%";
	tilecover.style.margin = "0";
	tilecover.style.padding = "0";
	tilecover.style.position = 'fixed';
	tilecover.src = 'yellowtile.png';
	tilecover.id = ("tile" + x ) + y;
	
	//Only set the letter for the background tile when the covering is in place
	//The prevents a flash that shows the entire message on some phones
	tilecover.onload = function(){
	    tile.innerHTML = tilestate;
	}
	
	tilecover.OrderNumber = gTileCounter;
	gTileCounter++;
	tilecover.removed = false;
	document.getElementById('gamebase').appendChild(tilecover);
	
	//Debug only function to show tile's code.
	$(tilecover).click(function(){
	    if(!tilecover.removed)
		ShowVendorData(tilecover.OrderNumber);
	});
    }
}

//Some globals
Game.Initialize = Initialize;
Game.CreateTile = CreateTile;
Game.RemoveTile = RemoveTile;

//Get the endpoint for the LRS connection
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
//Get the LRS connection object.
function InitLRSConnection()
{
    if(tc_lrs == null)
	tc_lrs = TCDriver_GetLRSObject();
}

//Switch to the GamePage
function ShowGamePage()
{
    Initialize();
    //Use the slide transition whenever going to or from the gamepage
    //Some phones fade werid, and show the answer
    $.mobile.changePage($("#GameBoard"),{ transition: "slide", changeHash: true });
}
//Switch to the start page
function ShowStartPage()
{
    $.mobile.changePage($("#one"),{ transition: "slide", changeHash: true });	
}

//Get the URL without any paramerters
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

//Forget all local data. This will clear progress, and the stored username and password
function ResetGame()
{
    $('#reset').addClass('ui-btn-active'); window.setTimeout(function(){$('#reset').removeClass('ui-btn-active');

    jqmSimpleMessage("Resetting", function(){ 
	localStorage['UserName'] = ''; 
	localStorage['Progress'] = '[]'; 
	localStorage['guesses'] = '[]'; 
	Progress = [];
	Count = 0;
	DeInitialize();
	$.mobile.changePage($('#login'),{ transition: "fade", changeHash: false });
    });

    },200);
}

//Temp globals for checking login data
var gEmailCheck;
var gTempUsername;
var gPassword;

//Callback for getting profiles during the signup process
function ProfilesReceivedSignUp(e)
{
    //Get the profiles
    if(e){ gProfiles = JSON.parse(e.responseText).statements;}
	if(gProfiles)
	{
		var profile = null;
		for(var i = 0; i < gProfiles.length; i++)
		{
		if( gProfiles[i].actor.mbox[0] == "mailto:" + gEmailCheck)
			profile = gProfiles[i];
		}
		jqmDialogClose();
		
		//If you did not find a profile with the same data, then this is a new one and can proceed
		if(	profile == null)
		{
		localStorage["UserEMail"] = gEmailCheck;
		localStorage["UserName"] = gTempUsername;
		//Send the new login data to the LRS
		CreateProfile(localStorage["UserEMail"],localStorage["UserName"],gPassword);

		window.setTimeout(function(){
				
		ShowGamePage();

		},200);
		}else
		{
		//There was a collision with an existing profile, cant create a new one.
		jqmSimpleMessage("Email Taken. Try Again");
		}

	}
}

//PRofiles are received callback during sign in
function ProfilesReceivedSignIn(e)
{
    
    if(e) 
    {   gProfiles = JSON.parse(e.responseText).statements;
	}
	if(gProfiles)
	{
		//Walk all profile events
		var profile = null;
		for(var i = 0; i < gProfiles.length; i++)
		{

			//Check the name and password
			if( gProfiles[i].actor.mbox[0] == "mailto:" + gEmailCheck)
			{
				if(gProfiles[i].context.contextActivities.grouping.id == SHA1(gPassword))
				profile = gProfiles[i];
			}
		}
		jqmDialogClose();
		//Store the login data locally if login is successful
		if(	profile != null)
		{
			localStorage["UserEMail"] = profile.actor.mbox[0].substr(7);
			localStorage["UserName"] = profile.actor.name[0];

			window.setTimeout(function(){

				// Load the user's progress from the LRS events
				LoadProgressFromLRS();
			},200);
		}else
		{
			//Login was not successful - either bad username or password
			jqmSimpleMessage("Invalid Login");
		}
		
    }
}

//Get the profiles for all users
function GetProfiles()
{
    if(!gProfiles)
	TCDriver_GetStatements(tc_lrs,null,'imported',null,ProfilesReceivedSignUp);
    ProfilesReceivedSignUp();
}

//Email Validation Javascript
//copyright 23rd March 2003, by Stephen Chapman, Felgall Pty Ltd

//You have permission to copy and use this javascript provided that
//the content of the script is not changed in any way.

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

//Function to create new actor
function DoSetupActor()
{
    jqmDialogOpen("Creating Profile");
    InitLRSConnection();
    gTempUsername = $("#username").val();
    gEmailCheck = $("#email").val();
    gPassword = $("#password").val();

    //Check matching passwords 
    if($("#password").val() != $("#password1").val())
    {
	jqmSimpleMessage("Passwords must match", function(){});
	return;
    }
    
    //Check for valid email
    if(!validateEmail(gEmailCheck,1,0))
    {
	jqmSimpleMessage("Invaild Email. Try Again", function(){});
	return;
    }

    //Get the profiles, check for sign up collicion
    GetProfiles(localStorage["UserEMail"]);
}

//Sign in to an existing account
function DoSignIn()
{
    jqmDialogOpen("Signing In");
    InitLRSConnection();

    gEmailCheck = $("#email2").val();
    gPassword = $("#password2").val();

    //Check for valid email 
    if(!validateEmail(gEmailCheck,1,0))
    {
	jqmSimpleMessage("Invaild Email. Try Again", function(){});
	return;
    }

    //Get the profiles, with the correct callback to check for password
    if(!gProfiles)
	TCDriver_GetStatements(tc_lrs,null,'imported',null,ProfilesReceivedSignIn);
    ProfilesReceivedSignIn();

}	

//Close a popup dialog
function jqmDialogClose(){
    $('#popup').stop();
    $('#popup').remove();
}
//Open a popup dialog
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
//Open a times popup dialog
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

function LogSubmitGuess(answer,correct)
{
    var tcCourseObj = {
	    "id":"Puzzle",
	    "definition":{
		"type":"Course",
		"name":{"en-US":"answer the puzzle"},
		"description":{"en-US":answer}
	    }
    };

    var result = {success:correct,completion : true};
    var stmt = {
	    "verb":"completed",
	    "object":tcCourseObj,
	    "actor":{ "mbox":["mailto:" + localStorage["UserEMail"]], "name":[localStorage["UserName"]] },
		"result":result
    };

    console.log("TCDriver_SendStatement");
    TCDriver_SendStatement(tc_lrs, stmt,function(){});

}

//Log to the LRS an attempt to uncover a tile
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

//Log to the LRS an answered question
function LogQuestion(name,email,Question,answer,callback)
{

    var obj = {
	    "id":GetRawURL()+"/"+Question.id,
	    "definition":{
		"type":"Question",
		"name":{"en-US":gCurrentId},
		"description":{"en-US":Question.questiontext}
	    }
    };

    var result = {success:(answer === Question.correctAnswer),completion : true};
    var stmt = {
	    "verb":"answered",
	    "object":obj,
	    "actor":{ "mbox":["mailto:" + email], "name":[name] },
	    "result":result
    };

    console.log("TCDriver_SendStatement");
    TCDriver_SendStatement(tc_lrs, stmt,callback);
}
//Create a new profile on the LRS
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
		"grouping":{"id":SHA1(password)}
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
//Used when sorting list of scores
function compare(x,y)
{
    if(x.correct - x.incorrect < y.correct - y.incorrect )
	return 1;
    else
	return -1;
}
//Simple function for debug show id
function PopulateVendorPage(name)
{
    $('#VendorName').html(name);
}

//Show the stats for a given users
function PopulateScorePage(name,email,count)
{
    $('#scorename').html(name);
    $('#scoreemail').html(email);
    $('#scoreval').html(count);
}

//Global to check that the leaderboard has been initilazed
var LeaderboardPopulated = false;

//Callback from AJAX after getting all the events from the LRS
function PopulateLeaderBoardCallback(e)
{
    // jQuery needs to refresh the styles on the control
    $('#lboard').listview('refresh');
    var counts = [];
    LeaderboardPopulated = true;
    var statements = JSON.parse(e.responseText).statements;
    for(var i in statements)
    {
	//Group the statements buy the name of the actor
	if(statements[i].verb == 'answered')
	{
        	var found = false;
        	var actorname = statements[i].actor.name[0];
        	var actoremail = statements[i].actor.mbox[0];
        	for(var j in counts)
        	{
        	    if(counts[j].name && counts[j].name == actorname)
        	    {
        		if(statements[i].result.success === true)
        		    counts[j].correct += 1;
        		else
        		    counts[j].incorrect += 1;
        		found = true;
        	    }
        	}
        	if(!found)
        	{
        	    if(statements[i].result.success === true)
        	    	counts.push({name:actorname,correct:1,incorrect:0,email:actoremail});
        	    else
        		counts.push({name:actorname,correct:0,incorrect:1,email:actoremail});
        	}
	}
    }
    
    //Counts now contains a list of pairs of names and scores;
    //Sort the highest score to the top
    counts.sort(compare);
    document.getElementById('lboard').innerHTML = "";
    
    //For the top 20 names, print them into the leaderboard div
    for(var j =0; j < Math.min(20,counts.length);j++)
    {
	var li = "<li><a onclick=\"PopulateScorePage('"+counts[j].name+"','"+counts[j].email+ "','"+(counts[j].correct + counts[j].incorrect) +"')\" href='#UserScore'>"+counts[j].name+"</a><span class='ui-li-count'><div style='color:green;display:inline'>"+counts[j].correct +"</div>/<div style='color:red;display:inline'>"+ counts[j].incorrect+"</div></span></li>"
	document.getElementById('lboard').innerHTML += li;
    }
    $('#lboard').listview('refresh');
    jqmDialogClose();
}

//Read the scores from the LRS to get the progress for someone logging in on a new device
function LoadGuessesFromLRSCallback(e)
{
	
    var statements = JSON.parse(e.responseText).statements;
    var guesses = [];
    for(var i in statements)
    {
		var found = false;
		var actorname = statements[i].actor.name[0];
		var actoremail = statements[i].actor.mbox[0];
		
		
		//If the statement actor is the logged in actor, push the ID of the tile onto the 
		//global progress list
		if(actoremail == "mailto:" + localStorage['UserEMail'])
		{
			guesses.push(statements[i].object.definition.description['en-US']);
			console.log('got progress ' + statements[i].object.definition.description['en-US']);
		}
    }
    //Save this data in localstoragte for next time
    
    localStorage['guesses'] = JSON.stringify(guesses);
	
	jqmDialogClose();
	
    ShowGamePage();
}

//Read the scores from the LRS to get the progress for someone logging in on a new device
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
	
	//If the statement actor is the logged in actor, push the ID of the tile onto the 
	//global progress list
	if(actoremail == "mailto:" + localStorage['UserEMail'])
	{
	    progress.push({code:statements[i].object.definition.name['en-US'],success:statements[i].result.success});
	    console.log('got progress ' + statements[i].object.id);
	}
    }
    //Save this data in localstoragte for next time
    Progress = progress;
    localStorage['Progress'] = JSON.stringify(Progress);
	
	
	
    
    jqmDialogClose();
	
	jqmDialogOpen("Loading Puzzle Guesses");
	TCDriver_GetStatements(tc_lrs,null,'completed',null,LoadGuessesFromLRSCallback);
}
//Load the progress from the LRS.
function LoadProgressFromLRS()
{
    try{
	InitLRSConnection();
	jqmDialogOpen("Loading progress");
	TCDriver_GetStatements(tc_lrs,null,'answered',null,LoadProgressFromLRSCallback);
    }catch(e)
    {
	// alert(JSON.stringify(e));
	// jqmDialogClose();
    }
}

//Populate the leader board with the score data
function PopulateLeaderBoard()
{
    try{
	InitLRSConnection();
	jqmDialogOpen("Downloading Stats");
	// alert('PopulateLeaderBoard');
	$('#refresh').addClass('ui-btn-active'); window.setTimeout(function(){$('#refresh').removeClass('ui-btn-active');},200);
	TCDriver_GetStatements(tc_lrs,null,'answered',null,PopulateLeaderBoardCallback);
    }catch(e)
    {
	// alert(JSON.stringify(e));
	// jqmDialogClose();
    }
}
//Allow a user to manually enter a code, in case they don't have a scanner
function DoManualEntry()
{
    //The code to test
    var code = $('#manualcode').val().toLowerCase();
    Initialize();
    
    //Check code is valid
    if(IsValidCode(code))
    {
	//Check code is new
	if(IsNewCode(code) == true)
	{
	    gCurrentAction = 'Question';
	    gCurrentId = code;
	    $.mobile.changePage($('#questionpage'),{ transition: "fade", changeHash: false });

	}else
	{
	    jqmSimpleMessage('Already Found!');
	}
    }else
    {
	jqmSimpleMessage('Invalid Code!');
    }
}

//Received new events for the live stream of LRS events
function PollForEventsCallback(e)
{
    var statements = [];
    if(e)
    {
	statements = JSON.parse(e.responseText).statements;

	//Add each event to the list view
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
//Get all the events in the last 5 seconds
function PollForEvents()
{
    InitLRSConnection();
    var now = new Date();
    now.setMilliseconds(0);
    //Set the time slicing params for the LRS Search functions
    tc_lrs.until = now;
    tc_lrs.since = new Date(now.getFullYear(),now.getMonth(),now.getDate(),now.getHours(),now.getMinutes(),now.getSeconds()-5);

    console.log(TCDriver_ISODateString(tc_lrs.until));
    console.log(TCDriver_ISODateString(tc_lrs.since));

    TCDriver_GetStatements(tc_lrs,null,null,null,PollForEventsCallback);
}

// A user is answering a question
function AnswerQuestion(answer)
{
    //Send the results to the LRS
    LogQuestion(localStorage['UserName'],localStorage['UserEMail'],gActiveQuestion,answer,function(){});
    
    //If they give the right answer
    if(gActiveQuestion.correctAnswer == answer)
    {
	//Show them a code
	jqmSimpleMessage('Correct!',function(){
	    gCurrentAction = "Discovered";
	    $.mobile.changePage($('#GameBoard'),{ transition: "slide", changeHash: false });
		
	});
    }else
    {
	//Dont show a code. Go to page one
	jqmSimpleMessage('Wrong!',function(){gCurrentAction = "Failed";
	Progress.push({code:gCurrentId,success:false});	
	localStorage.setItem("Progress",JSON.stringify(Progress));
	$.mobile.changePage($('#one'),{ transition: "fade", changeHash: false });
	});
    }
}
function ProcessAction()
{

	if(gCurrentAction == "Discovered")
    {
	Initialize();
	window.setTimeout(ReadProgress,100);	
	ShowGamePage();
    }
    if(gCurrentAction == "Question")
    {
	gActiveQuestion = GetQuestion(gCurrentId);
	
	$.mobile.changePage($('#questionpage'),{ transition: "fade", changeHash: false });
	return;
    }
}
//Some initial config
$(document).ready(function(){

    jQuery.fx.interval = 100;

    InitLRSConnection();

    var QueryString = parseQueryString();
    gCurrentAction = QueryString["action"];
    gCurrentId = QueryString["id"];

    if(window.location.hash.indexOf('&') > -1)
	window.location.hash = window.location.hash.substr(0,window.location.hash.indexOf('&'));
    if(localStorage['UserName'] == null || localStorage['UserName'] == "" && $.mobile.path.parseUrl(window.location).hash != '#login' )
    {
	jqmDialogOpen('New User Login');
	window.setTimeout(function(){$.mobile.changePage($('#login'),{ transition: "fade", changeHash: false });},500);

	return;
    }
	
	ProcessAction();

});

//*******************************************************************************************
//jQuery Mobile event binding

$(document).bind("mobileinit", function () {

});

$("#login").live("pageinit",function (event) {InitLRSConnection();});
$("#login").live("pageshow",function (event) {jqmDialogClose();});

$('#LeaderBoard').live('pageinit', function (event) {if(LeaderboardPopulated == false) PopulateLeaderBoard();});

$('#GameBoard').live('pagebeforeshow', function (event) {ProcessAction();});
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
    $.mobile.changePage('#SubmitGuess',{ transition: "slide", changeHash: false }); $('#gameboardGuess').addClass('ui-btn-active'); window.setTimeout(function(){$('#gameboardGuess').removeClass('ui-btn-active');},1000);
});	

$('#UserInfo').live('pagebeforeshow',function(){
    $('#currentusername').html(localStorage['UserName']);
    $('#currentuseremail').html(localStorage['UserEMail']);
});   

$('#ManualEntryAnswer').live('pagebeforeshow',function(){

	if(!localStorage['guesses'])
		localStorage['guesses'] = '[]';
	
	var guesses = JSON.parse(localStorage['guesses']);
	
	if(guesses.length >= gGuessMaximum)
	{
		$('#SubmitAnswerOk').addClass('ui-disabled');
		$('#SubmitAnswerOk').data('disabled',true);
		//$('#SubmitAnswerOk').html('Submit Answer');
		jqmSimpleMessage("Sorry, You've already had "+gGuessMaximum+" guesses.",function(){ShowGamePage();});
	}else
	{
		$('#SubmitAnswerOk').removeClass('ui-disabled');
		$('#SubmitAnswerOk').data('disabled',false);
		//$('#SubmitAnswerOk').html('Submit Answer');
	}


});

$('#SubmitAnswerOk').live('vmousedown',function(){

	if($(this).data('disabled') == true)
		return;
	var answer = $('#SolvedPuzzleGuess').val().toLowerCase();
	
	if(!localStorage['guesses'])
		localStorage['guesses'] = '[]';
	
	var guesses = JSON.parse(localStorage['guesses']);
	guesses.push(answer);
	localStorage['guesses'] = JSON.stringify(guesses); 
	
	LogSubmitGuess(answer,answer == gPuzzleAnswer.toLowerCase());
	
	if (answer == gPuzzleAnswer.toLowerCase())
	{
		$.mobile.changePage('#puzzleSolved',{ transition: "fade", changeHash: false });
	}else
	{
		jqmSimpleMessage("Sorry, that's incorrect!",function(){jqmSimpleMessage("You have " + (gGuessMaximum - JSON.parse(localStorage['guesses']).length) +" guesses left!")});
		ShowGamePage();
	}
});

$('#one').live('pagebeforeshow',function(){
	
   
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
    $.mobile.changePage('#GameBoard',{ transition: "slide", changeHash: true });
    gPageLoading = true;		
});	   
$('.footerbuttonLB').live('vmouseup',function(){
    // if(gPageLoading == true) return;
    $('[data-role=navbar] a').removeClass("ui-btn-active"); $('.footerbuttonLB').addClass('ui-btn-active');
    if($.mobile.activePage[0].id == 'GameBoard')
	$.mobile.changePage('#LeaderBoard',{ transition: "slide", changeHash: true });	
    else
	$.mobile.changePage('#LeaderBoard',{ transition: "fade", changeHash: true });
    gPageLoading = true;		
});
$('.footerbuttonME').live('vmouseup',function(){
    // if(gPageLoading == true) return;
    $('[data-role=navbar] a').removeClass("ui-btn-active"); $('.footerbuttonME').addClass('ui-btn-active');
    if($.mobile.activePage[0].id == 'GameBoard')
	$.mobile.changePage('#ManualEntry',{ transition: "slide", changeHash: true });	
    else
	$.mobile.changePage('#ManualEntry',{ transition: "fade", changeHash: true });
    gPageLoading = true;	
});
$('.footerbuttonA').live('vmouseup',function(){
    // if(gPageLoading == true) return;
    $('[data-role=navbar] a').removeClass("ui-btn-active"); $('.footerbuttonA').addClass('ui-btn-active');
    if($.mobile.activePage[0].id == 'GameBoard')
	$.mobile.changePage('#Help',{ transition: "slide", changeHash: true });	
    else
	$.mobile.changePage('#Help',{ transition: "fade", changeHash: true });
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