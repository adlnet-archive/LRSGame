// Connection properties.. used by TCDriver
var props = {
	endpoint:"http://localhost:8000/xapi/",
	auth:"Base64 " + Base64.encode('tom:1234'),
    // endpoint:"http://cloud.scorm.com/ScormEngineInterface/TCAPI/X5423TBH2O/sandbox/",
    // auth:"Basic " + Base64.encode('X5423TBH2O:Bxz4Cm9sp57i4R4ockiLQ4TFGKFlqdyS8v50ZpNG'),
    // actor:{ "mbox":[localStorage["UserName"]], "name":[localStorage["UserEMail"]] }
    // registration:"",
    // activity_id:"NDXS9EO128",
    // grouping:"",
    // activity_platform:""
};