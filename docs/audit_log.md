# Audit Log / History tracking

A common use case accross the MDS system is for EMLI staff and proponents to be able to track changes to data over time.This is useful for auditing purposes, as well as for implementing versioning and rollback functionality.
Examples of implementations of this can be found for Explosives Storage facilities and Tailings Storage Facility functionality.

## SQLAlchemy - Continuum

[SQLAlchemy - Continuum](https://sqlalchemy-continuum.readthedocs.io) is a library that provides versioning and history tracking for SQLAlchemy. It allows you to track changes made to your database records over time, and provides a way to query and revert to previous versions of your data.
It's currently integrated into the MDS system for tracking changes for Tailings Storage Facilities.

## How can I use it ?

1.  Register an SQLAlchemy model to be versioned by adding the`__versioned__` attribute to the model class.
    SQLAlchemy - Continuum will automatically create a new version of the record whenever it is updated, created or deleted. Check out the SQLAlchemy-Continuum docs if you need more control over when these
    records are created.

        ```python
            class Mine(SoftDeleteMixin, AuditMixin, Base):
                __tablename__ = 'mine'
                _edit_key = MINE_EDIT_GROUP
                mine_guid = db.Column(UUID(as_uuid=True), primary_key=True, server_default=FetchedValue())
                mine_no = db.Column(db.String(10))
                mine_name = db.Column(db.String(60), nullable=False)

                __versioned__ = {} # <--- This statement is required to enable versioning
        ```

2.  Create a version table for the model by running the following command:

    ```bash
    make generate_version_table_migration TABLE=mine
    ```

    This will generate a flyway migration file that creates a version table for the specified model and a migration, and
    a data migration to insert the initial version of existing records into the version table.

    The name of the version table will be the name of the original table with `_version` appended to it.For example, the version table for the`mine` table will be named`mine_version`.
    That's everything you need! There's no need to make a separate version SQLAlchemy model, as SQLAlchemy - Continuum will handle this for you.

3.  To query the version history of a record, you can use the `versions` attribute of the record(for example`mine.versions`).This attribute will return a list of all versions of the record, including the current version.
