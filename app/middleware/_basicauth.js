//##################################################
//#
//#           ** DO NOT EDIT THIS FILE **
//#
//##################################################
//# Version: 2023-04-04a
'use strict';


module.exports = function ($elmer, oConfig) {
    //#
    oConfig = $elmer.extend(
        {
            //mode: "basic",                //# Inferred by use of this module
            //realm: "api",                 //# Set below
            users: [{
                u: null,
                p: $elmer.type.symbol.get()   //# Force the password to be a unique value ensuring login fails if this default config is used
            }]
        },
        $elmer.resolve($elmer.app.config, "security.basic"),
        oConfig
    );

    //# Ensure the oConfig values are properly set
    oConfig.users = $elmer.type.arr.mk(oConfig.users, [oConfig.users]);
    oConfig.realm = $elmer.type.str.mk(oConfig.realm, "api");

    //#
    //#     Based on: https://stackoverflow.com/a/33905671/235704
    return function (oRequest, oResponse, fnContinue) {
        let oUser, i,
            sB64auth = $elmer.type.str.mk(oRequest.headers.authorization).split(' ')[1] || '',
            a_sCreds = Buffer.from(sB64auth, 'base64').toString().match(/(.*?):(.*)/) || []     //# [_, username, password]
        ;

        //# In order to avoid crypto timing attacks, use the decimal part of process.uptime to randomly and slightly delay processing of the a_sCreds
        //#     NOTE: This is arguably security through obscurity, but as it's based on process.uptime its random by definition.
        setTimeout(
            function () {
                //# If we have a user-sent .username and .password to test, traverse the oConfig's .usernames (and .passwords)
                if (a_sCreds[1] && a_sCreds[2]) {
                    for (i = 0; i < oConfig.users.length; i++) {
                        //# If the current .u(sername) and .p(assword) match, set our oUser and fall from the loop
                        if ($elmer.type.obj.is(oConfig.users[i]) &&
                            a_sCreds[1] === oConfig.users[i].u &&
                            a_sCreds[2] === oConfig.users[i].p
                        ) {
                            oUser = oConfig.users[i];
                            break;
                        }
                    }
                }

                //# If the oUser was found above, (safely) set it into oRequest.elmer.user and fnContinue
                if (oUser) {
                    oRequest.elmer = $elmer.type.obj.mk(oRequest.elmer);
                    oRequest.elmer.user = oUser;
                    fnContinue();
                }
                //# Else a valid .username/.password combo was not found, so access is denied
                else {
                    oResponse.set('WWW-Authenticate', 'Basic realm="' + oConfig.realm + '"');
                    oResponse.status(401).json({
                        method: "BasicAuth",
                        error: 'Authentication required.'
                    });
                }
            },
            Math.floor((process.uptime() % 1) * 100)
        );
    };
}; //# module.exports
