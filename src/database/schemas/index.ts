export * from "./refresh_token.js";
export * from "./user.js";

import { refreshToken } from "./refresh_token.js";
import { user } from "./user.js";


export const dbTables = {
    user,
    refreshToken
};

