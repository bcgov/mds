import React from "react";
import { AuthenticationGuard } from "../HOC/AuthenticationGuard";
import { Header } from "./Header";

export const Home = () => (
  <div>
    <Header />
    hello proponents
  </div>
);

export default AuthenticationGuard(Home);
