'use strict';

const $jwt = require('jsonwebtoken');

module.exports = function ($app) {
    let $router = $app.app.services.web.router();

    //#
    async function login(oRequest, oResponse, eMode) {
        let oRS, oConfig,
            bSuccess = false,
            oBody = $app.type.obj.mk(oRequest.body, null),
            //oQueryString = oRequest.querystring,
            oReturnVal = {
                error: 'Incorrect username/password combination.',
                body: oRequest.body
            }
        ;

        //#
        switch (eMode) {
            case $app.app.enums.userTypes.admin: {
                oConfig = {
                    expiresIn: "1 hours",
                    salt: $app.app.config.security.salt.admin
                };
                break;
            }
            case $app.app.enums.userTypes.internal: {
                oConfig = {
                    expiresIn: "8 hours",
                    salt: $app.app.config.security.salt.internal
                };
                break;
            }
            case $app.app.enums.userTypes.external: {
                oConfig = {
                    expiresIn: "8 hours",
                    salt: $app.app.config.security.salt.external
                };
                break;
            }
        }

        //#
        if (oConfig && oBody) {
            //# Verify the username/password
            try {
                if (eMode === $app.app.enums.userTypes.admin && oBody.username === "cn" && oBody.password === "secret") {
                    oRS = {
                        username: "cn",
                        email: "cn@gmail.com"
                    };
                }
                else if (eMode === $app.app.enums.userTypes.internal && oBody.username === "pe" && oBody.password === "hidden") {
                    oRS = {
                        username: "pe",
                        email: "pe@yahoo.com"
                    };
                }
                else if (eMode === $app.app.enums.userTypes.internal && oBody.username === "ja" && oBody.password === "things") {
                    oRS = {
                        username: "ja",
                        email: "ja@hotmail.com"
                    };
                }
                bSuccess = (oRS !== undefined);
            } catch (e) {
                oReturnVal.error = e;
            }

            //# If the username/password was correct
            if (bSuccess) {
                //#
                oReturnVal = $app.extend(oRS, {
                    jwt: $jwt.sign(
                        {
                            username: oRS.username,
                            role: eMode
                        },
                        $app.app.config.security.jwtSecret,
                        {
                            expiresIn: oConfig.expiresIn
                        }
                    )
                });
            }
        }

        oResponse.status(bSuccess ? 200 : 401).json(oReturnVal);
    } //# login


    //# curl -X POST http://localhost:3000/login/verify/admin -H 'Content-Type: application/json' -d '{ "jwt":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImNuIiwicm9sZSI6MCwiaWF0IjoxNjQwODQ3NzAwLCJleHAiOjE2NDA4NTEzMDB9.pGwQnctoytxpozWJPVlibkwCv1YauWhckKY7HFuHpC4" }'
    $router.post("/verify/:mode", (oRequest, oResponse) => {
        /*let sSalt;

        //#
        switch ($app.type.str.mk(oRequest.params.mode).toLowerCase()) {
            case "admin": {
                sSalt = $app.app.config.security.salt.admin;
                break;
            }
            case "internal": {
                sSalt = $app.app.config.security.salt.internal;
                break;
            }
            case "external": {
                sSalt = $app.app.config.security.salt.external;
                break;
            }
        }*/

        //#
        oResponse.json(
            $jwt.verify($app.resolve(oRequest.body, "jwt"), $app.app.config.security.jwtSecret)
        );
    }); //# /login/validate

    //# curl -X POST http://localhost:3000/login/admin -H 'Content-Type: application/json' -d '{ "username":"cn", "password":"secret" }'
    $router.post("/admin", async (oRequest, oResponse) => {
        login(oRequest, oResponse, $app.app.enums.userTypes.admin);
    }); //# /login/admin

    //#
    $router.post("/internal", async (oRequest, oResponse) => {
        login(oRequest, oResponse, $app.app.enums.userTypes.internal);
    }); //# /login/internal

    //#
    $router.post("/external", async (oRequest, oResponse) => {
        login(oRequest, oResponse, $app.app.enums.userTypes.external);
    }); //# /login/external

    //#
    $router.post('*', (oRequest, oResponse) => {
        oResponse.status(401).json({
            error: 'Incorrect username/password combination.'
        });
    }); //# /login/*

    //#
    $app.app.services.web.router.register($router, "login", false);
    return $router;
};
