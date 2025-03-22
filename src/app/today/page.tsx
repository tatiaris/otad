"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Today() {
  const router = useRouter();
  // Get current date
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const day = now.getDate();

  useEffect(() => {
    // Redirect to today's date
    router.replace(`/${year}/${month}/${day}`);
  }, [year, month, day]);

  return null;
}
