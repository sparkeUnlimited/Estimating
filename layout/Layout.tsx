import { Box, Container } from "@mui/material";
import Head from "next/head";
import Nav from "@/components/Nav"; // make sure this exists or replace with your nav
import { ReactNode } from "react";

type LayoutProps = {
  title?: string;
  children: ReactNode;
};

const Layout = ({ title = "Estimating Tool", children }: LayoutProps) => {
  return (
    <>
      <Head>
        <title>{`${title} | Estimating Tool`}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      {/* Black Overlay */}
      <Box
        sx={{
          backgroundColor: "black",
          background: "radial-gradient(circle, rgba(2, 0, 10, 0.8) 0%, black 100%)",
          position: "absolute",
          zIndex: 2,
          width: "100%",
          height: "100%",
          top: 0,
        }}
        className="main"
      >
        Radial Gradient Background
        <Box
          sx={{
            zIndex: 3,
            width: "100%",
            height: "100%",
            maxWidth: "640px",
            position: "absolute",
            backgroundImage: `
              radial-gradient(at 27% 37%, hsla(215, 98%, 61%, 1) 0px, transparent 0%),
              radial-gradient(at 97% 21%, hsla(125, 98%, 72%, 1) 0px, transparent 50%),
              radial-gradient(at 52% 99%, hsla(354, 98%, 61%, 1) 0px, transparent 50%),
              radial-gradient(at 10% 29%, hsla(256, 96%, 67%, 1) 0px, transparent 50%),
              radial-gradient(at 97% 96%, hsla(38, 60%, 74%, 1) 0px, transparent 50%),
              radial-gradient(at 33% 50%, hsla(222, 67%, 73%, 1) 0px, transparent 50%),
              radial-gradient(at 79% 53%, hsla(343, 68%, 79%, 1) 0px, transparent 50%)
            `,
            filter: "blur(100px) saturate(150%)",
            top: "80px",
            opacity: 0.15,
          }}
          className="gradient"
        />
      </Box>

      {/* Main Content Container */}
      <Container
        maxWidth="lg"
        sx={{
          position: "relative",
          zIndex: 10,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          px: { xs: 2, sm: 6 },
          mx: "auto",
          minHeight: "100vh",
        }}
      >
        <Nav />
        <Box sx={{ flexGrow: 1, width: "100%", py: 4 }}>{children}</Box>
      </Container>
    </>
  );
};

export default Layout;
