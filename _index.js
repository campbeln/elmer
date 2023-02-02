//##################################################
//#
//#           ** DO NOT EDIT THIS FILE **
//#
//##################################################
//# Version: 2023-02-02
'use strict';

//##################################################
//# .require the modules
//##################################################
//# .require the Node modules
const $express = require("express");
const $httpServer = $express();
const $cookieParser = require('cookie-parser');
const $bodyParser = require("body-parser");
const $compression = require('compression');
const $path = require('path');
//const $formidable = require('formidable');

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
require("./app/_app.js")($app, $express, $httpServer);
require("./app/app-ex.js")($app);
$app.app.config = $app.extend(
    require("./app/config/base.json"),
    require("./app/config/" + ($app.app.config.args[0] || "prod") + ".json")
);


//##################################################
//# Configure the $httpServer
//##################################################
//# Support compressed bodies
$httpServer.use($compression({
    filter: (oRequest, oResponse) => {
        return (oRequest.headers['x-no-compression'] ?
            false :
            $compression.filter(oRequest, oResponse)
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

//# Setup the /static route
//# curl -X GET http://localhost:3000/static/ from /app/www
//# See: https://expressjs.com/en/starter/static-files.html
$httpServer.use('/static', $express.static($path.join(__dirname, 'app', 'www')));

//# Log each API request
//$httpServer.use("/", require("./app/middleware/logapi.js")($app));

//# Spin-up the $httpServer, barfing out the versions to the console as we go
//#     NOTE: Cannot bind to 127.0.0.1 as in Docker the server returns with "curl: (52) Empty reply from server"
$httpServer.listen($app.app.config.port, "0.0.0.0", async () => {
    console.log("##############################");
    console.log("# " + $app.app.config.name + " port:" + $app.app.config.port + " (aliased on: " + $app.app.config.portLocal + ")");
    console.log("# started @ " + $app.type.date.format(Date.now(), "YYYY/MM/DD hh:mm:ss"));
    console.log("#");
    console.log("# ishJS v" + $app.config.ish().ver);
    console.log("# $app.app base v" + $app.app.version);
    console.log("# $app.app this v" + $app.app.versionEx);
    console.log("#");
});


//##################################################
//# Configure the routes
//##################################################
require("./app/routes/_routes.js")($app);
(async function () {
    if (!$app.app.config.baseElmer) {
        let oRegister = await $app.app.services.web.register();
        console.log("# Auto-registered? " + $app.type.bool.mk($app.resolve(oRegister, "json.registered"), false));
    }
    console.log("##############################");
})();
