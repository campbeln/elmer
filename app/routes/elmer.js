//#
module.exports = function($app, $router /*, $baseRouter */) {
    'use strict';


    //#
    $app.app.data.proxy = [];
    $app.app.data.proxy.disallowed = ["", "login", "elmer"];


    //#
    $router.get("/proxy", async (oRequest, oResponse) => {
        let oQuerystring = oRequest.querystring,
            sRouteName = $app.type.str.mk(oQuerystring.route).toLowerCase(),
            oRoute = $app.type.query($app.app.data.proxy, { route: sRouteName }, { firstEntryOnly: true }),
            bSuccess = false
        ;

        //#
        //oQuerystring.ip = ($app.io.net.ip.is(oQuerystring.ip) ? oQuerystring.ip : "0.0.0.0") || "0.0.0.0";

        //#
        if ($app.type.obj.is(oRoute)) {
            //#
            if ($app.type.bool.mk(oQuerystring.force, false) /* oQuerystring.force === oRoute.id */) {
                bSuccess = true;
                oRoute.ip = oQuerystring.ip;
                oRoute.port = oQuerystring.port;
                oRoute.instance++;
                //oRoute.id = $app.type.uuid();
            }
        }
        //#
        else if ($app.app.data.proxy.disallowed.indexOf(sRouteName) === -1) {
            bSuccess = true;
            oRoute = {
                route: sRouteName,
                ip: oQuerystring.ip,
                port: oQuerystring.port,
                instance: 1,
                id: $app.type.uuid()
            };
        }

        //#
        if (bSuccess) {
            //#
            oRoute = $app.extend(oRoute, $app.app.services.web.router.register(oRoute.ip + ":" + oRoute.port, sRouteName, $app.type.bool.mk(oQuerystring.secure, true)));
            console.log(oRoute.ip, ":" + oRoute.port, sRouteName);
        }

        oResponse.status(bSuccess ? $app.io.net.status.success.ok : $app.io.net.status.clientError.conflict).json(oRoute);
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
                //# TODO: neek
                //# Else we are to clear the entire sSubroute
                else {
                    delete $app.cache[sRoute][sSubroute];
                }
            }
        }

        oResponse.status(iStatus).json({
            route: sRoute,
            subroute: sSubroute,
            cleared: (iStatus === 200)
        });
    });


}; //# module.exports
