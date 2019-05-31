alter table party 
add column job_title character varying(255),
add column postnominal_letters character varying(60),
add column idir_username character varying(60);

comment on column party.postnominal_letters is 'Letters that come after a persons name, such as designations (BSc, PhD).';
