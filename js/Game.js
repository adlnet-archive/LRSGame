//Some Global variables to hold state
var gCurrentAction = '';    //This is the currently executing action of the system. Holds things like "discovered"
var Game = {};          //A global to namespace all this stuff
var dim = 8;            //the dimentions of the game board
var Progress;           //The array of gCodes already discovered
var Count = 0;          //A global counter used during the progressive reveal of tiles on initialize
var initialized = false;    //Flag for initialized
var tc_lrs = null;      //holds LRS connection data
var gProfiles = null;       //array of profiles from LRS
var gActiveQuestion;        //The currently executing question
var gGuessMaximum = 5;
//These are all the gCodes that will be assigned to tiles on the gameboard
var gCodes = [ "star","home","bike","kale","code","left","base","find","wrap","word","case","file",
                "plan","door","save","hard","knife","latch","gecko","phone"];
               //,"geese","thumb","blink","night","house",
              //"games","duck","math","monitor","jumprope","pixel","shader","normal","genus","gabby","sailboat","dell","plain","ridge","bush","tree","farm","nice","giant","cape","knot","mast","coffee","number","chain"];
//these are the letters under the tiles. '0' means inactive
var gTilestates = "Design0000000000High000000000000Quality000000000Content000000000";
var gCorrectAnswer = ["Design","High","Quality", "Content"];
var gAnswerCount = 0;
var gOrder = [
    8, 
    12,
    1,
    19,
    14,
    2,
    23,
    22,
    16,
    3,
    9,
    18,
    13,
    4,
    20,
    11,
    7,
    6,
    15,
    21,
    10,
    5,
    17,
    0
];
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
    questions.push(new Question("What is the emerging standard for the web's markup language?","HTML5","XML","SOAP","JavaScript 2.0",1,"Question 1"));
    questions.push(new Question("What is the short range wireless technology standard developed in 1994 originally intended to be a replacement for cables?","ESP","Aircard","Firewire","Bluetooth",4,"Question 2"));
    questions.push(new Question("Who is the ADL Community Manager?","Rob Chadwick","Jono Poltrack","Aaron Silvers","Betty White",3,"Question 3"));
    questions.push(new Question("Who is the lead of the ADL Mobile Team?","Jason Haag","Aaron Silvers","Jono Poltrack","Weird Al Yankovich",1,"Question 4"));
    questions.push(new Question("What is the name of Google's mobile operating system?","iOS","Android","Chrome","GoogleHealth++",2,"Question 5"));
    questions.push(new Question("What is the code name for the latest release of Android OS?","Ice Cream Sandwich","Deep Blue","Silver Bullet","Orange Crush",1,"Question 6"));
    questions.push(new Question("What did the letter ‘C’ in SCORM *originally* stand for?","Content","Convergence","Courseware","Cheetos",3,"Question 7"));
    questions.push(new Question("What does the acronym 'LRS' stand for in the Tin Can API?","Linda Ronstadt Song","Learning Repository Site","Learning Registry Service","Learning Record Store",4,"Question 8"));
    questions.push(new Question("What does the long term ADL vision of the 'PAL' stand for?","Personal Assistant for Learning","Private Assessment Language","Public Assistance Library","Programmed ALgorithmic computer",1,"Question 9"));
    questions.push(new Question("What is the name of the ADL-sponsored annual conference to showcase new learning technologies?","iTech","iTunes","iFest","I/ITSEC",3,"Question 10"));
    questions.push(new Question("What is the Twitter handle of the ADL Technical Team? ","@SCORMTroopers","@ADLTT"," @ADLTechTeam","@AdvancedDistributedLearning",3,"Question 11"));
    questions.push(new Question("What is the name of the collaborative software development website used for ADL open source projects?","SourceForge","GitHub","eBay","StackOverflow",2,"Question 12"));
    questions.push(new Question("Before being changed to \"i-Fest\", what was i-Fest called?","Implementation Fest","IceCream Fest","Industry Fest","Information Fest",1,"Question 13"));
    questions.push(new Question("How many vendors prototyped Tin Can API products at mLearnCon this June?","1","3","2","10+",4,"Question 14"));
    questions.push(new Question("How many videos are available for download on the ADL YouTube site?","30","All of YouTube","10","20",1,"Question 15"));
    questions.push(new Question("What is the name of the specification using the <actor><verb><object> construct used in Tin Can API?","Statements","AVO","Activity Streams","Next Generation SCORM",3,"Question 16"));
    questions.push(new Question("Which 'Protocol' uses HTML meta tags to describe web pages for search engines and social media websites? ","Open Graph","SOAP","InfoPath","Tin Can Protocol (TCP)",1,"Question 17"));
    questions.push(new Question("Which former ADL mobile learning guru was just inducted into the the USDLA Hall of Fame?","Nik Hruska","Jose Canseco","Jason Haag","Judy Brown",4,"Question 18"));
    questions.push(new Question("What is the name of Mozilla's effort to assign images for competencies or achievements? ","Open Badges","FF Achievements","Badgzilla","Gold Medal Achievements",1,"Question 19"));
    questions.push(new Question("Who is the ADL Technical Team Lead?","Jason Haag","Kristy Murray","Bill Gates","Jonathan Poltrack",4,"Question 20"));
    
    //Associate questions with gCodes   
    // magic number 20... .watch this for next time
    for (var i=0; i < 20; i++)
    {
        gQuestions[gCodes[i]] = questions[i];
    }
    
    // for random 
    //for(var i = 0; i < gCodes.length; i++)
    //{
    //  gQuestions[gCodes[i]] = questions[Math.floor(Math.random() * questions.length)];
    //}
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
    document.getElementById('gamebase').style.position = 'absolute';
    document.getElementById('gamebase').style.width = '100%';
    document.getElementById('gamebase').style.height = '90%';
    document.getElementById('gamebase').style.top = '0%';
    document.getElementById('gamebase').style.left = '0%';
    document.getElementById('gamebase').style.backgroundImage = 'url(blankTile.png)';
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
    if(!Progress)
    {
        if(!localStorage['Progress'])
            localStorage['Progress'] = '[]';
        Progress = JSON.parse(localStorage['Progress']);
    }

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
    var id = gCurrentId;
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
        //LogAttempt(localStorage["UserEmail"],localStorage["UserName"],id,function(){      
        
        Progress.push({code:id,success:true});  
        localStorage.setItem("Progress",JSON.stringify(Progress));
        
        jqmSimpleMessage('New Tile!', function(){RemoveTile(gOrder[Progress.length-1],500);})
        
        
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
    if(!Progress)
        Progress = JSON.parse(localStorage.getItem("Progress"));

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
    tile.className = 'LetterTile';
    tile.style.width = ((100/count) + 0) + "%";
    tile.style.height = ((100/count)+ 0) + "%";
    tile.style.left = (((100/count) * y)) + "%";
    tile.style.top = (((100/count) * x)) + "%";
    tile.style.margin = "0";
    tile.style.padding = "0";
    tile.style.position = 'absolute';
    tile.style.background = 'url(whiteTile.png)';
    tile.style.backgroundSize = '100% 100%';
    
    tile.style.color = 'black';
    tile.style.textAlign = 'center';
    tile.style.overflow = 'hidden';
    tile.id = ("tilebacking" + x ) + y;
    document.getElementById('gamebase').appendChild(tile);
    $(tile).fitText(.15,{ minFontSize: '20px', maxFontSize: '240px' });
    
    tile.style.fontSize = (window.innerHeight * .005)+"em";;
    //Create the yellow covering tile
    var tilecover = document.createElement('Img');
    tilecover.style.width = ((100/count) + 0) + "%";
    tilecover.style.height = ((100/count)+ 0) + "%";
    tilecover.style.left = (((100/count) * y)) + "%";
    tilecover.style.top = (((100/count) * x)) + "%";
    tilecover.style.margin = "0";
    tilecover.style.padding = "0";
    tilecover.style.position = 'absolute';
    tilecover.src = 'yellowTile.png';
    tilecover.id = ("tile" + x ) + y;
    
    //Only set the letter for the background tile when the covering is in place
    //The prevents a flash that shows the entire message on some phones
    tilecover.onload = function(){
        tile.innerHTML = ""+tilestate+"";
    }
    
    tilecover.OrderNumber = gTileCounter;
    gTileCounter++;
    tilecover.removed = false;
    document.getElementById('gamebase').appendChild(tilecover);
    var that 
    //Debug only function to show tile's code.
    $(tilecover).click(function(event){
        //if(!tilecover.removed)
        //ShowVendorData(tilecover.OrderNumber);
        if(document.getElementById(tilecover.id).removed == false)
            jqmSimpleMessage("Find Codes To Reveal!");
        return null;
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
    props['actor'] = { "mbox":localStorage["UserEmail"], "name":localStorage["UserName"] };
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
    //Use the none transition whenever going to or from the gamepage
    //Some phones fade werid, and show the answer
    $.mobile.changePage($("#GameBoard"),{ transition: "none", changeHash: true });
}
//Switch to the start page
function ShowStartPage()
{
    $.mobile.changePage($("#one"),{ transition: "none", changeHash: true });    
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
    Progress = null;
    gTileCounter =0;
    Count = 0;
    DeInitialize();
    $.mobile.changePage($('#login'),{ transition: 'none', changeHash: false });
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
        if( gProfiles[i].actor.mbox == "mailto:" + gEmailCheck || gProfiles[i].actor.name == gTempUsername)
            profile = gProfiles[i];
        }
        jqmDialogClose();
        
        //If you did not find a profile with the same data, then this is a new one and can proceed
        if( profile == null)
        {
        localStorage["UserEmail"] = gEmailCheck;
        localStorage["UserName"] = gTempUsername;
        //Send the new login data to the LRS
        CreateProfile(localStorage["UserEmail"],localStorage["UserName"],gPassword);

        window.setTimeout(function(){
                
        ShowGamePage();

        },200);
        }else
        {
        //There was a collision with an existing profile, cant create a new one.
        jqmSimpleMessage("Email or Name Taken. Try Again");
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
            if( gProfiles[i].actor.mbox == "mailto:" + gEmailCheck)
            {
                if(gProfiles[i].context.contextActivities.grouping[0].id == "sha:" + SHA1(gPassword))
                    profile = gProfiles[i];
            }
        }
        jqmDialogClose();
        //Store the login data locally if login is successful
        if( profile != null)
        {
            localStorage["UserEmail"] = profile.actor.mbox.substr(7);
            localStorage["UserName"] = profile.actor.name;

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
    // if(!gProfiles)
    TCDriver_GetStatements(tc_lrs,null,ADL.verbs.registered.id,null,ProfilesReceivedSignUp);
    // ProfilesReceivedSignUp();
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
    gTempUsername = $.trim($("#username").val());
    gEmailCheck = $.trim($("#email").val());
    gPassword = $.trim($("#password").val());

    //Check matching passwords 
    if($.trim($("#password").val()) != $.trim($("#password1").val()))
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
    GetProfiles(localStorage["UserEmail"]);
}

//Sign in to an existing account
function DoSignIn()
{
    jqmDialogOpen("Signing In");
    InitLRSConnection();

    gEmailCheck = $.trim($("#email2").val());
    gPassword = $.trim($("#password2").val());

    //Check for valid email 
    if(!validateEmail(gEmailCheck,1,0))
    {
    jqmSimpleMessage("Invaild Email. Try Again", function(){});
    return;
    }

    //Get the profiles, with the correct callback to check for password
   // if(!gProfiles)
    TCDriver_GetStatements(tc_lrs,null,ADL.verbs.registered.id,null,ProfilesReceivedSignIn);
   // ProfilesReceivedSignIn();

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
    $("<div id='popup' style = 'display:table;border-width:2px; border-color:black; border-style:solid;height:70%;top:15%;width:80%;left:10%;text-align:center;vertical-align:center;position:fixed' class='ui-loader ui-overlay-shadow ui-body-c ui-corner-all'><h1 style='display:table-cell;width:100%;vertical-align:middle;margin-top:auto;margin-bottom:auto;line-height:100%'>" + message + "</br><img src='ajax-loader.gif'></h1></img></div>")
    .css({
    display: "table",
    opacity: 0.96
    })
    .appendTo("body");
}
//Open a times popup dialog
function jqmSimpleMessage(message,callback) {
    $('#popup').stop();
    $('#popup').remove();
    $("<div id='popup' style = 'display:table;border-width:2px; border-color:black; border-style:solid;height:70%;top:15%;width:80%;left:10%;text-align:center;vertical-align:center;position:fixed' class='ui-loader ui-overlay-shadow ui-body-c ui-corner-all'><h1 style='display:table-cell;width:100%;vertical-align:middle;margin-top:auto;margin-bottom:auto;line-height:100%'>" + message + "</h1></img></div>")
    .css({
    display: "table",
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
        "type":"act:deftype/Course",
        "name":{"en-US":"answer the puzzle"},
        "description":{"en-US":answer}
        }
    };

    var result = {success:correct,completion : true};
    var stmt = {
        "verb":ADL.verbs.completed, 
        "object":tcCourseObj,
        "actor":{ "mbox":"mailto:" + localStorage["UserEmail"], "name":localStorage["UserName"] },
        "result":result
    };

    TCDriver_SendStatement(tc_lrs, stmt,function(){});

}

//Log to the LRS an attempt to uncover a tile
function LogAttempt(email,name,id,callback)
{
    var tcCourseObj = {
        "id":id,
        "definition":{
        "type":"act:deftype/Course",
        "name":{"en-US":"Find tile number" + id},
        "description":{"en-US":"A simple game example for the Rustici LRS"}
        }
    };
    var contextObj = {
        "contextActivities":{
        "grouping":[{"id":"http://asdf"}]
        }
    };
    var stmt = {
        "verb":ADL.verbs.attempted,
        "object":tcCourseObj,
        "actor":{ "mbox":"mailto:" + email, "name":name },
        "context": contextObj
    };

    TCDriver_SendStatement(tc_lrs, stmt,callback);
}

//Log to the LRS an answered question
function LogQuestion(name,email,Question,answer,callback)
{

    var obj = {
        "id":GetRawURL()+"/"+Question.id,
        "definition":{
        "type":"act:deftype/Question",
        "name":{"en-US":gCurrentId},
        "description":{"en-US":Question.questiontext}
        }
    };

    var result = {success:(answer === Question.correctAnswer),completion : true};
    var stmt = {
        "verb":ADL.verbs.answered,
        "object":obj,
        "actor":{ "mbox":"mailto:" + email, "name":name },
        "result":result
    };

    TCDriver_SendStatement(tc_lrs, stmt,callback);
}
//Create a new profile on the LRS
function CreateProfile(email,name, password,callback)
{

    var tcCourseObj = {
        "id":window.location.href,
        "definition":{
        "type":"act:deftype/Course",
        "name":{"en-US":"LRSGame"},
        "description":{"en-US":"A simple game to demo the LRS"}
        }
    };
    var contextObj = {
        "contextActivities":{
        "grouping":[{"id": "sha:" + SHA1(password)}]
        }
    };
    var stmt = {
        "verb":ADL.verbs.registered,
        "object":tcCourseObj,
        "actor":{ "mbox":"mailto:" + email, "name":name },
        "context": contextObj
    };

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
function PopulateLeaderBoardCallback(r)
{
    if(!r)
    { return;
    }
    
    // jQuery needs to refresh the styles on the control
    $('#lboard').collapsibleset('refresh');
    var counts = [];
    function callback(e){
        var result = JSON.parse(e.responseText);    
        var statements = result.statements;
        for(var i in statements)
        {
            //Group the statements by the name of the actor
            if(statements[i].verb.id == ADL.verbs.answered.id)
            {
                    var found = false;
                    var actorname = statements[i].actor.name;
                    var actoremail = statements[i].actor.mbox;
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
                            counts.push({name:actorname,correct:1,incorrect:0,email:actoremail,correctGuess:0,incorrectGuess:0});
                        else
                        counts.push({name:actorname,correct:0,incorrect:1,email:actoremail,correctGuess:0,incorrectGuess:0});
                    }
            }
        }

        for(var i in statements)
        {
        //Group the statements by the name of the actor
            if(statements[i].verb.id == ADL.verbs.completed)
            {
                    
                    var actorname = statements[i].actor.name;
                    var actoremail = statements[i].actor.mbox;
                    for(var j in counts)
                    {
                        if(counts[j].name && counts[j].name == actorname)
                        {
                        if(statements[i].result.success === true)
                            counts[j].correctGuess += 1;
                        else
                            counts[j].incorrectGuess += 1;
                        found = true;
                        }
                    }
                    
            }
        }
        if (!result.more){
            //Counts now contains a list of pairs of names and scores;
            //Sort the highest score to the top
            LeaderboardPopulated = true;
            counts.sort(compare);
            document.getElementById('lboard').innerHTML = "";
            //For the top 20 names, print them into the leaderboard div
            for(var j =0; j < Math.min(20,counts.length);j++)
            {
            //var li = "<li><a onclick=\"PopulateScorePage('"+counts[j].name+"','"+counts[j].email+ "','"+(counts[j].correct + counts[j].incorrect) +"')\" href='#UserScore'>"+counts[j].name+"</a><span class='ui-li-count'><div style='color:green;display:inline'>"+counts[j].correct +"</div>/<div style='color:red;display:inline'>"+ counts[j].incorrect+"</div></span></li>"
            var li = "<div data-role='collapsible' data-content-theme='c'><h3>" + counts[j].name + "<span class='ui-li-count' style='float:right;border-width:1px;box-shadow:1px 1px 2px #A0A0A0 inset;border-color:#e0e0e0;border-style:solid;border-radius:10px;padding:0px 10px'><div style='color:green;display:inline'>"+counts[j].correct +"</div>/<div style='color:red;display:inline'>"+ counts[j].incorrect+"</div></span>"+GetCheckHTML(counts[j])+"</h3><p>"+BuildInnerScoreHtml(counts[j])+"</p></div>";
            document.getElementById('lboard').innerHTML += li;
            }
            $('#lboard').collapsibleset('refresh');
            jqmDialogClose();
        }else{
            // var moreQueryString = URI(result.more).query(true);
            // should come in as a relative path (not including scheme host or port)
            TCDriver_GetStatementsResume(tc_lrs,result.more.continueToken,callback);
        }
    }
    callback(r);
}
function GetCheckHTML(data)
{
    var check = "<img src='check_icon.png' style='display:inline;float:right' data-role='button' data-icon='refresh'></img>";
    if(data.correctGuess > 0)
        return check;
    return "";
}
function BuildInnerScoreHtml(data)
{
    var hml = "<span style='width:30%;display:inline-block;'>Name:</span><div style='display:inline;width:70%;font-weight:bold'>"+data.name+"</div><br/>";
    var hml2 = "<span style='width:30%;display:inline-block;'>EMail:</span><div style='display:inline;width:70%;font-weight:bold'>"+data.email.substr(7)+"</div><br/>";
    var hml3 = "<span style='width:30%;display:inline-block;'>Correct Answers:</span><div style='display:inline;width:70%;font-weight:bold'>"+data.correct+"</div><br/>";
    var hml5 = "<span style='width:30%;display:inline-block;'>Solve Attempts:</span><div style='display:inline;width:70%;font-weight:bold'>"+(data.incorrectGuess+data.correctGuess)+"</div><br/>";
    var hml4 = "<span style='width:30%;display:inline-block'>Incorrect Answers:</span><div style='display:inline;width:70%;font-weight:bold'>"+data.incorrect+"</div><br/>";
    
    var solved = "<div style='font-weight:bold'>" + data.name + " has solved the puzzle correctly!</div>";
    if(data.correctGuess == 0)
        solved = "";
    return "<div style='font-size:.75em'> "+hml + hml2+ hml3+ hml4 +hml5 + solved+"</div>";
}
//Read the scores from the LRS to get the progress for someone logging in on a new device
function LoadGuessesFromLRSCallback(r)
{
        if(!r)
    { return;
    }   
    var guesses = [];
    function callback(e){
        var result = JSON.parse(e.responseText);    
    var statements = result.statements;
        for(var i in statements)
        {
        var found = false;
        var actorname = statements[i].actor.name;
        var actoremail = statements[i].actor.mbox;
        
        
        //If the statement actor is the logged in actor, push the ID of the tile onto the 
        //global progress list
        if(actoremail == "mailto:" + localStorage['UserEmail'])
        {
            guesses.push(statements[i].object.definition.description['en-US']);
        }
    }

    if (!result.more){
        //Save this data in localstoragte for next time
        
    localStorage['guesses'] = JSON.stringify(guesses);
    
    jqmDialogClose();
    
        ShowGamePage();
    }
    else{
            var moreQueryString = URI(result.more).query(true);
            TCDriver_GetStatementsResume(tc_lrs,moreQueryString.continueToken,callback);
    }
    }//callback e  
    callback(r);
}

//Read the scores from the LRS to get the progress for someone logging in on a new device
function LoadProgressFromLRSCallback(r)
{
    if(!r)
    { return;
    }
    var progress=[];
    function callback(e){
        var result = JSON.parse(e.responseText);    
    var statements = result.statements;
        for(var i in statements)
        {
        var found = false;
        var actorname = statements[i].actor.name;
        var actoremail = statements[i].actor.mbox;
    
        //If the statement actor is the logged in actor, push the ID of the tile onto the 
        //global progress list
        if(actoremail == "mailto:" + localStorage['UserEmail'])
        {
          progress.push({code:statements[i].object.definition.name['en-US'],success:statements[i].result.success});
        }
        }
        if (!result.more){
        //Save this data in localstoragte for next time
            Progress = progress;
            localStorage['Progress'] = JSON.stringify(Progress);
    
        jqmDialogClose();
        
        jqmDialogOpen("Loading Puzzle Guesses");
        TCDriver_GetStatements(tc_lrs,null,ADL.verbs.completed.id,null,LoadGuessesFromLRSCallback);
        }
    else{
            var moreQueryString = URI(result.more).query(true);
            TCDriver_GetStatementsResume(tc_lrs,moreQueryString.continueToken,callback);
    }
    }//callback e  
    callback(r);
}
//Load the progress from the LRS.
function LoadProgressFromLRS()
{
    try{
    InitLRSConnection();
    jqmDialogOpen("Loading progress");
    TCDriver_GetStatements(tc_lrs,null,ADL.verbs.answered.id,null,LoadProgressFromLRSCallback);
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
    TCDriver_GetStatements(tc_lrs,null,null,null,PopulateLeaderBoardCallback);
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
    var code = $.trim($('#manualcode').val().toLowerCase());
    Initialize();
    
    //Check code is valid
    if(IsValidCode(code))
    {
        $('#manualcode').val('');
    //Check code is new
    if(IsNewCode(code) == true)
    {
        gCurrentAction = 'Question';
        gCurrentId = code;
        $.mobile.changePage($('#questionpage'),{ transition: 'none', changeHash: false });

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
function PollForEventsCallback(r)
{
    if(!r)
    { return;
    }
    var events = [];
    function callback(e){
        var result = JSON.parse(e.responseText);    
    var statements = result.statements;

        //Add each event to the list view
        for(var i =0; i<statements.length; i++)
        {
            var listcode = $('#EventList').html();
            var newline = "<li>"+ statements[i].actor.name + " " +  statements[i].verb.display['en-US'] + " " + statements[i].object.definition.name['en-US'] +"</li>";
            $('#EventList').html(newline + listcode);
        }
            if (!result.more){
        $('#EventList').listview('refresh');
            }
                else{
            var moreQueryString = URI(result.more).query(true);
            TCDriver_GetStatementsResume(tc_lrs,moreQueryString.continueToken,callback);
        }
    
    }//callback e
window.setTimeout(PollForEvents,5000);

callback(r);
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


    TCDriver_GetStatements(tc_lrs,null,null,null,PollForEventsCallback);
}

// A user is answering a question
function AnswerQuestion(answer)
{
    //Send the results to the LRS
    LogQuestion(localStorage['UserName'],localStorage['UserEmail'],gActiveQuestion,answer,function(){});
    
    //If they give the right answer
    if(gActiveQuestion.correctAnswer == answer)
    {
    //Show them a code
    jqmSimpleMessage('Correct!',function(){
        gCurrentAction = "Discovered";
        $.mobile.changePage($('#GameBoard'),{ transition: "none", changeHash: false });
        
    });
    }else
    {
        if(gAnswerCount == 0)
        {
        
            gAnswerCount++;
            jqmSimpleMessage('Incorrct! Try again!',function(){});
            
        }
        else if(gAnswerCount == 1)
        {
            //Dont show a code. Go to page one
            jqmSimpleMessage('Wrong!',function(){gCurrentAction = "Failed";
            Progress.push({code:gCurrentId,success:false}); 
            localStorage.setItem("Progress",JSON.stringify(Progress));
            $.mobile.changePage($('#GameBoard'),{ transition: 'none', changeHash: false });
            });
        }
    }
}
function ProcessAction()
{
    Initialize();
    
    if(gCurrentAction == "Discovered")
    {
    
    window.setTimeout(ReadProgress,100);    
    ShowGamePage();
    
    }
    if(gCurrentAction == "Question")
    {
    if(IsNewCode(gCurrentId) && IsValidCode(gCurrentId))
    {
        gActiveQuestion = GetQuestion(gCurrentId);
        $.mobile.changePage($('#questionpage'),{ transition: 'none', changeHash: false });
    }else
    {
        
        if(IsValidCode(gCurrentId))
            jqmSimpleMessage("You've already scanned this code");
        else
            jqmSimpleMessage("Invalid code!");
        gCurrentId = '';
        gCurrentAction ='';
        ShowGamePage();
    }
    return;
    }
}
//Some initial config
$(document).ready(function(){

    jQuery.fx.interval = 100;
    window.scrollTo(0,1);
    InitLRSConnection();

    var QueryString = parseQueryString();
    gCurrentAction = QueryString["action"];
    gCurrentId = QueryString["id"];

    if(window.location.hash.indexOf('&') > -1)
    window.location.hash = window.location.hash.substr(0,window.location.hash.indexOf('&'));
    if(localStorage['UserName'] == null || localStorage['UserName'] == "" && $.mobile.path.parseUrl(window.location).hash != '#login' )
    {
    jqmDialogOpen('New User Login');
    window.setTimeout(function(){$.mobile.changePage($('#login'),{ transition: 'none', changeHash: false });},500);

    return;
    }
    
    ProcessAction();

});

//*******************************************************************************************
//jQuery Mobile event binding



$("#login").live("pageinit",function (event) {InitLRSConnection();});
$("#login").live("pageshow",function (event) {jqmDialogClose();});

$('#LeaderBoard').live('pageinit', function (event) {if(LeaderboardPopulated == false) PopulateLeaderBoard();});
$('#LeaderBoard').live('pageshow', function (event) {window.scrollTo(0,1);$('[data-role=navbar] a').removeClass("ui-btn-active"); $('.footerbuttonLB').addClass('ui-btn-active');});

$('#Help').live('pageshow', function (event) {window.scrollTo(0,1);$('[data-role=navbar] a').removeClass("ui-btn-active"); $('.footerbuttonA').addClass('ui-btn-active');});
$('#ManualEntry').live('pageshow', function (event) {window.scrollTo(0,1);$('[data-role=navbar] a').removeClass("ui-btn-active"); $('.footerbuttonME').addClass('ui-btn-active');});

$('#GameBoard').live('pagebeforeshow', function (event) {ProcessAction();});
$('#GameBoard').live('pageshow', function (event) {window.scrollTo(0,1);Initialize();ReadProgress();$('[data-role=navbar] a').removeClass("ui-btn-active"); $('.footerbuttonGB').addClass('ui-btn-active');});       

$('#togameboard').live('vmousedown',function(){
    $('#togameboard').addClass('ui-btn-active'); window.setTimeout(function(){$('#togameboard').removeClass('ui-btn-active');},1000); ShowGamePage();
});

$('#refresh').live('vmousedown',function(){
    $('#refresh').addClass('ui-btn-active'); window.setTimeout(function(){$('#refresh').removeClass('ui-btn-active');PopulateLeaderBoard();},300); 
});

$('#ManualEntryOk').live('vmousedown',function(){
    $('#ManualEntryOk').addClass('ui-btn-active'); 
});
$('#ManualEntryOk').live('vclick',function(){
    window.setTimeout(function(){$('#ManualEntryOk').removeClass('ui-btn-active');DoManualEntry();},700); 
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
    $.mobile.changePage('#SubmitGuess',{ transition: "none", changeHash: false }); $('#gameboardGuess').addClass('ui-btn-active'); window.setTimeout(function(){$('#gameboardGuess').removeClass('ui-btn-active');},1000);
}); 

$('#UserInfo').live('pagebeforeshow',function(){
    
    var cg,icg,cq,icq;
    cg = icg = cq = icq = 0;
    if(!localStorage['guesses'])
        localStorage['guesses'] = '[]';
    
    var guesses = JSON.parse(localStorage['guesses']);
    for(var i=0; i< guesses.length;i++)
    {
        if(CheckGuess(guesses[i]))
            cg++;
        else
           icg++;   
    }
    
    if(!Progress)
    {
        if(!localStorage.getItem("Progress"))
        localStorage.setItem("Progress",JSON.stringify([]));
        //Load global Progress array
        Progress = JSON.parse(localStorage.getItem("Progress"));
    }
    
    for(var i=0; i< Progress.length;i++)
    {
        if(Progress[i].success == true)
            cq++;
        else
           icq++;   
    }
    
    var data = BuildInnerScoreHtml({name:localStorage['UserName'],email:("mailto:"+localStorage['UserEmail']),correct:cq,incorrect:icq,correctGuess:cg,incorrectGuess:icg});
    if(cg > 0 && icg > 5)
    data += "<br/><div style='display:inline;width:70%;font-weight:bold;font-size:.8em'>While you did solve the puzzle, you required more than the alloted number of attempts, so you won't be entered to win a prize.</div><br/>";
    $('#currentusername').html(data);
    //$('#currentUserEmail').html(localStorage['UserEmail']);
    window.scrollTo(0,1);
});   


function CheckGuess(guess_string)
{
    var guess_array = guess_string.split(' ');
    var temp_array = [];
    for(var i =0; i<guess_array.length; i++)
    {
        if(guess_array[i] != '')
            temp_array.push(guess_array[i]);
    }
    guess_array = temp_array;
    if(guess_array.length != gCorrectAnswer.length)
        return false;
    for(var i =0; i<guess_array.length; i++)
    {
        if($.trim(guess_array[i].toLowerCase()) != $.trim(gCorrectAnswer[i].toLowerCase()))
            return false;
    }
    return true;
}
function HasRightAnswer()
{
    if(!localStorage['guesses'])
        localStorage['guesses'] = '[]';
    
    var guesses = JSON.parse(localStorage['guesses']);
    for(var i=0; i< guesses.length; i++)
    {
        if(CheckGuess(guesses[i]))
            return true;
    }
    return false;
}

$('#ManualEntryAnswer').live('pagebeforeshow',function(){

    window.scrollTo(0,1);
    $('[data-role=navbar] a').removeClass("ui-btn-active"); 
    if(!localStorage['guesses'])
        localStorage['guesses'] = '[]';
    
    var guesses = JSON.parse(localStorage['guesses']);
    
    if(HasRightAnswer())
    {
        $('#SubmitAnswerOk').addClass('ui-disabled');
        $('#SubmitAnswerOk').data('disabled',true);
        //$('#SubmitAnswerOk').html('Submit Answer');
        jqmSimpleMessage("You've already solved the puzzle correctly!",function(){});
        $('#AnswerScreenText').html("You've already solved the puzzle correctly! There is no need to submit an answer again. Please note that only your first "+gGuessMaximum+" guesses are recorded in the official record.");
    }
    else if(guesses.length >= gGuessMaximum)
    {
        //$('#SubmitAnswerOk').addClass('ui-disabled');
        //$('#SubmitAnswerOk').data('disabled',true);
        //$('#SubmitAnswerOk').html('Submit Answer');
        jqmSimpleMessage("Sorry, You've already had "+gGuessMaximum+" guesses.",function(){});
        $('#AnswerScreenText').html("Unfortunatly, you've already made the maximum number of guesses on the puzzle. You may continuing trying to guess the answer, but your guess will not be recorded, and you will not be entered to win a prize.");
    }else
    {
        $('#SubmitAnswerOk').removeClass('ui-disabled');
        $('#SubmitAnswerOk').data('disabled',false);
        //$('#SubmitAnswerOk').html('Submit Answer');
        $('#AnswerScreenText').html("Please enter the answer phrase below. You may guess the answer up to "+gGuessMaximum+" times. So far, you've made "+guesses.length+" guesses.");
    }


});

$('#SubmitAnswerOk').live('vmouseup',function(){

    if($(this).data('disabled') == true)
        return;
    var answer = $.trim($('#SolvedPuzzleGuess').val().toLowerCase());
    
    
    $('#SolvedPuzzleGuess').val('');
    
    if(!localStorage['guesses'])
        localStorage['guesses'] = '[]';
    
    var guesses = JSON.parse(localStorage['guesses']);
    guesses.push(answer);
    localStorage['guesses'] = JSON.stringify(guesses); 
    
    if(guesses.length <= gGuessMaximum)
    LogSubmitGuess(answer,CheckGuess(answer));
    
    if (CheckGuess(answer))
    {
        $.mobile.changePage('#puzzleSolved',{ transition: 'none', changeHash: false });
    }else
    {
        if(JSON.parse(localStorage['guesses']).length < gGuessMaximum)
            jqmSimpleMessage("Sorry, that's incorrect!",function(){jqmSimpleMessage("You have " + (gGuessMaximum - JSON.parse(localStorage['guesses']).length) +" guesses left!")});
        else
            jqmSimpleMessage("Sorry, that's incorrect!");
            
        ShowGamePage();
    }
});

$('#one').live('pagebeforeshow',function(){
    window.scrollTo(0,1);
   $('[data-role=navbar] a').removeClass("ui-btn-active"); 
});     
$('#questionpage').live('pagebeforeshow',function(){

    gActiveQuestion = GetQuestion(gCurrentId);
    gAnswerCount = 0;
    window.scrollTo(0,1);
    $('#answer1').html("<br/>"+gActiveQuestion.answer1+"<br/><br/>");
    $('#answer2').html("<br/>"+gActiveQuestion.answer2+"<br/><br/>");
    $('#answer3').html("<br/>"+gActiveQuestion.answer3+"<br/><br/>");
    $('#answer4').html("<br/>"+gActiveQuestion.answer4+"<br/><br/>");
    $('#questiontext').html(gActiveQuestion.questiontext);
});

function ClearAnswerButtons()
{
    $('#answer1').removeClass('ui-btn-active');
    $('#answer2').removeClass('ui-btn-active');
    $('#answer3').removeClass('ui-btn-active');
    $('#answer4').removeClass('ui-btn-active');
}

$('#answer1').live('vmousedown',function(){
    ClearAnswerButtons();$('#answer1').addClass('ui-btn-active');
}); 
$('#answer2').live('vmousedown',function(){
    ClearAnswerButtons();$('#answer2').addClass('ui-btn-active');
}); 
$('#answer3').live('vmousedown',function(){
    ClearAnswerButtons();$('#answer3').addClass('ui-btn-active');
}); 
$('#answer4').live('vmousedown',function(){
   ClearAnswerButtons();$('#answer4').addClass('ui-btn-active');
}); 

$('#answer1').live('vclick',function(){
    $('#answer1').removeClass('ui-btn-active');
    AnswerQuestion(1);
}); 
$('#answer2').live('vclick',function(){
    $('#answer2').removeClass('ui-btn-active');
    AnswerQuestion(2);
}); 
$('#answer3').live('vclick',function(){
    $('#answer3').removeClass('ui-btn-active');
    AnswerQuestion(3);
}); 
$('#answer4').live('vclick',function(){
    $('#answer4').removeClass('ui-btn-active');
    AnswerQuestion(4);
}); 
$('#signinok').live('vclick',function(){
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
    $.mobile.changePage('#GameBoard',{ transition: "none", changeHash: true });
    gPageLoading = true;        
});    
$('.footerbuttonLB').live('vmouseup',function(){
    // if(gPageLoading == true) return;
    $('[data-role=navbar] a').removeClass("ui-btn-active"); $('.footerbuttonLB').addClass('ui-btn-active');
    if($.mobile.activePage[0].id == 'GameBoard')
    $.mobile.changePage('#LeaderBoard',{ transition: "none", changeHash: true });   
    else
    $.mobile.changePage('#LeaderBoard',{ transition: 'none', changeHash: true });
    gPageLoading = true;        
});
$('.footerbuttonME').live('vmouseup',function(){
    // if(gPageLoading == true) return;
    $('[data-role=navbar] a').removeClass("ui-btn-active"); $('.footerbuttonME').addClass('ui-btn-active');
    if($.mobile.activePage[0].id == 'GameBoard')
    $.mobile.changePage('#ManualEntry',{ transition: "none", changeHash: true });   
    else
    $.mobile.changePage('#ManualEntry',{ transition: 'none', changeHash: true });
    gPageLoading = true;    
});
$('.footerbuttonA').live('vmouseup',function(){
    // if(gPageLoading == true) return;
    $('[data-role=navbar] a').removeClass("ui-btn-active"); $('.footerbuttonA').addClass('ui-btn-active');
    if($.mobile.activePage[0].id == 'GameBoard')
    $.mobile.changePage('#Help',{ transition: "none", changeHash: true });  
    else
    $.mobile.changePage('#Help',{ transition: 'none', changeHash: true });
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