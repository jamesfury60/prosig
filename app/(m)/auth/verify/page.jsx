import { Suspense } from "react";
import VerifyEmailPage from "./VerifyEmailPage";

export default function VerifyPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyEmailPage />
    </Suspense>
  );
}
