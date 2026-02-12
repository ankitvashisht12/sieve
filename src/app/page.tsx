"use client";

import { useEffect } from "react";
import { useReviewStore } from "@/stores/reviewStore";
import { SetupScreen } from "@/components/SetupScreen";
import { ReviewScreen } from "@/components/ReviewScreen";

export default function Home() {
  const isSetupComplete = useReviewStore((s) => s.isSetupComplete);
  const restoreSession = useReviewStore((s) => s.restoreSession);

  useEffect(() => {
    if (!isSetupComplete) {
      restoreSession();
    }
  }, []);

  return isSetupComplete ? <ReviewScreen /> : <SetupScreen />;
}
