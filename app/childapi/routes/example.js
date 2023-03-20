//#
module.exports = function($app, $router /*, $baseRouter */) {
    'use strict';

    //$router = $app.app.services.web.router();


    //# curl -X GET http://localhost:3000/childapi/byid/123 -H 'Content-Type: application/json' -H 'Authorization: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImNuIiwicm9sZSI6MCwiaWF0IjoxNjQwODQ3NzAwLCJleHAiOjE2NDA4NTEzMDB9.pGwQnctoytxpozWJPVlibkwCv1YauWhckKY7HFuHpC4'
    //# curl -X GET http://localhost:3000/childapi/byid/letters -H 'Content-Type: application/json' -H 'Authorization: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImNuIiwicm9sZSI6MCwiaWF0IjoxNjQwODQ3NzAwLCJleHAiOjE2NDA4NTEzMDB9.pGwQnctoytxpozWJPVlibkwCv1YauWhckKY7HFuHpC4'
    //# curl -X GET http://localhost:3000/childapi/byid/123 -H 'Content-Type: application/json'
    //# curl -X GET http://localhost:3000/childapi2/byid/123 -H 'Content-Type: application/json'
    $router.get('/byid/:id', async (oRequest, oResponse) => {
        var iID = $app.type.int.mk(oRequest.params.id);

        oResponse.status(200).json({ id: iID, boilerplate: true });
    });


    //# curl -X POST http://localhost:3000/childapi2/byfile -H 'Content-Type: application/json' -d "$(cat /file/path/json.ext)"
    //# curl -X POST http://localhost:3000/childapi2/byfile -F "upload=@/file/path/json.ext" > /file/path/output.json
    $router.post('/byfile', async (oRequest, oResponse) => {
        $app.app.services.web.multipartForm(oRequest, async function (oFormData) {
            let oFileContents = JSON.parse(oFormData.files.upload.getContent());

            //..
        } /*, { readFileSync: { encoding: "utf8" } }*/);
    });


    //# curl -X POST http://localhost:3000/childapi2/xlsx -H 'Content-Type: application/json' -d "$(cat /file/path/json.ext)"
    //# curl -X POST http://localhost:3000/childapi2/xlsx -F "upload=@/file/path/sheet.xlsx" > /file/path/output.json
    $router.post('/xlsx', async (oRequest, oResponse) => {
        $app.app.services.web.multipartForm(oRequest, async function (oFormData) {
            let oXLSX = $app.io.xlsx({ file: oFormData.files.upload.getContent(), options: { type: "binary" } } /*, "Sheet1" */),
                a_oXLSX = $app.type.query(
                    $app.resolve(oXLSX, ["data", "Sheet1"]),
                    { status: function (x) { return $app.type.str.cmp(x, "active"); } }
                )
            ;

            //..
        }, { readFileSync: { encoding: "binary" } });
    });


    //#
    //return $router;
}; //# module.exports
