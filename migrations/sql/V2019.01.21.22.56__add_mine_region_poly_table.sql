--
-- Name: mine_region_poly; Type: TABLE; Schema: public; Owner: mds
--

CREATE TABLE mine_region_poly (
    mine_region_poly_guid uuid DEFAULT gen_random_uuid() NOT NULL,
    mine_region_code character varying(2) NOT NULL,
    mine_region_poly_ha bigint,
    geom geometry(MultiPolygon,3005)
);

ALTER TABLE mine_region_poly OWNER TO mds;

COMMENT ON TABLE mine_region_poly IS 'A mine_region_poly is a large multi-polygon object associated to a mine_region_code';

--
-- Name: mine_region_poly mine_region_poly_pkey; Type: CONSTRAINT; Schema: public; Owner: mds
--

ALTER TABLE ONLY mine_region_poly
    ADD CONSTRAINT mine_region_poly_pkey PRIMARY KEY (mine_region_poly_guid);

--
-- Name: mine_region_poly mine_region_code_unique; Type: CONSTRAINT; Schema: public; Owner: mds
--

ALTER TABLE ONLY mine_region_poly
    ADD CONSTRAINT mine_region_code_unique UNIQUE (mine_region_code);

--
-- Name: mine_region_poly mine_region_poly_mine_region_code_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mds
--

ALTER TABLE ONLY mine_region_poly
    ADD CONSTRAINT mine_region_code_fkey FOREIGN KEY (mine_region_code) REFERENCES mine_region_code(mine_region_code)

