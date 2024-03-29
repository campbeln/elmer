//##################################################
//#
//#           ** DO NOT EDIT THIS FILE **
//#
//##################################################
//# Version: 2023-04-08
'use strict';


//# Set the .exports to the Elmer route function definition
module.exports = function($elmer, $router /*, $baseRouter */) {
    //# The passed $router is created for you via a call like the one below. Or you can create your own ExpressJS-based $router as required (just be sure to return it below).
    //$router = $elmer.app.services.web.router();

    //#
    $router.elmer = {
        security: $elmer.app.config.security.basic
    };

    //#
    /*$router.elmer = {
        security: {
            mode: "basic",
            realm: "example",
            usernames: ["user1", "user2"],
            passwords: ["pass1", "pass2"]
        }
    };*/


    //# curl -X GET http://localhost:45000/example-basic/secure --user user1:pass1
    //# curl -X GET http://localhost:45000/example-basic/secure --user user2:pass2
    //# curl -X GET http://localhost:45000/example-basic/secure --user user0:pass0
    $router.get('/secure', async (oRequest, oResponse) => {
        oResponse.status(200).json({ basicAuth: true });
    });


    //# You can return the $router to be used for this file if it differs from either of the passed $router or $baseRouter (as they are updated by reference)
    //return $router;

    //# If you've registered your own $router, then return false so Elmer knows not to register the passed $router
    //return false;
}; //# module.exports
