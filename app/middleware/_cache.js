//##################################################
//#
//#           ** DO NOT EDIT THIS FILE **
//#
//##################################################
//# Version: 2023-05-18
'use strict';


module.exports = function ($elmer, sRoute) {
    //#
    $elmer.app.cache = $elmer.app.cache || {};

    return function (oRequest, oResponse, fnContinue) {
        let oResponseOrgRefs = {
                status: oResponse.status,
                json: oResponse.json,
                statusCode: 200,
                errorCode: 0,
                responseJson: undefined
            }
        ;

        //# Monkeypatch .json and .status to capture the oBody and iStatusCode into oResponseOrgRefs, then forward the calls to the original fn's
        oResponse.json = function (oBody) {
            oResponseOrgRefs.responseJson = oBody;
            return oResponseOrgRefs.json.apply(this, Array.prototype.slice.call(arguments));
        };
        oResponse.status = function (iStatusCode) {
            oResponseOrgRefs.statusCode = iStatusCode;
            return oResponseOrgRefs.status.apply(this, Array.prototype.slice.call(arguments));
        };

        //# Add in the .$errorCode interface
        oResponse.$errorCode = function (eError) {
            oResponseOrgRefs.errorCode = eError;
        };

        //# On finish of the oResponse, .cache the $elmer data
        oResponse.on('finish', function () {
            let iURL = undefined,
                sURL = oRequest.url,
                oData = {
                    trace: oRequest.$trace,
                    //timestamp: Date.now(),
                    //when: $elmer.type.date.format($elmer.type.date.utcToLocalOffset(), "YYYY-MM-DD HH:mm:ss"),
                    route: sRoute,
                    subroute: "",
                    url: sURL,
                    status: oResponseOrgRefs.statusCode,
                    error: oResponseOrgRefs.errorCode,
                    data: oResponseOrgRefs.responseJson
                }
            ;

            //#
            oRequest.$trace.completed = $elmer.type.date.timestamp();
            oRequest.$trace.runtime = $elmer.type.date.diff(oRequest.$trace.started, oRequest.$trace.completed, "s");

            //# If there are any querystring or hashtag element in the sURL, set iURL for removal
            if (sURL.indexOf("?") > -1) {
                iURL = sURL.indexOf("?");
            }
            else if (sURL.indexOf("#") > -1) {
                iURL = sURL.indexOf("#");
            }

            //# Set our .subroute from the sURL/iURL
            oData.subroute = sURL.substring(sURL.indexOf(sRoute) + sRoute.length, iURL);

            //# Ensure the .$trace.id entry is setup within our .cache then .push the oData in
            $elmer.app.cache[oRequest.$trace.id] = $elmer.app.cache[oRequest.$trace.id] || [];
            $elmer.app.cache[oRequest.$trace.id].push(oData);

            //# Ensure our sRoute is an array then .push the oData under our sRoute
            /*
            $elmer.app.cache[sRoute] = $elmer.app.cache[sRoute] || {};
            $elmer.app.cache[sRoute][oData.subroute] = $elmer.app.cache[sRoute][oData.subroute] || [];
            $elmer.app.cache[sRoute][oData.subroute].push(oData);
            */

            //#
            //$elmer.app.log.api(oData, oRequest);
        });

        fnContinue();
    };
}; //# module.exports
