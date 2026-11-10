import { Suspense } from "react";
import ResetPasswordPage from "./ResetPassPage";

export default function VerifyPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPasswordPage />
    </Suspense>
  );
}
