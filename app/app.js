'use strict';

const $formidable = require('formidable');
const $url = require('url');
const $fs = require('fs');

module.exports = function ($app, $express) {
    $app.app = {
        version: "0.2.2021-12-24",

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
            webserver: $express,
            url: $url,
            fs: $fs,

            multipartForm: function () {
                return new $formidable.IncomingForm();
            },

            router: function () {
                var $returnVal = $express.Router();

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
            } //# services.router
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
