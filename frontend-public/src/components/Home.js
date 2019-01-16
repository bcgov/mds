import React from "react";
import { Row } from "antd";

import { AuthenticationGuard } from "../HOC/AuthenticationGuard";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { LandingPage } from "./LandingPage";

export const Home = () => (
  <div>
    <Header />
    <LandingPage />
    <Footer />
  </div>
);

export default AuthenticationGuard(Home);
