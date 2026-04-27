import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import Navigation from "@/components/Navigation";
import { prisma } from "@/lib/prisma";
import NoteEditor from "@/components/NoteEditor";

export default async function EditNotePage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  const { id } = await params;

  if (!session) {
    redirect("/login");
  }

  if ((session.user as any).role !== "OWNER") {
    redirect("/sales");
  }

  const note = await prisma.note.findUnique({
    where: { id }
  });

  if (!note || note.userId !== (session.user as any).id) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#fcfcfc] lg:pl-72 relative">
      <Navigation />
      
      <main className="p-8 lg:p-12 max-w-[1200px] mx-auto">
        <NoteEditor initialNote={note} />
      </main>
    </div>
  );
}
