import React from "react";
import { shallow } from "enzyme";
import DashboardRoutes from "@/routes/DashboardRoutes";

// authClient has not been assigned to ReactKeycloakProvider

//       31 |    */
//       32 |   const authenticationGuard = (props) => {
//     > 33 |     const { keycloak, initialized } = useKeycloak();
//          |                                                  ^
//       34 |
//       35 |     const authenticate = () => {
//       36 |       if (!keycloak.authenticated) {
describe("DashboardRoutes ", () => {
  it("renders properly", () => {
    const component = shallow(<DashboardRoutes />);
    expect(component).toMatchSnapshot();
  });
});
