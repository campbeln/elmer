//#
module.exports = function($app) {
    'use strict';

    let $router = $app.app.services.router();

    //# curl -X GET http://localhost:3000/example/byid/123 -H 'Content-Type: application/json' -H 'Authorization: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImNuIiwicm9sZSI6MCwiaWF0IjoxNjQwODQ3NzAwLCJleHAiOjE2NDA4NTEzMDB9.pGwQnctoytxpozWJPVlibkwCv1YauWhckKY7HFuHpC4'
    //# curl -X GET http://localhost:3000/example/byid/123 -H 'Content-Type: application/json'
    //# curl -X GET http://localhost:3000/example2/byid/123 -H 'Content-Type: application/json'
    $router.get('/byid/:id', async (oRequest, oResponse) => {
        var iID = $app.type.int.mk(oRequest.params.id);
        //var oQuerystring = oRequest.querystring;

        oResponse.status(200).json({ id: iID });
    });

    return $router;
}; //# module.exports
