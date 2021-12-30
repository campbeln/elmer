//#
module.exports = function ($app) {
    return function (oRequest, oResponse, fnContinue) {
        let oResponseOrgRefs = {
                status: oResponse.status,
                responseJson: undefined,
                json: oResponse.json,
                statusCode: 200,
                errorCode: 0
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

        //#
        oResponse.on('finish', function () {
            $app.app.log.api({
                status: oResponseOrgRefs.statusCode,
                json: oResponseOrgRefs.responseJson,
                error: oResponseOrgRefs.errorCode
            }, oRequest);
        });

        fnContinue();
    };
}; //# module.exports
