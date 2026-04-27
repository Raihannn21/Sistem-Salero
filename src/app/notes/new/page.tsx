import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Navigation from "@/components/Navigation";
import NoteEditor from "@/components/NoteEditor";

export default async function NewNotePage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  if ((session.user as any).role !== "OWNER") {
    redirect("/sales");
  }

  return (
    <div className="min-h-screen bg-[#fcfcfc] lg:pl-72 relative">
      <Navigation />
      
      <main className="p-8 lg:p-12 max-w-[1200px] mx-auto">
        <NoteEditor />
      </main>
    </div>
  );
}
