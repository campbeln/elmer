module.exports = function ($app) {
    'use strict';

    let $router = $app.app.services.router();


    //# Setup the root/heartbeat route
    $router.get("/", (oRequest, oResponse) => {
        oResponse.status(200).json({
            message: "Hi 👋",
            time: new Date(),
            localTime: $app.type.date.format(new Date(), "YYYY-MM-DD HH:mm:ss")
        });
    }); //# "/"


    //#
    $app.app.services.web.router.register($router, "", false);
    $app.app.services.fs.requireDir("routes", ["_router.js"]);

    //#
    $app.app.services.web.server.use("/example2", require("./example.js")($app));
};
