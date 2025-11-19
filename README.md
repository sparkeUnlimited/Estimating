# Spark-E Field Tool

A job site management app with offline support, task tracking, and safety forms.

## Environment Variables

Create an `.env.local` file for local development and provide your API keys:

```
NEXT_PUBLIC_TOMORROW_API_KEY=your-tomorrow-api-key
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-google-maps-api-key
```

When deploying to AWS Amplify, configure these environment variables in the Amplify console so they are available during the build process.
