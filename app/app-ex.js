const $expressProxy = require('express-http-proxy');

//#
module.exports = function ($app) {
    'use strict';
    $app.app.versionEx = "0.1.2022-12-03";

    //#
    $app.extend($app.app, {
        cache: {},
        enums: {
            userTypes: {
                admin: 0,
                internal: 1,
                external: 2
            }
        },
        services: {
            web: {
                //bodyParser: $bodyParser,
                proxy: function (sProxyURL, sRemovePrefixFromPath) {
                    /*
                    let bRemovePrefix;

                    //#
                    sProxyURL = $app.type.str.mk(sProxyURL);
                    sRemovePrefixFromPath = $app.type.str.mk(sRemovePrefixFromPath);
                    bRemovePrefix = (sRemovePrefixFromPath !== "");

                    //#
                    if (bRemovePrefix) {
                        sRemovePrefixFromPath = (sRemovePrefixFromPath[0] === "/" ? "" : "/") + sRemovePrefixFromPath;
                    }

                    //#
                    //# https://stackoverflow.com/questions/18432779/piping-remote-file-in-expressjs/66991063#66991063
                    return function (oRequest, oResponse) {
                        let sURL = "http://" + sProxyURL + oRequest.url;
                        sURL = (bRemovePrefix ? sURL.replace(sRemovePrefixFromPath, "") : sURL);

                        try {
                            $fetch(sURL).then((oActual) => {
                                oActual.headers.forEach((sValue, sName) => oResponse.setHeader(sName, sValue));
                                oActual.body.pipe(oResponse);
                            });
                        } catch (e) {
                            console.log(e);
                        }
                    };
                    */
                },

                //# Overload the existing $app.app.services.web.router with our baseElmer version
                router: (function() {
                    let a_oRegisteredRoutes = [],
                        fnOrigRegistered = $app.app.services.web.router.registered
                    ;

                    return $app.extend(
                        function() {
                            let $returnVal = $express.Router();

                            //# Configure our .router to use CORS
                            $returnVal.use((oRequest, oResponse, fnContinue) => {
                                let sOrigin = oRequest.headers.origin;

                                //console.log("sOrigin: [" + sOrigin + "]", oRequest.headers);

                                //# If the oRequest is from a .corsWhitelist sOrigin we trust, set the CORS header
                                if ($app.app.config.security.corsWhitelist.indexOf(sOrigin) > -1) {
                                    oResponse.setHeader('Access-Control-Allow-Origin', sOrigin);
                                }
                                /*else {
                                    oResponse.setHeader('Access-Control-Allow-Origin', '*');
                                }*/
                                //oResponse.setHeader('Access-Control-Allow-Origin', '*');

                                //# Setup the other required headers then fnContinue the oRequest through the proper $route
                                //#     NOTE: CRUD = POST,GET/POST,PUT,DELETE
                                oResponse.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE'); //# PATCH,HEAD,OPTIONS
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
                            registered: fnOrigRegistered,

                            register: function(vRouterOrURL, sRoute, bSecure) {
                                let $router, oRoute, sProxyURL, bRemovePrefix,
                                    sRemovePrefixFromPath = $app.type.str.mk(sRoute),
                                    bRouteExists = false
                                ;

                                if ($app.type.str.is(vRouterOrURL)) {
                                    sProxyURL = $app.type.str.mk(vRouterOrURL);
                                }
                                else {
                                    $router = vRouterOrURL;
                                }
                                bRemovePrefix = (sRemovePrefixFromPath !== "");

                                //#
                                if (bRemovePrefix) {
                                    sRemovePrefixFromPath = (sRemovePrefixFromPath[0] === "/" ? "" : "/") + sRemovePrefixFromPath;
                                }

                                //#
                                bSecure = $app.type.bool.mk(bSecure, false);

                                //#
                                if ($app.type.str.is(sRoute)) {
                                    oRoute = $app.type.query(a_oRegisteredRoutes, { route: sRoute }, { firstEntryOnly: true, caseInsensitive: true });
                                    bRouteExists = $app.type.obj.is(oRoute, true);

                                    //#
                                    if (!bRouteExists) {
                                        //#
                                        if (bSecure) {
                                            $httpServer.use("/" + sRoute, require(__dirname + "/app/middleware/auth.js")($app));
                                        }

                                        //#
                                        //# https://stackoverflow.com/questions/49017240/express-js-proxy-to-call-web-api
                                        if ($app.type.str.mk(sProxyURL)) {
                                            let sURL = "http://" + sProxyURL; // + oRequest.url
                                            sURL = (bRemovePrefix ? sURL.replace(sRemovePrefixFromPath, "") : sURL);
                                            $router = $expressProxy(sURL, {
                                                parseReqBody: false
                                            });
                                        }
                                        $httpServer.use("/" + sRoute, require(__dirname + "/app/middleware/cache.js")($app, sRoute));
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
                            } //# router.register
                        }
                    );
                }())
            },

            //# TODO: Old code version probably no longer needed
            fs: {
                requireDir: function(sDir, a_sExcludeFiles, fnCallback) {
                    //#
                    sDir = $app.type.str.mk(sDir);
                    sDir = (sDir[0] !== "/" ? "/" : "") + sDir;
                    a_sExcludeFiles = $app.type.arr.mk(a_sExcludeFiles);

                    //#
                    fnCallback = $app.type.fn.mk(fnCallback, function(fnRequiredFile /*, sFileName, sRelativePath*/) {
                        fnRequiredFile($app);
                    });

                    //#
                    $app.app.services.fs.fs.readdirSync(__dirname + sDir).forEach(function(sFile) {
                        let oFS = {
                            file: sFile,
                            dir: __dirname + sDir + "/",
                            path: __dirname + sDir + "/" + sFile,
                            url: sDir.replace(/^\/routes/i, "") + $app.type.str.mk(sFile).replace(/\.js$/i, "")
                        };

                        if (a_sExcludeFiles.indexOf(sFile) === -1) {
                            fnCallback(require(oFS.path), oFS);
                        }
                    });
                }
            }
        }
    });

}; //# module.exports
