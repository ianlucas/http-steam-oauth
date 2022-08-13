import { routeHandler } from "@ianlucas/http";
import * as express from "express";
interface ISteamSpec {
    apiKey: string;
    onAuthenticate?: (user: IUserData) => Promise<void>;
    onFail: routeHandler;
    onSuccess: routeHandler;
    realm: string;
    sessionPath: string;
    sessionSecret: string;
}
interface IUserData {
    id: string;
    id2: string;
    name: string;
    photo: string;
}
export function useUserData(handler: (userData: IUserData) => Promise<void>): (userData: IUserData) => Promise<void>;
export default function useSteamOAuth(spec: ISteamSpec): (app: express.Application) => void;

//# sourceMappingURL=types.d.ts.map
