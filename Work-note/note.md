┌────────────────────┐
│ User Browser │
│ (Next.js UI) │
└─────────┬──────────┘
│
│ ① Select Image / Video
▼
┌────────────────────┐
│ Frontend (Next.js)│
│ - Editor Page │
│ - Publish Page │
└─────────┬──────────┘
│
│ ② Request Auth Signature
▼
┌────────────────────┐
│ Backend (NestJS) │
│ ImageKit Auth API │
│ (PRIVATE KEY SAFE) │
└─────────┬──────────┘
│
│ ③ token + signature
▼
┌────────────────────┐
│ Frontend (Next.js)│
│ (Signed Upload) │
└─────────┬──────────┘
│
│ ④ Upload File (Direct)
▼
┌────────────────────┐
│ ImageKit Cloud │
│ Storage + CDN │
└─────────┬──────────┘
│
│ ⑤ Public CDN URL
▼
┌────────────────────┐
│ Frontend State │
│ (imageUrl stored) │
└─────────┬──────────┘
│
│ ⑥ Click Publish
▼
┌────────────────────┐
│ Backend (NestJS) │
│ Blog Publish API │
└─────────┬──────────┘
│
│ ⑦ Save Blog Data
▼
┌────────────────────┐
│ Neon PostgreSQL DB │
│ (URL + metadata) │
└────────────────────┘
