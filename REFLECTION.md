## The scope of Sprint1
- Upload the log file
- Show uploaded log files as list
- Show log period, device article number, manufacturing date, software version.
- Show alarms information: yes/no, alarm id, amount of alarm occurances, start of alarm occurance.
- Visualise alarms in column chart: by date, by hour.
- Possibility to clear all uploaded logs.

## Data Storage decision: IndexedDB vx localStorage

Recommendation: IndexedDB. Even though today's data (filename, date, analysis results) is small, this is exactly the kind of "growing list of records with metadata" use case IndexedDB is built for — each upload becomes a record you can list, sort by date, or delete individually, without ever hitting a storage ceiling as history accumulates. localStorage would work initially but you'd likely outgrow its size/no-query limitations if the user uploads logs regularly, and migrating later means dealing with two storage systems.

## IndexedDB wrapper

One tradeoff to accept going in: IndexedDB's raw API is clunkier than localStorage's. Therefore, created a small wrapper to keep it simple.

Wrapper is in File: src/lib/db.ts

It's a thin wrapper around the raw indexedDB browser API for a single database (nibe-service-app) with one object store (analyses), storing uploaded log analysis results.

Functions:
- openDb() — internal helper, opens/creates the database and object store (auto-incrementing id key), returns the IDBDatabase instance.
- saveAnalysis(record) — adds a new analysis record (fileName, uploadedAt, result) and returns its generated id.
- getAnalyses() — returns all stored analysis records.
- getAnalysis(id) — returns a single record by id.
- deleteAnalysis(id) — deletes a single record by id.
- clearAllAnalyses() — wipes all records from the store.

It's consumed in src/app/page.tsx (the only other file referencing IndexedDB), which uses it to persist and list uploaded log analyses in the browser — matching the "no backend, browser-persisted data" architecture in CLAUDE.md.
