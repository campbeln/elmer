//#
module.exports = function($app, $router /*, $baseRouter */) {
    'use strict';

    //$router = $app.app.services.web.router();


    //# curl -X GET http://localhost:3000/elmer/byid/123 -H 'Content-Type: application/json' -H 'Authorization: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImNuIiwicm9sZSI6MCwiaWF0IjoxNjQwODQ3NzAwLCJleHAiOjE2NDA4NTEzMDB9.pGwQnctoytxpozWJPVlibkwCv1YauWhckKY7HFuHpC4'
    //# curl -X GET http://localhost:3000/elmer/byid/letters -H 'Content-Type: application/json' -H 'Authorization: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImNuIiwicm9sZSI6MCwiaWF0IjoxNjQwODQ3NzAwLCJleHAiOjE2NDA4NTEzMDB9.pGwQnctoytxpozWJPVlibkwCv1YauWhckKY7HFuHpC4'
    //# curl -X GET http://localhost:3000/elmer/byid/123 -H 'Content-Type: application/json'
    //# curl -X GET http://localhost:3000/elmer2/byid/123 -H 'Content-Type: application/json'
    //# curl -X GET http://localhost:3000/elmer2/byid/123 -H 'Content-Type: application/json'
    $router.get('/byid/:id', async (oRequest, oResponse) => {
        var iID = $app.type.int.mk(oRequest.params.id);
        //const $fetch = require('node-fetch-common.js');

        oResponse.status(200).json({ id: iID, boilerplate: true });
    });


    //#
    $router.get('/cache/:route', async (oRequest, oResponse) => {
        let sRoute = oRequest.params.route,
            iStatus = ($app.type.obj.is($app.resolve($app, ["cache", sRoute])) ? 200 : 404)
        ;

        oResponse.status(iStatus).json({
            route: sRoute,
            data: $app.cache[sRoute]
        });
    });


    //#
    $router.get('/cache/:route/:subroute', async (oRequest, oResponse) => {
        let sRoute = oRequest.params.route,
            sSubroute = oRequest.params.subroute,
            iStatus = ($app.type.obj.is($app.resolve($app, ["cache", sRoute, sSubroute])) ? 200 : 404)
        ;

        oResponse.status(iStatus).json({
            route: sRoute,
            subroute: sSubroute,
            data: $app.cache[sRoute][sSubroute]
        });
    });


    //#
    $router.get('/cache/:route/:subroute/:last', async (oRequest, oResponse) => {
        let i,
            a_oData = [],
            sRoute = oRequest.params.route,
            sSubroute = oRequest.params.subroute,
            iLast = $app.type.int.mk(oRequest.params.last, 1),
            a_oSubroute = $app.resolve($app, ["cache", sRoute, sSubroute]),
            iStatus = ($app.type.obj.is($app.resolve($app, ["cache", sRoute, sSubroute])) ? 200 : 404)
        ;

        //#
        if (iStatus === 200) {
            for (i = a_oSubroute.length - iLast; i < a_oSubroute.length; i++) {
                a_oData.push(a_oSubroute[i]);
            }
        }

        oResponse.status(iStatus).json({
            route: sRoute,
            subroute: sSubroute,
            data: a_oData
        });
    });


    //#
    $router.get('/cache/clear/:route', async (oRequest, oResponse) => {
        let sRoute = oRequest.params.route,
            iStatus = ($app.type.obj.is($app.resolve($app, ["cache", sRoute])) ? 200 : 404)
        ;

        //#
        delete $app.cache[sRoute];

        oResponse.status(iStatus).json({
            route: sRoute,
            cleared: (iStatus === 200)
        });
    });


    //#
    $router.get('/cache/clear/:route/:subroute', async (oRequest, oResponse) => {
        let i, dCurrentWhen,
            sRoute = oRequest.params.route,
            sSubroute = oRequest.params.subroute,
            dBefore = $app.type.date.mk(oRequest.querystring.before, null),
            a_oSubroute = $app.resolve($app, ["cache", sRoute, sSubroute]),
            iStatus = ($app.type.arr.is(a_oSubroute) ? 200 : 404)
        ;

        //# If we found our sRoute/sSubroute
        if (iStatus === 200) {
            //# If the caller passed in a dBefore cutoff date on the .querystring, traverse our a_oSubroute while .resolve'ing the dCurrentWhen as we go
            for (i = 0; i < a_oSubroute.length; i++) {
                dCurrentWhen = $app.type.date.mk($app.resolve(a_oSubroute[i], "when"), null);

                //# If the dCurrentWhen is dBefore our cutoff date, .splice it out of our a_oSubroute
                if (dCurrentWhen && $app.type.date.cmp(dCurrentWhen, dBefore) < 0) {
                    a_oSubroute.splice(i, 1);
                }
            }
            //# Else we are to clear the entire sSubroute
            else {
                delete $app.cache[sRoute][sSubroute];
            }
        }

        oResponse.status(iStatus).json({
            route: sRoute,
            subroute: sSubroute,
            cleared: (iStatus === 200)
        });
    });



    //#
    //return $router;
}; //# module.exports
