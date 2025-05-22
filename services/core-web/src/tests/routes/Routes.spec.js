import React from "react";
import { shallow } from "enzyme";
import Routes from "@/routes/Routes";

const props = {};

const setupProps = () => { };

beforeEach(() => {
  setupProps();
});

// authClient has not been assigned to ReactKeycloakProvider

//       31 |    */
//       32 |   const authenticationGuard = (props) => {
//     > 33 |     const { keycloak, initialized } = useKeycloak();
//          |                                                  ^
describe("Routes ", () => {
  it("renders properly", () => {
    const component = shallow(<Routes {...props} />);
    expect(component).toMatchSnapshot();
  });
});
