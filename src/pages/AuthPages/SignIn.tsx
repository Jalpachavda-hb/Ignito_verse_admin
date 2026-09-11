import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";
import SignInForm from "../../components/auth/SignInForm";

export default function SignIn() {
  return (
    <>
      <PageMeta
        title="Admin Sign In | Ignitoverse Administration Portal"
        description="Secure Administrator Sign In for Ignitoverse Management Portal"
      />
      <AuthLayout>
        <SignInForm />
      </AuthLayout>
    </>
  );
}
