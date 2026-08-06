import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import FloatingAssistant from "@/components/ui/FloatingAssistant"; // Import it here

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <FloatingAssistant /> {/* Add it here */}
    </div>
  );
}