import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { FloatingFAQAssistant } from "@/components/shared/FloatingFAQAssistant"; // Import it here

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <FloatingFAQAssistant /> {/* Add it here */}
    </div>
  );
}

