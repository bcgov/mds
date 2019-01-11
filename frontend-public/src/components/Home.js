import React from "react";
import { AuthGuard } from "../HOC/AuthGuard";

export const Home = () => <div>hello proponents</div>;

export default AuthGuard(Home);
