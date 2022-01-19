//#
module.exports = function($app) {
    'use strict';

    let $router = $app.app.services.web.router(),
        $proxy = $app.app.services.web.proxy("http://127.0.0.1:3001", "proxy")
    ;


    //# curl -X GET http://localhost:3000/example2/byid/123 -H 'Content-Type: application/json'
    $router.get("*", $proxy);
    $router.post("*", $proxy);
    $router.put("*", $proxy);
    $router.delete("*", $proxy);


    //#
    $app.app.services.web.router.register($router, "proxy", false);
    return $router;
}; //# module.exports
