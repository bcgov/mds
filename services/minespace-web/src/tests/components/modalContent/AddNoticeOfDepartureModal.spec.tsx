import React from "react";
import { shallow } from "enzyme";
import { Provider } from "react-redux";
import * as MOCK from "@mds/common/tests/mocks/dataMocks";
import AddNoticeOfDepartureModal from "@/components/modalContent/noticeOfDeparture/AddNoticeOfDepartureModal";
import { store } from "@/App";

describe("AddNoticeOfDepartureModal", () => {
  it("renders properly", () => {
    const component = shallow(
      <Provider store={store}>
        <AddNoticeOfDepartureModal
          mineGuid={MOCK.MINES.mineIds[0]}
          permits={MOCK.PERMITS}
          onSubmit={jest.fn()}
        />
      </Provider>
    );
    expect(component).toMatchSnapshot();
  });
});
