var $M42m8$ianlucashttp = require("@ianlucas/http");
var $M42m8$expresssession = require("express-session");
var $M42m8$passport = require("passport");
var $M42m8$sessionfilestore = require("session-file-store");
var $M42m8$passportsteam = require("passport-steam");

function $parcel$defineInteropFlag(a) {
  Object.defineProperty(a, '__esModule', {value: true, configurable: true});
}
function $parcel$export(e, n, v, s) {
  Object.defineProperty(e, n, {get: v, set: s, enumerable: true, configurable: true});
}

$parcel$defineInteropFlag(module.exports);

$parcel$export(module.exports, "useUserData", () => $cb30a718c416064d$export$52a7e4f3f505b7fa);
$parcel$export(module.exports, "default", () => $cb30a718c416064d$export$2e2bcd8739ae039);




const $cb30a718c416064d$var$FileStore = $M42m8$sessionfilestore($M42m8$expresssession);

function $cb30a718c416064d$var$replace(one, two) {
    return one === 1 ? two : one;
}
function $cb30a718c416064d$var$getUserData(profile) {
    const data = profile._json;
    const steamId = BigInt(data.steamid);
    const universeId = $cb30a718c416064d$var$replace(Number(steamId >> 56n), 0);
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
function $cb30a718c416064d$var$serializeUser(id, done) {
    done(null, id);
}
function $cb30a718c416064d$var$deserializeUser(id, done) {
    done(null, id);
}
function $cb30a718c416064d$export$52a7e4f3f505b7fa(handler) {
    return handler;
}
function $cb30a718c416064d$export$2e2bcd8739ae039(spec) {
    spec.routePrefix = spec.routePrefix || "";
    async function validate(identifier, profile, done) {
        try {
            const userData = $cb30a718c416064d$var$getUserData(profile);
            if (spec.onAuthenticate) await spec.onAuthenticate(userData);
            return done(null, userData.id);
        } catch (error) {
            return done(error);
        }
    }
    function authenticate(request, response, error, userId) {
        if (error) return (0, $M42m8$ianlucashttp.createRequestHandler)(spec.onFail)(request, response, error);
        if (!userId) return (0, $M42m8$ianlucashttp.createRequestHandler)(spec.onFail)(request, response);
        request.logIn(userId, (loginError)=>{
            if (loginError) return (0, $M42m8$ianlucashttp.createRequestHandler)(spec.onFail)(request, response, loginError);
            return (0, $M42m8$ianlucashttp.createRequestHandler)(spec.onSuccess)(request, response);
        });
    }
    function handlePostLogin(request, response, next) {
        $M42m8$passport.authenticate("steam", (error, userId)=>{
            authenticate(request, response, error, userId);
        })(request, response, next);
    }
    return function steamPlugin(app) {
        const options = {
            apiKey: spec.apiKey,
            returnURL: `${spec.realm}${spec.routePrefix}/__postlogin__`,
            realm: spec.realm
        };
        const steamStrategy = new $M42m8$passportsteam(options, validate);
        const handleLogin = $M42m8$passport.authenticate("steam");
        const fileStoreOptions = {
            path: spec.sessionPath || "./sessions"
        };
        const sessionHandler = $M42m8$expresssession({
            secret: spec.sessionSecret,
            resave: true,
            saveUninitialized: true,
            store: new $cb30a718c416064d$var$FileStore(fileStoreOptions)
        });
        app.use(sessionHandler);
        app.use($M42m8$passport.initialize());
        app.use($M42m8$passport.session());
        $M42m8$passport.serializeUser($cb30a718c416064d$var$serializeUser);
        $M42m8$passport.deserializeUser($cb30a718c416064d$var$deserializeUser);
        $M42m8$passport.use(steamStrategy);
        app.get(spec.routePrefix + "/__login__", handleLogin);
        app.get(spec.routePrefix + "/__postlogin__", handlePostLogin);
    };
}


//# sourceMappingURL=steamOAuth.common.js.map
