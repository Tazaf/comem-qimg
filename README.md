# qimg

## Environment Variables

* **NODE_ENV**: Environment (defaults to `development`).
* **PORT**: Port to listen to (defaults to `3000`).
* **DATABASE_URL**: PostgreSQL connection URL (defaults to `postgres://localhost/qimg`).
* **QIMG_URL**: Base URL (defaults to `http://localhost:$PORT`).
* **QIMG_ADMIN_TOKEN**: Administrator authentication token (defaults to `admin` in development, **required** in production).
* **QIMG_IMAGE_QUOTA**: Number of images kept for each user (default to 10).
