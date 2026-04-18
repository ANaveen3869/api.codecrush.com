import { User } from "../database/schemas";


declare global {
    namespace Express {
        interface Request {
            user?: User;
        }
    }
}