import "/styles/globals.css";
import "/styles/calendar.css";

export const metadata = {
  title: "Estimating App - Spark-E",
  description:
    "Providing timely and complete estimates. Sustainable electrical services for residential and commercial customers.",
  keywords:
    "electrician, contractor, estimating, estimate, EV chargers, panel upgrades, energy-efficient, fire alarm, commercial, residential",
};

const RootLayout = ({ children }) => (
  <html lang="en">
    <body>{children}</body>
  </html>
);

export default RootLayout;
