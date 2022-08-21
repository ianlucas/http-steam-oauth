import { routeHandler } from "@ianlucas/http";
import * as express from "express";
interface SteamSpec {
    apiKey: string;
    onAuthenticate?: (user: UserData) => Promise<void>;
    onFail: routeHandler;
    onSuccess: routeHandler;
    realm: string;
    sessionPath: string;
    sessionSecret: string;
}
export interface UserData {
    id: string;
    id2: string;
    name: string;
    photo: string;
}
export function useUserData(handler: (userData: UserData) => Promise<void>): (userData: UserData) => Promise<void>;
export default function useSteamOAuth(spec: SteamSpec): (app: express.Application) => void;

//# sourceMappingURL=types.d.ts.map
