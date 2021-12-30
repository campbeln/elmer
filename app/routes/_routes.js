module.exports = function ($app, $httpServer) {
    'use strict';

    let $router = $app.app.services.router();

    //#
    function registerRoute(sRoute, bSecure) {
        let $router = require("./" + sRoute + ".js")($app);

        //#
        if (bSecure) {
            $httpServer.use("/" + sRoute, require("../middleware/auth.js")($app));
        }
        $httpServer.use("/" + sRoute, $router);
    } //# registerRoute

    //# Setup the root/heartbeat route
    $router.get("/", (oRequest, oResponse) => {
        oResponse.status(200).json({
            message: "Hi 👋",
            time: new Date(),
            localTime: $app.type.date.format(new Date(), "YYYY-MM-DD HH:mm:ss")
        });
    }); //# "/"

    //# .use the various $routers in our $httpServer
    $httpServer.use("/", $router);
    registerRoute("login", false);
    registerRoute("example", true);
    $httpServer.use("/example2", require("./example.js")($app));
};
