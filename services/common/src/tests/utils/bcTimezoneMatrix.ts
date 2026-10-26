// Shared fixtures for the BC permanent UTC-7 (no fall-back on 2026-11-01) tests.
export type Row = [scenario: string, instant: string, expected: string, actual: string];

export const table = (rows: Row[]) => {
    const header = ["Scenario", "Instant", "Expected", "Actual", "Result"];
    const body = rows.map(([s, i, e, a]) => [s, i, e, a, e === a ? "PASS" : "FAIL"]);
    const widths = header.map((_, c) => Math.max(...[header, ...body].map((r) => r[c].length)));
    const line = (r: string[]) => r.map((v, c) => v.padEnd(widths[c])).join(" | ");
    return [line(header), widths.map((w) => "-".repeat(w)).join("-+-"), ...body.map(line)].join(
        "\n"
    );
};

// Throws the full Scenario / Expected / Actual / Result table if any row differs.
export const expectRows = (rows: Row[]) => {
    if (rows.some(([, , expected, actual]) => expected !== actual)) {
        throw new Error(`\n${table(rows)}`);
    }
};

// [scenario, UTC instant, expected UTC offset, expected BC local text]
export const MATRIX: [string, string, string, string][] = [
    ["Past winter stays UTC-8", "2025-12-15T20:00:00Z", "-08:00", "Dec 15 2025, 12:00"],
    ["Past winter stays UTC-8", "2026-01-15T20:00:00Z", "-08:00", "Jan 15 2026, 12:00"],
    ["Summer unchanged", "2026-07-01T19:00:00Z", "-07:00", "Jul 01 2026, 12:00"],
    ["Day before old fall-back", "2026-10-31T23:00:00Z", "-07:00", "Oct 31 2026, 16:00"],
    ["Old fall-back date, before 2am", "2026-11-01T08:30:00Z", "-07:00", "Nov 01 2026, 01:30"],
    ["Old fall-back date, after 2am", "2026-11-01T09:30:00Z", "-07:00", "Nov 01 2026, 02:30"],
    ["New winter behaviour", "2026-12-15T20:00:00Z", "-07:00", "Dec 15 2026, 13:00"],
    ["No spring-forward in 2027", "2027-03-15T20:00:00Z", "-07:00", "Mar 15 2027, 13:00"],
];

export const ZONES = ["Canada/Pacific", "America/Vancouver"];
