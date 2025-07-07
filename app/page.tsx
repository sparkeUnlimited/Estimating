"use client";

import Layout from "@/layout/Layout";
import LoginForm from "@/components/LoginForm";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const Home = () => {
  const router = useRouter();

  useEffect(() => {
    fetch("/api/auth/user")
      .then((res) => res.json())
      .then((data) => {
        if (data.user) router.replace("/estimate");
      })
      .catch(() => {});
  }, [router]);

  return (
    <Layout title="Login">
      <LoginForm />
    </Layout>
  );
};

export default Home;
