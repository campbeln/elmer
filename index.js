'use strict';

//##################################################
//# .require the modules
//##################################################
//# .require the Node modules
const $express = require("express");
const $httpServer = $express();
//const $cors = require("cors");
const $cookieParser = require('cookie-parser');
const $bodyParser = require("body-parser");
const $compression = require('compression');

//# .require ishJS + extensions
//#     TODO: NPM-ify ishJS to require("@ish"), require("@ish/io.net"), etc.?
const $app = require("./libs/ish/ish.js");
    require("./libs/ish/ish.type-ex.js")($app);
    require("./libs/ish/ish.type.date-format.js")($app);
    require("./libs/ish/ish.io.net.js")($app);
    require("./libs/ish/ish.io.web.js")($app);
    require("./libs/ish/ish.io.csv.js")($app);
    require("./libs/ish/ish.oop.inherit.js")($app);
    require("./libs/ish/ish.oop.overload.js")($app);
    require("./libs/ish/ish.type.enum.js")($app);


//##################################################
//# Configure the $app
//##################################################
//# Pull in our .config then setup our $app
require("./app/app.js")($app, $express);
$app.app.config = $app.extend(require($app.app.config.args[0] || "./app/config/prod.js"));


//##################################################
//# Configure the $httpServer
//##################################################
//# Support compressed bodies
$httpServer.use($compression({
    filter: (request, response) => {
        return (
            request.headers['x-no-compression'] ?
            false :
            $compression.filter(request, response)
        );
    },
    threshold: 0
}));

//# Support json-encoded bodies
$httpServer.use($bodyParser.json({
    //type: "*/*",
    //inflate: true,
    limit: '50mb'
}));

//# Support url-encoded bodies
$httpServer.use($bodyParser.urlencoded({
    limit: '50mb',
    extended: true
}));

//# Support parsing cookies
$httpServer.use($cookieParser());

//# Log each API request
//$httpServer.use("/", require("./app/middleware/logapi.js")($app));

//# Spin-up the $httpServer, barfing out the versions to the console as we go
$httpServer.listen($app.app.config.port, "127.0.0.1", () => {
    console.log("##############################");
    console.log("# $app on :" + $app.app.config.port);
    console.log(
        "# started @ " +
            $app.type.date.format(Date.now(), "YYYY/MM/DD hh:mm:ss")
    );
    console.log("#");
    console.log("# ishJS v" + $app.config.ish().ver);
    console.log("# $app.app v" + $app.app.version);
    console.log("##############################");
});


//##################################################
//# Configure the routes
//##################################################
require("./app/routes/_routes.js")($app, $httpServer);
