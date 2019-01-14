import React from "react";
import { AuthenticationGuard } from "../HOC/AuthenticationGuard";

export const Home = () => <div>hello proponents</div>;

export default AuthenticationGuard(Home);
