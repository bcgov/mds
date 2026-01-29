import React from "react";
import { shallow } from "enzyme";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import GlobalSearch from "@/components/search/GlobalSearch/GlobalSearch";

const mockStore = configureStore([]);

describe("GlobalSearch", () => {
    let store;
    let component;

    beforeEach(() => {
        store = mockStore({
            search: {
                searchBarResults: [],
            },
        });
        component = shallow(
            <Provider store={store}>
                <GlobalSearch />
            </Provider>
        );
    });

    it("renders properly", () => {
        expect(component).toMatchSnapshot();
    });
});
