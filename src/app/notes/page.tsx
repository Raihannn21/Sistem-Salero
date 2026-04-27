import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Navigation from "@/components/Navigation";
import { prisma } from "@/lib/prisma";
import NotesList from "@/components/NotesList";

export default async function NotesPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  if ((session.user as any).role !== "OWNER") {
    redirect("/sales");
  }

  const notes = await prisma.note.findMany({
    where: { userId: (session.user as any).id },
    orderBy: { updatedAt: "desc" }
  });

  return (
    <div className="min-h-screen bg-[#fcfcfc] lg:pl-72 relative">
      <Navigation />
      
      <main className="p-8 lg:p-12 max-w-[1600px] mx-auto">
        <NotesList notes={notes} />
      </main>
    </div>
  );
}
