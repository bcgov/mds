import React, { Fragment } from "react";
import { BrowserRouter } from "react-router-dom";
import { hot } from "react-hot-loader";
import Routes from "./routes/Routes";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import DashboardRoutes from "./routes/DashboardRoutes";

const App = () => (
  <BrowserRouter basename={process.env.BASE_PATH}>
    <Fragment>
      <Header />
      <Routes />
      <DashboardRoutes />
      <Footer />
    </Fragment>
  </BrowserRouter>
);

export default hot(module)(App);
