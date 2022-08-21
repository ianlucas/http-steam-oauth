import {createRequestHandler as $5J6bb$createRequestHandler} from "@ianlucas/http";
import * as $5J6bb$expresssession from "express-session";
import {authenticate as $5J6bb$authenticate, initialize as $5J6bb$initialize, session as $5J6bb$session, serializeUser as $5J6bb$serializeUser, deserializeUser as $5J6bb$deserializeUser, use as $5J6bb$use} from "passport";
import * as $5J6bb$sessionfilestore from "session-file-store";
import * as $5J6bb$passportsteam from "passport-steam";





const $da4f350b3eba35fd$var$FileStore = $5J6bb$sessionfilestore($5J6bb$expresssession);

function $da4f350b3eba35fd$var$replace(one, two) {
    return one === 1 ? two : one;
}
function $da4f350b3eba35fd$var$getUserData(profile) {
    const data = profile._json;
    const steamId = BigInt(data.steamid);
    const universeId = $da4f350b3eba35fd$var$replace(Number(steamId >> 56n), 0);
    const accountId = Number(steamId & BigInt(0xffffffff));
    const i1 = universeId;
    const i2 = accountId & 1;
    const i3 = Math.floor(accountId / 2);
    const id2 = `STEAM_${i1}:${i2}:${i3}`;
    return {
        id: data.steamid,
        id2: id2,
        name: data.personaname,
        photo: data.avatarfull
    };
}
function $da4f350b3eba35fd$var$serializeUser(id, done) {
    done(null, id);
}
function $da4f350b3eba35fd$var$deserializeUser(id, done) {
    done(null, id);
}
function $da4f350b3eba35fd$export$52a7e4f3f505b7fa(handler) {
    return handler;
}
function $da4f350b3eba35fd$export$2e2bcd8739ae039(spec) {
    spec.routePrefix = spec.routePrefix || "";
    async function validate(identifier, profile, done) {
        try {
            const userData = $da4f350b3eba35fd$var$getUserData(profile);
            if (spec.onAuthenticate) await spec.onAuthenticate(userData);
            return done(null, userData.id);
        } catch (error) {
            return done(error);
        }
    }
    function authenticate(request, response, error, userId) {
        if (error) return (0, $5J6bb$createRequestHandler)(spec.onFail)(request, response, error);
        if (!userId) return (0, $5J6bb$createRequestHandler)(spec.onFail)(request, response);
        request.logIn(userId, (loginError)=>{
            if (loginError) return (0, $5J6bb$createRequestHandler)(spec.onFail)(request, response, loginError);
            return (0, $5J6bb$createRequestHandler)(spec.onSuccess)(request, response);
        });
    }
    function handlePostLogin(request, response, next) {
        $5J6bb$authenticate("steam", (error, userId)=>{
            authenticate(request, response, error, userId);
        })(request, response, next);
    }
    return function steamPlugin(app) {
        const options = {
            apiKey: spec.apiKey,
            returnURL: `${spec.realm}${spec.routePrefix}/__postlogin__`,
            realm: spec.realm
        };
        const steamStrategy = new $5J6bb$passportsteam(options, validate);
        const handleLogin = $5J6bb$authenticate("steam");
        const fileStoreOptions = {
            path: spec.sessionPath || "./sessions"
        };
        const sessionHandler = $5J6bb$expresssession({
            secret: spec.sessionSecret,
            resave: true,
            saveUninitialized: true,
            store: new $da4f350b3eba35fd$var$FileStore(fileStoreOptions)
        });
        app.use(sessionHandler);
        app.use($5J6bb$initialize());
        app.use($5J6bb$session());
        $5J6bb$serializeUser($da4f350b3eba35fd$var$serializeUser);
        $5J6bb$deserializeUser($da4f350b3eba35fd$var$deserializeUser);
        $5J6bb$use(steamStrategy);
        app.get(spec.routePrefix + "/__login__", handleLogin);
        app.get(spec.routePrefix + "/__postlogin__", handlePostLogin);
    };
}


export {$da4f350b3eba35fd$export$52a7e4f3f505b7fa as useUserData, $da4f350b3eba35fd$export$2e2bcd8739ae039 as default};
//# sourceMappingURL=steamOAuth.module.js.map
