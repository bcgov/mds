import commonHandlers from "./handlers";
import { setupServer } from "msw/node";

const server = setupServer(...commonHandlers);
export default server;
