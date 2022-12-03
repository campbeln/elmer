//#
module.exports = function($app /*, $baseRouter */) {
    'use strict';


    //#
    $app.app.data.proxy = [];
    $app.app.data.proxy.disallowed = ["", "login", "proxy", "elmer"];


    //#
    $router.get("/", async (oRequest, oResponse) => {
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


}; //# module.exports
