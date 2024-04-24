CREATE TABLE "transaction" (
	issued_at timestamp NULL,
	id SERIAL NOT NULL,
	remote_addr varchar(50) NULL,
    user_id TEXT,

	CONSTRAINT transaction_pkey PRIMARY KEY (id)
);