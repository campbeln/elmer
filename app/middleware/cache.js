//#
module.exports = function ($app, sRoute) {
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

        //# On finish of the oResponse, .cache the $app data
        oResponse.on('finish', function () {
            let iURL = undefined,
                sURL = oRequest.url,
                oData = {
                    timestamp: Date.now(),
                    when: $app.type.date.format($app.type.date.utcToLocalOffset(), "YYYY-MM-DD HH:mm:ss"),
                    route: sRoute,
                    subroute: "",
                    url: sURL,
                    status: oResponseOrgRefs.statusCode,
                    error: oResponseOrgRefs.errorCode,
                    json: oResponseOrgRefs.responseJson
                }
            ;

            //# If there are any querystring or hashtag element in the sURL, set iURL for removal
            if (sURL.indexOf("?") > -1) {
                iURL = sURL.indexOf("?");
            }
            else if (sURL.indexOf("#") > -1) {
                iURL = sURL.indexOf("#");
            }

            //# Set our .subroute from the sURL/iURL
            oData.subroute = sURL.substring(sURL.indexOf(sRoute) + sRoute.length, iURL);

            //# Ensure our sRoute is an array then .push the oData under our sRoute
            $app.cache[sRoute] = $app.cache[sRoute] || {};
            $app.cache[sRoute][oData.subroute] = $app.cache[sRoute][oData.subroute] || [];
            $app.cache[sRoute][oData.subroute].push(oData);

            //#
            //$app.app.log.api(oData, oRequest);
        });

        fnContinue();
    };
}; //# module.exports