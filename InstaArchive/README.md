# InstaArchive

A production-grade Instagram public account archival system.

## Quick Start

1.  **Clone/Navigate** to the `InstaArchive` directory.
2.  **Run with Docker**:
    ```bash
    docker-compose up --build
    ```
3.  **Access the Dashboard**:
    Open [http://localhost:3000](http://localhost:3000) in your browser.

## Features (Local Download Phase)

- **Profile Search**: Fetch details of any public Instagram account.
- **Organized Storage**: Downloads are saved in `downloads/{username}/posts/{year}/`.
- **Metadata Preservation**: Captions, timestamps, and full JSON metadata are saved alongside media.
- **Incremental Sync**: Skips already downloaded posts based on shortcode.
- **Premium UI**: Modern dark-mode dashboard built with Next.js and Tailwind.

## Tech Stack

- **Backend**: Python 3.12, FastAPI, Instaloader.
- **Frontend**: Next.js 15, TypeScript, Tailwind CSS, TanStack Query.
- **Database**: PostgreSQL (State tracking ready).
- **Queue**: Redis (Celery ready).

## Note on Instagram Session

Instagram often blocks anonymous scraping. If you encounter blocks, you can provide a session file:
1.  Log in to Instagram in your browser.
2.  Export cookies/session using an extension or `instaloader --login`.
3.  Place the session file in `backend/` and update `backend/app/core/config.py`.
