import AuthGate from "@/components/AuthGate";
import DocumentTracker from "@/components/DocumentTracker";

export default function Home() {
  return (
    <AuthGate>
      <DocumentTracker />
    </AuthGate>
  );
}
