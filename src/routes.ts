import Home from "./entries/Home";
import NotFound from "./entries/NotFound";
import Sessions from "./entries/Sessions";
import Nodes from "./entries/Nodes";

const routes = [
    { path: "/", exact: true, component: Home },
    { path: "/sessions", exact: true, component: Sessions },
    { path: "/nodes", exact: true, component: Nodes },
    { path: "", exact: false, component: NotFound }
];

export default routes;
