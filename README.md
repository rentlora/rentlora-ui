# Rentlora UI

The frontend for the Rentlora platform.

## Technology Stack
- React
- Vite
- Vanilla CSS (Premium Modern Design)

## Environment Variables
- `VITE_API_URL` (Base URL for API calls if an API Gateway is used, otherwise individual service URLs can be added)

## Running Locally

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the dev server:
   ```bash
   npm run dev
   ```

## Running with Docker

1. Build the image:
   ```bash
   docker build -t rentlora-ui .
   ```

2. Run the container:
   ```bash
   docker run -p 80:80 rentlora-ui
   ```
