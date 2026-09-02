import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import SpatialFilesRowLink from "./SpatialFilesRowLink";

describe("SpatialFilesRowLink", () => {
  it("stops row propagation and invokes the link action", () => {
    const onClick = jest.fn();
    const onContainerClick = jest.fn();

    render(
      <div onClick={onContainerClick}>
        <SpatialFilesRowLink onClick={onClick} />
      </div>
    );

    fireEvent.click(screen.getByRole("button", { name: /in Spatial Files above/i }));

    expect(onClick).toHaveBeenCalledTimes(1);
    expect(onContainerClick).not.toHaveBeenCalled();
  });
});
