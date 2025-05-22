import React from "react";
import { shallow } from "enzyme";
import { ViewMagazineModal } from "@/components/modalContent/ViewMagazineModal";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";

const props = {};

const setupProps = () => {
  props.onSubmit = jest.fn();
  props.type = "EXP";
  props.mine = {};
  [props.explosivesPermit] = MOCK.EXPLOSIVES_PERMITS.data.records;
};

beforeEach(() => {
  setupProps();
});

// TypeError: Cannot read properties of null (reading '_layerAdd')

//       83 |         showCoverageOnHover: false,
//       84 |       });
//     > 85 |       mapRef.current?.addLayer(markerClusterGroupRef.current);
//          |                       ^
//       86 |     }
//       87 |   };
describe("ViewMagazineModal", () => {
  it("renders properly", () => {
    const component = shallow(<ViewMagazineModal {...props} />);
    expect(component).toMatchSnapshot();
  });
});
