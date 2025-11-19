import "/styles/globals.css";
import "/styles/calendar.css";
import { GoogleMapsProvider } from "@/components/providers/GoogleMapsProvider";
import { EstimateDataProvider } from "@/components/providers/EstimateDataProvider";

export const metadata = {
  title: "Estimating App - Spark-E",
  description:
    "Providing timely and complete estimates. Sustainable electrical services for residential and commercial customers.",
  keywords:
    "electrician, contractor, estimating, estimate, EV chargers, panel upgrades, energy-efficient, fire alarm, commercial, residential",
};

const RootLayout = ({ children }: { children: React.ReactNode }) => (
  <html lang="en">
    <body>
      <GoogleMapsProvider>
        <EstimateDataProvider>{children}</EstimateDataProvider>
      </GoogleMapsProvider>
    </body>
  </html>
);

export default RootLayout;
