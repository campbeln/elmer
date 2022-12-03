//##################################################
//#
//#            ** BASE VERSION **
//#
//##################################################
//# Version: 2022-10-30
module.exports = function ($app) {
    'use strict';

    let $baseRouter = $app.app.services.web.router();


    //# Setup the root/heartbeat route
    //# curl -X GET http://localhost:3000/
    $baseRouter.get("/", async (oRequest, oResponse) => {
        //let oQuerystring = $app.io.web.queryString.parse(oRequest.url);
        let bRegister = $app.type.bool.mk($app.io.web.queryString.parse(oRequest.url).register, false);

        //# If this is a bRegister call, bRegister
        if (bRegister) {
            let oAPIResponse = await $app.io.net.get(
                "http://" + $app.config.net + "." + $app.config.hostname + ":" + $app.config.port +
                    "/proxy/?route=" + $app.config.name +
                    "&port=" + $app.config.port +
                    "&secure=" + $app.type.bool.mk($app.config.secure, false) +
                    "&force=" + $app.type.bool.mk($app.config.force, true) +
                    "&ip=" + $app.config.name + "." + $app.config.hostname
            );

            oResponse.status(oAPIResponse.ok ? 200 : 500).json({ registered: oAPIResponse.ok, api: oAPIResponse });
        }
        //#
        else {
            oResponse.status(200).json({
                message: "Hi 👋 from " + $app.config.name,
                time: new Date(),
                localTime: $app.type.date.format(new Date(), "YYYY-MM-DD HH:mm:ss")
            });
        }
    }); //# "/"


    //# .register our $baseRouter then .requireDir of all the other /routes, processing each in turn
    $app.app.services.web.router.register($baseRouter, "");
    $app.app.services.fs.requireDir("routes", ["_routes.js"], function (fnRequiredFile, oFS) {
        let $fileRouter = $app.app.services.web.router();

        //# Pass in the above-created $fileRouter along with our $baseRouter to the fnRequiredFile, overriding with any returned value from it then .register it
        $fileRouter = fnRequiredFile($app, $fileRouter, $baseRouter) || $fileRouter;
        //console.log(oFS.url);
        $app.app.services.web.router.register($fileRouter, oFS.url);
    });

    //# Register a route without using $app.app.services.web.router.register
    //$app.app.services.web.router.register("elmer2"); //# <= works the same as the following line:
    //$app.app.services.web.server.use("/elmer2", require("./elmer.js")($app));
};
