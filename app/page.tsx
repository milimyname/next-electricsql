import { Example } from "@/components/Example";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <h1>Electric with Prisma</h1>
      <Example />
    </main>
  );
}
