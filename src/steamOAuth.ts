import { createRequestHandler, routeHandler } from '@ianlucas/http';
import * as express from 'express';
import * as session from 'express-session';
import * as passport from 'passport';
import * as fileStore from 'session-file-store';

const FileStore = fileStore(session);
const Strategy: any = require('passport-steam');

type doneHandler = (error: any, userId?: string) => void;

interface SteamSpec {
  apiKey: string;
  onAuthenticate?: (user: UserData) => Promise<void>;
  onFail: routeHandler;
  onSuccess: routeHandler;
  realm: string;
  sessionPath: string;
  sessionSecret: string;
  routePrefix?: string;
}

export interface UserData {
  id: string;
  id2: string;
  name: string;
  photo: string;
}

interface SteamProfile {
  _json: {
    avatarfull: string;
    personaname: string;
    steamid: string;
  };
}

function replace(one: number, two: number) {
  return one === 1 ? two : one;
}

function getUserData(profile: SteamProfile): UserData {
  const data = profile._json;
  const steamId = BigInt(data.steamid);
  const universeId = replace(Number(steamId >> 56n), 0);
  const accountId = Number(steamId & BigInt(0xffffffff));
  const i1 = universeId;
  const i2 = accountId & 1;
  const i3 = Math.floor(accountId / 2);
  const id2 = `STEAM_${i1}:${i2}:${i3}`;
  return {
    id: data.steamid,
    id2,
    name: data.personaname,
    photo: data.avatarfull
  };
}

function serializeUser(id: any, done: doneHandler) {
  done(null, id);
}

function deserializeUser(id: string, done: doneHandler) {
  done(null, id);
}

export function useUserData(handler: (userData: UserData) => Promise<void>) {
  return handler;
}

export default function useSteamOAuth(spec: SteamSpec) {
  spec.routePrefix = spec.routePrefix || '';

  async function validate(
    identifier: string,
    profile: SteamProfile,
    done: doneHandler
  ) {
    try {
      const userData = getUserData(profile);
      if (spec.onAuthenticate) {
        await spec.onAuthenticate(userData);
      }
      return done(null, userData.id);
    } catch (error) {
      return done(error);
    }
  }

  function authenticate(
    request: express.Request,
    response: express.Response,
    error: any,
    userId: string
  ) {
    if (error) {
      return createRequestHandler(spec.onFail)(request, response, error);
    }
    if (!userId) {
      return createRequestHandler(spec.onFail)(request, response);
    }
    request.logIn(userId, (loginError) => {
      if (loginError) {
        return createRequestHandler(spec.onFail)(request, response, loginError);
      }
      return createRequestHandler(spec.onSuccess)(request, response);
    });
  }

  function handlePostLogin(
    request: express.Request,
    response: express.Response,
    next: express.NextFunction
  ) {
    passport.authenticate('steam', (error, userId) => {
      authenticate(request, response, error, userId);
    })(request, response, next);
  }

  return function steamPlugin(app: express.Application) {
    const options = {
      apiKey: spec.apiKey,
      returnURL: `${spec.realm}/__postlogin__`,
      realm: spec.realm
    };

    const steamStrategy = new Strategy(options, validate);
    const handleLogin = passport.authenticate('steam');

    const fileStoreOptions = {
      path: spec.sessionPath || './sessions'
    };

    const sessionHandler = session({
      secret: spec.sessionSecret,
      resave: true,
      saveUninitialized: true,
      store: new FileStore(fileStoreOptions)
    });

    app.use(sessionHandler);
    app.use(passport.initialize());
    app.use(passport.session());

    passport.serializeUser(serializeUser);
    passport.deserializeUser(deserializeUser);
    passport.use(steamStrategy);

    app.get(spec.routePrefix + '/__login__', handleLogin);
    app.get(spec.routePrefix + '/__postlogin__', handlePostLogin);
  };
}
