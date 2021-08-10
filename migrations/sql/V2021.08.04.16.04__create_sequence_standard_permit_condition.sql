DO
$$
BEGIN
   EXECUTE format('
   CREATE SEQUENCE IF NOT EXISTS public.permit_conditions_standard_permit_condition_id_seq
   INCREMENT 1
   START %1$s
   MINVALUE %1$s
   NO MAXVALUE
   CACHE 1;'
 , (SELECT COALESCE ((SELECT MAX(standard_permit_condition_id) FROM standard_permit_conditions),0) +1));
   ALTER SEQUENCE public.permit_conditions_standard_permit_condition_id_seq OWNER TO mds;
   GRANT ALL ON SEQUENCE public.permit_conditions_standard_permit_condition_id_seq TO mds;
   ALTER TABLE ONLY public.standard_permit_conditions ALTER COLUMN standard_permit_condition_id SET DEFAULT nextval('public.permit_conditions_standard_permit_condition_id_seq'::regclass);
END
$$;