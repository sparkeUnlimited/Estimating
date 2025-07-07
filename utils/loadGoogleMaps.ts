import { Loader } from "@googlemaps/js-api-loader";

const loader = new Loader({
  apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string,
  libraries: ["places"],
});

export const loadGoogleMaps = () => loader.importLibrary("places");
