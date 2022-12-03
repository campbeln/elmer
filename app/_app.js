//##################################################
//#
//#            ** BASE VERSION **
//#
//##################################################
//# Version: 2022-12-03
'use strict';

//const $formidable = require('formidable');        //# multipartForm support
//const $url = require('url');
const $fs = require('fs');
//const $fetch = require('node-fetch-commonjs');
const $ip = require('ip');


module.exports = async function ($app, $express, $httpServer) {
    $app.app = {
        version: "0.2.2022-12-03",

        data: {},
        config: {
            //# Remove `node index.js` from process.argv (NOTE: ignores any flags sent to `node`)
            args: process.argv.slice(2)
        },

        services: { //# collection of external services
            web: {
                //url: $url,
                /*multipartForm: function (oRequest, fnPerFile) {
                    let $form = new $formidable.IncommingForm(),
                        iMB = (1024 * 1024)
                    ;

                    //$form.maxFileSize = 200 * iMB;
                    $form.multiples = true;

                    $form.parse(oReuest);

                    $form.on('fileBegin', function (name, file){
                        file.path = __dirname + '/_uploads/' + file.name;
                    });

                    $form.on('file', function (name, file){
                        console.log('Uploaded ' + file.name);
                    });

                    //oRequest.sendFile(__dirname + '/index.html');  //return new $formidable.IncomingForm();
                },*/
                express: $express,
                server: $httpServer,
                ip: $ip,
                register: async function () {
                    //# curl -X GET http://localhost:$portLocal/
                    return await $app.io.net.get("http://" + $app.app.config.name + "." + $app.app.config.hostname + ":" + $app.app.config.port + "/?register=true");
                }
            }, //# $app.app.services.web

            router: (function() {
                let a_oRegisteredRoutes = [];

                return $app.extend(
                    function() {
                        return $express.Router();
                    }, //# services.web.router
                    {
                        register: function($router, sRoute /*, bSecure*/) {
                            let oRoute,
                                bRouteExists = false
                            ;

                            //#
                            //bSecure = $app.type.bool.mk(bSecure, false);

                            //#
                            if ($app.type.str.is(sRoute)) {
                                oRoute = $app.type.query(a_oRegisteredRoutes, { route: sRoute }, { firstEntryOnly: true, caseInsensitive: true });
                                bRouteExists = $app.type.obj.is(oRoute, true);

                                //#
                                if (!bRouteExists) {
                                    //#
                                    /*if (bSecure) {
                                        $httpServer.use("/" + sRoute, require(__dirname + "/app/middleware/auth.js")($app));
                                    }*/
                                    $httpServer.use("/" + sRoute, $router);

                                    //#
                                    oRoute = {
                                        route: sRoute,
                                        //secure: bSecure,
                                        router: $router
                                    };
                                    a_oRegisteredRoutes.push(oRoute);
                                }
                            }

                            return app.extend({
                                created: !bRouteExists
                            }, oRoute);
                        }, //# router.register

                        registered: function(sRoute /*, bSecure*/) {
                            let oRoute,
                                bRouteExists = false
                            ;

                            //#
                            if ($app.type.str.is(sRoute)) {
                                oRoute = $app.type.query(a_oRegisteredRoutes, { route: sRoute }, { firstEntryOnly: true, caseInsensitive: true });
                                bRouteExists = $app.type.obj.is(oRoute, true);
                            }

                            return (bRouteExists && arguments.length === 1); //# (arguments.length === 1 || $app.type.bool.mk(bSecure, false) === oRoute.secure));
                        } //# router.registered
                    }
                );
            }()),

            fs: {
                fs: $fs,
                baseDir: __dirname + "/../",

                //#
                requireDir: function(sDir, a_sExcludeFiles, fnCallback) {
                    let requireDirRecurse = function (sPath, sDirectory) {
                        $app.app.services.fs.fs.readdirSync(sPath).forEach(function(sFile) {
                            let oFS = {
                                file: sFile,
                                dir: sPath + "/",
                                path: sPath + "/" + sFile,
                                url: sDirectory.replace(/^\/routes/i, "") + $app.type.str.mk(sFile).replace(/\.js$/i, "")
                            };

                            //#
                            if ($app.app.services.fs.fs.lstatSync(oFS.path).isDirectory()) {
                                requireDirRecurse(oFS.path, sFile + "/");
                            }
                            //#
                            else if ($app.type.str.is(sFile, true) && a_sExcludeFiles.indexOf(sFile) === -1) {
                                fnCallback(require(oFS.path), oFS);
                            }
                        });
                    }; //# requireDirRecurse

                    //#
                    sDir = $app.type.str.mk(sDir);
                    sDir = (sDir[0] !== "/" ? "/" : "") + sDir;
                    a_sExcludeFiles = $app.type.arr.mk(a_sExcludeFiles);
                    fnCallback = $app.type.fn.mk(fnCallback, function (fnRequiredFile /*, oFS*/) {
                        fnRequiredFile($app);
                    });

                    //# Kick off the recursive process
                    requireDirRecurse(__dirname + sDir, sDir);
                } //# $app.app.services.fs.requireDir
            } //# $app.app.services.fs

        }, //# $app.app.services

        log: {
            api: function (oData, oRequest) {
                //# oData = { status, json, error }
            }
        }, //# $app.app.log

        error: {
            response: function (oResponse, vErrorMessage, iHTTPCode) {
                let sErrorMessage = ($app.type.obj.is(vErrorMessage) ? vErrorMessage.message : vErrorMessage),
                    oDetails = $app.resolve(vErrorMessage, "details")
                ;

                oResponse
                    .status($app.type.int.mk(iHTTPCode, 500))
                    .json({
                        success: false,
                        error: sErrorMessage || "An unknown error occurred.",
                        details: oDetails
                    })
                ;
            }
        } //# $app.app.error
    };
};
