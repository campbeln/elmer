'use strict';

//const $formidable = require('formidable');
//const $url = require('url');
const $fs = require('fs');
const { app } = require('../libs/ish/ish');

module.exports = function ($app, $express, $httpServer) {
    $app.app = {
        version: "0.2.2022-01-14",

        data: {},
        enums: {
            userTypes: {
                admin: 0,
                internal: 1,
                external: 2
            }
        },
        config: {
            //# Remove `node index.js` from process.argv (NOTE: ignores any flags sent to `node`)
            args: process.argv.slice(2)
        },

        services: { //# collection of external services
            web: {
                //url: $url,
                /*multipartForm: function () {
                    return new $formidable.IncomingForm();
                },*/
                express: $express,
                server: $httpServer,
                router: (function(){
                    let a_oRegisteredRoutes = [];

                    return $app.extend(
                        function() {
                            let $returnVal = $express.Router();

                            //# Configure our .router to use CORS
                            $returnVal.use((oRequest, oResponse, fnContinue) => {
                                let sOrigin = oRequest.headers.origin;

                                //# If the oRequest is from a .corsWhitelist sOrigin we trust, set the CORS header
                                if ($app.app.config.security.corsWhitelist.indexOf(sOrigin) > -1) {
                                    oResponse.setHeader('Access-Control-Allow-Origin', sOrigin);
                                }
                                //oResponse.setHeader('Access-Control-Allow-Origin', '*');

                                //# Setup the other required headers then fnContinue the oRequest through the proper $route
                                //#     NOTE: CRUD = POST,GET/POST,PUT,DELETE
                                oResponse.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE');
                                oResponse.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,Authorization');
                                oResponse.setHeader('Access-Control-Allow-Credentials', true);

                                //# Parse the .querystring and attach it to our oRequest
                                //oRequest.querystring = $app.app.services.url.parse(oRequest.url, true).query;
                                oRequest.querystring = $app.io.web.queryString.parse(oRequest.url);

                                fnContinue();
                            }); //# CORS

                            return $returnVal;
                        }, //# services.web.router
                        {
                            register: function($router, sRoute, bSecure) {
                                let oRoute,
                                    bRouteExists = false
                                ;

                                //#
                                bSecure = $app.type.bool.mk(bSecure, false);

                                //#
                                if ($app.type.str.is(sRoute)) {
                                    oRoute = $app.type.query(a_oRegisteredRoutes, { route: sRoute }, { firstEntryOnly: true, caseInsensitive: true });
                                    bRouteExists = $app.type.obj.is(oRoute, true);

                                    //#
                                    if (!bRouteExists) {
                                        //$router = require("./" + sRoute + ".js")($app);

                                        //#
                                        if (bSecure) {
                                            $httpServer.use("/" + sRoute, require(__dirname + "/middleware/auth.js")($app));
                                        }
                                        $httpServer.use("/" + sRoute, $router);

                                        //#
                                        oRoute = {
                                            route: sRoute,
                                            secure: bSecure,
                                            router: $router
                                        };
                                        a_oRegisteredRoutes.push(oRoute);
                                    }
                                }

                                return app.extend({
                                    created: !bRouteExists,
                                    securityMismatch: (oRoute.secure !== bSecure)
                                }, oRoute);
                            }, //# router.register

                            registered: function(sRoute, bSecure) {
                                let oRoute,
                                    bRouteExists = false
                                ;

                                //#
                                if ($app.type.str.is(sRoute)) {
                                    oRoute = $app.type.query(a_oRegisteredRoutes, { route: sRoute }, { firstEntryOnly: true, caseInsensitive: true });
                                    bRouteExists = $app.type.obj.is(oRoute, true);
                                }

                                return (bRouteExists &&
                                    arguments.length === 1 || $app.type.bool.mk(bSecure, false) === oRoute.secure
                                );
                            }, //# router.registered
                        }
                    );
                }())
            },
            fs: {
                fs: $fs,
                requireDir: function(sDir, a_sExcludeFiles) {
                    //#
                    sDir = $app.type.str.mk(sDir);
                    sDir = (sDir[0] !== "/" ? "/" : "") + sDir;
                    a_sExcludeFiles = $app.type.arr.mk(a_sExcludeFiles);

                    //#
                    $app.app.services.fs.fs.readdirSync(__dirname + sDir).forEach(function(sFile) {
                        if (a_sExcludeFiles.indexOf(sFile) === -1) {
                            require(__dirname + sDir + "/" + sFile)($app);
                        }
                    });
                }
            }
        },

        log: {
            api: function (oData, oRequest) {
                //# oData = { status, json, error }
            }
        },

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
