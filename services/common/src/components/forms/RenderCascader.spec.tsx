import React from "react";
import { render } from "@testing-library/react";
import RenderCascader from "./RenderCascader";



describe("RenderCascader", () => {
    it("renders properly", () => {
        const props = {
            input: {
                onChange: jest.fn(), // Mock the onChange function
            },
            meta: {
                touched: true, // Set the desired value for 'touched'
            },
        };
        const { container } = render(<RenderCascader {...props} />);
        expect(container).toMatchSnapshot();
    });
});
