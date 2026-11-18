# Security Specification — Trivaya Ventures

## 1. Data Invariants
1. **Admin Identity Invariant**: Only a Google-authenticated user with `request.auth.token.email in ['samprathap7@gmail.com', 'bijju9880@gmail.com']` AND `request.auth.token.email_verified == true` is recognized as admin.
2. **Public Catalogue Read-Only Invariant**: Unauthenticated or non-admin visitors may read (`get`, `list`) published documents in `/projects/{projectId}` only, and may never create, update, or delete any project.
3. **Blog Publication & Admin-Only Write Invariant**: Visitors (unauthenticated or non-admin) may read (`get`, `list`) documents in `/posts/{postId}` ONLY where `published == true`. Draft posts (`published == false`) are strictly restricted to verified admins. Only verified admins may create, update, or delete posts.
4. **Enquiry Write-Only for Visitors**: Visitors (unauthenticated or non-admin) may only `create` valid documents in `/enquiries/{enquiryId}` with `status == 'new'` and `createdAt == request.time`. They may never `get`, `list`, `update`, or `delete` any enquiry (PII protection).
5. **Path ID & Payload Integrity**: Document IDs must match `^[a-zA-Z0-9_-]{1,128}$`. Every string field has strict `.size()` bounds and allowed keys are strictly gated with `hasAll` / `hasOnly`. Post summaries are capped at 160 characters.
6. **Storage Isolation**: Project media under `/projects/{projectId}/{fileName}` and blog media under `/blog/{postId}/{fileName}` are publicly readable, while writes/deletes are restricted strictly to verified admins with image MIME type and `< 10MB` size checks.

## 2. The "Dirty Dozen" Adversarial Payloads
1. **Unverified Admin Email Spoof**: Auth token `{ email: "samprathap7@gmail.com", email_verified: false }` attempts to `create` `/projects/p1` or `/posts/b1` -> `PERMISSION_DENIED`.
2. **Non-Admin User Project/Post Write**: Auth token `{ email: "other@gmail.com", email_verified: true }` attempts to `create` or `delete` `/projects/p1` or `/posts/b1` -> `PERMISSION_DENIED`.
3. **Visitor Reading Draft Blog Post**: Unauthenticated or non-admin visitor attempts `get` on `/posts/draft1` (`published: false`) or `list` without `published == true` -> `PERMISSION_DENIED`.
4. **Visitor Reading Enquiries (PII Leak)**: Unauthenticated or non-admin visitor attempts `get` or `list` on `/enquiries` -> `PERMISSION_DENIED`.
5. **Visitor Updating Enquiry Status**: Unauthenticated visitor attempts to `update` `/enquiries/e1` -> `PERMISSION_DENIED`.
6. **Enquiry Ghost Field Injection**: Visitor creates `/enquiries/e1` with extra field `{ adminOverride: true }` -> `PERMISSION_DENIED`.
7. **Post Ghost Field / Invalid Category Injection**: Admin creates `/posts/b1` with `{ category: "Arbitrary" }` or `{ viewsCount: 9999 }` -> `PERMISSION_DENIED`.
8. **Enquiry Spoofed Status on Create**: Visitor creates `/enquiries/e1` with `{ status: "closed" }` instead of `"new"` -> `PERMISSION_DENIED`.
9. **Forged Client Timestamp**: Client creates `/enquiries/e1` or `/posts/b1` with past timestamp instead of `request.time` -> `PERMISSION_DENIED`.
10. **Oversized Summary / String DoS**: Admin creates `/posts/b1` with `summary` > 160 chars or visitor creates `/enquiries/e1` with `message` > 2000 chars -> `PERMISSION_DENIED`.
11. **Invalid Slug Format**: Admin creates `/posts/b1` with `{ slug: "Invalid Slug!" }` -> `PERMISSION_DENIED`.
12. **Unlisted Collection Access**: Client attempts to read/write `/users/u1` or `/admins/a1` -> `PERMISSION_DENIED`.
