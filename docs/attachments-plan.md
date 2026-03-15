# SOPSmith Attachments Backend

## Overview

SOPSmith now supports private file attachments for existing SOPs.

Supported file types:

- PDF
- DOC
- DOCX
- TXT

The backend stores attachment metadata in Postgres and the file objects in a private Supabase storage bucket. Downloads are served through short-lived signed URLs.

## Database Schema

Table: `public.sop_files`

- `id uuid primary key default gen_random_uuid()`
- `sop_id uuid not null references public.sops(id) on delete cascade`
- `file_name text not null`
- `file_type text not null`
- `file_size integer not null`
- `file_url text not null`
- `created_at timestamptz not null default now()`

Notes:

- `file_url` stores the private storage object path, not a public URL.
- Attachment rows are deleted automatically when the parent SOP is deleted.
- Attachments are indexed by `(sop_id, created_at desc)` for fast listing.

## RLS

`public.sop_files` uses row-level security so only the owner of the parent SOP can read or mutate attachment rows.

Policy shape:

```sql
auth.uid() = (
  select public.sops.user_id
  from public.sops
  where public.sops.id = public.sop_files.sop_id
)
```

## Storage Bucket

Bucket name: `attachments`

Configuration:

- private bucket
- file size limit: `50 MB`
- allowed MIME types:
  - `application/pdf`
  - `application/msword`
  - `application/vnd.openxmlformats-officedocument.wordprocessingml.document`
  - `text/plain`

Storage object paths are written as:

```text
<sop_id>/<uuid>.<ext>
```

This lets storage policies map an object back to the parent SOP through the first folder segment.

## API Endpoints

### `POST /api/sops/[id]/attachments`

Uploads one or more files for the SOP identified by `[id]`.

Request:

- `multipart/form-data`
- repeated `files` form fields
- requires an authenticated SOPSmith session

Behavior:

- validates SOP ownership before upload
- validates file type and size before upload
- uploads files to `attachments`
- inserts metadata rows into `public.sop_files`
- rolls back uploaded storage objects if metadata insert fails

Success response:

```json
{
  "attachments": [
    {
      "id": "uuid",
      "sopId": "uuid",
      "fileName": "runbook.pdf",
      "fileType": "application/pdf",
      "fileSize": 182304,
      "createdAt": "2026-03-14T22:30:00.000Z"
    }
  ]
}
```

### `GET /api/sops/[id]/attachments`

Returns attachment metadata for an owned SOP.

Success response:

```json
{
  "attachments": [
    {
      "id": "uuid",
      "sopId": "uuid",
      "fileName": "notes.txt",
      "fileType": "text/plain",
      "fileSize": 2048,
      "createdAt": "2026-03-14T22:30:00.000Z"
    }
  ]
}
```

### `GET /api/sops/[id]/attachments/[fileId]/signed-url`

Returns a short-lived signed URL for an owned attachment.

Success response:

```json
{
  "signedUrl": "https://...",
  "expiresIn": 60
}
```

## Error Behavior

- `400` invalid file type, invalid size, missing files, or malformed upload body
- `401` unauthenticated
- `404` SOP or attachment missing or not owned by the current user
- `500` storage or database failure

## Security Notes

- No service-role key is used for normal attachment CRUD.
- Uploads, listing, and signed URL creation run server-side with the authenticated user session.
- The app does not expose bucket listing routes.
- Attachment lists come from Postgres metadata, and downloads use signed URLs instead of public storage access.

## Curl Examples

These examples assume you already have an authenticated SOPSmith browser session exported to `cookie.txt`.

### Upload attachments

```bash
curl -X POST "http://localhost:3000/api/sops/<SOP_ID>/attachments" \
  --cookie cookie.txt \
  -F "files=@./examples/process-notes.pdf;type=application/pdf" \
  -F "files=@./examples/checklist.txt;type=text/plain"
```

### List attachments

```bash
curl "http://localhost:3000/api/sops/<SOP_ID>/attachments" \
  --cookie cookie.txt
```

### Signed URL contract

Use this endpoint when the frontend needs a short-lived file link:

```text
GET /api/sops/<SOP_ID>/attachments/<FILE_ID>/signed-url
```
