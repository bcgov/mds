import Quill from "quill";
import PermitPackageFileBlot, {
  BROKEN_PERMIT_PACKAGE_FILE_REFERENCE_TOOLTIP,
} from "@mds/common/components/permits/quill/PermitPackageFileBlot";

describe("PermitPackageFileBlot", () => {
  it("renders a resolved reference as a green pill with an icon and label", () => {
    const node = PermitPackageFileBlot.create({
      guid: "fig-guid",
      found: true,
      label: "1.2 Site Map",
    }) as HTMLElement;

    expect(node.className).toBe("permit-package-file-blot permit-package-file-reference");
    expect(node.querySelector("svg")).not.toBeNull();
    expect(node.querySelector("span")?.textContent).toBe("1.2 Site Map");
    expect(node.getAttribute("title")).toBeNull();
    expect(node.getAttribute("tabIndex")).toBeNull();
  });

  it("renders an unresolved reference as a red pill with a tooltip and fallback text", () => {
    const node = PermitPackageFileBlot.create({
      guid: "deleted-guid",
      found: false,
    }) as HTMLElement;

    expect(node.className).toBe("permit-package-file-blot permit-package-file-reference-broken");
    expect(node.querySelector("svg")).not.toBeNull();
    expect(node.querySelector("span")?.textContent).toBe("Reference unavailable");
    expect(node.getAttribute("title")).toBe(BROKEN_PERMIT_PACKAGE_FILE_REFERENCE_TOOLTIP);
    expect(node.getAttribute("tabIndex")).toBe("0");
  });

  it("exposes the tooltip text via aria-describedby, not just the title attribute", () => {
    const node = PermitPackageFileBlot.create({
      guid: "deleted-guid",
      found: false,
    }) as HTMLElement;

    const describedById = node.getAttribute("aria-describedby");
    expect(describedById).toBeTruthy();

    const description = node.querySelector(`#${describedById}`);
    expect(description).not.toBeNull();
    expect(description?.className).toBe("sr-only");
    expect(description?.textContent).toBe(BROKEN_PERMIT_PACKAGE_FILE_REFERENCE_TOOLTIP);
  });

  it("clears aria-describedby when re-rendered as resolved", () => {
    const node = PermitPackageFileBlot.create({ guid: "fig-guid", found: false }) as HTMLElement;
    expect(node.getAttribute("aria-describedby")).toBeTruthy();

    PermitPackageFileBlot.renderInto(node, { guid: "fig-guid", found: true, label: "1.2 Site Map" });

    expect(node.getAttribute("aria-describedby")).toBeNull();
  });

  it("round-trips guid/found/label through value()", () => {
    const resolvedNode = PermitPackageFileBlot.create({
      guid: "fig-guid",
      found: true,
      label: "1.2 Site Map",
    }) as HTMLElement;
    expect(PermitPackageFileBlot.value(resolvedNode)).toEqual({
      guid: "fig-guid",
      found: true,
      label: "1.2 Site Map",
    });

    const brokenNode = PermitPackageFileBlot.create({
      guid: "deleted-guid",
      found: false,
    }) as HTMLElement;
    expect(PermitPackageFileBlot.value(brokenNode)).toEqual({
      guid: "deleted-guid",
      found: false,
      label: undefined,
    });
  });

  it("re-renders in place when renderInto is called again with updated data", () => {
    const node = PermitPackageFileBlot.create({
      guid: "fig-guid",
      found: false,
    }) as HTMLElement;
    expect(node.className).toContain("broken");

    PermitPackageFileBlot.renderInto(node, { guid: "fig-guid", found: true, label: "1.2 Site Map" });

    expect(node.className).toBe("permit-package-file-blot permit-package-file-reference");
    expect(node.getAttribute("title")).toBeNull();
    expect(node.querySelector("span")?.textContent).toBe("1.2 Site Map");
  });

  it("does not register under Quill's own generic 'span' tag", () => {
    // Parchment falls back to matching by bare tagName when a blot registers no static className
    // (which this blot doesn't) - claiming the same tag Quill's own Inline formatting blot uses
    // ("span") would silently overwrite that registration, causing Quill's default paste handler
    // to misidentify *any* plain, unrelated <span> copied from elsewhere on the page as a broken
    // instance of this blot. See MDS-6987.
    expect(PermitPackageFileBlot.tagName.toLowerCase()).not.toBe("span");

    const Parchment = Quill.import("parchment") as { query: (node: unknown) => unknown };
    const plainSpan = document.createElement("span");
    expect(Parchment.query(plainSpan)).not.toBe(PermitPackageFileBlot);
  });
});
