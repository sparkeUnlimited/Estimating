"use client";

import { Loader } from "@googlemaps/js-api-loader";
import { createContext, useContext, useEffect, useState } from "react";

const GoogleMapsContext = createContext<{ loaded: boolean }>({ loaded: false });

const loader = new Loader({
  apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string,
  libraries: ["places"],
});

export const GoogleMapsProvider = ({ children }: { children: React.ReactNode }) => {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let mounted = true;
    loader
      .importLibrary("places")
      .then(() => {
        if (mounted) setLoaded(true);
      })
      .catch(() => {
        if (mounted) setLoaded(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  return <GoogleMapsContext.Provider value={{ loaded }}>{children}</GoogleMapsContext.Provider>;
};

export const useGoogleMaps = () => useContext(GoogleMapsContext);
