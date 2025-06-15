import {homeRoutes} from "./homeRoutes";
import {userRoutes} from "./userRoutes.jsx";
import {postRoutes} from "./postRoutes.jsx";
import {chatRoutes} from "./chatRoutes.jsx";
export const routes = [
    ...homeRoutes,
    ...userRoutes,
    ...postRoutes,
    ...chatRoutes
];
