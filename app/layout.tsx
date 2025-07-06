import "/styles/globals.css";
import "/styles/calendar.css";
import Script from "next/script";

export const metadata = {
  title: "Estimating App - Spark-E",
  description:
    "Providing timely and complete estimates. Sustainable electrical services for residential and commercial customers.",
  keywords:
    "electrician, contractor, estimating, estimate, EV chargers, panel upgrades, energy-efficient, fire alarm, commercial, residential",
};

const RootLayout = ({ children }) => (
  <html lang="en">
    <body>
      {children}
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`}
        strategy="afterInteractive"
      />
    </body>
  </html>
);

export default RootLayout;
