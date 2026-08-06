import Image from "next/image";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-1 w-full max-w-3xl flex-col items-center justify-center py-32 px-16 bg-white dark:bg-black">
        <Image
          className="h-10 w-auto bg-white p-1 rounded"
          src="/nibe-logo.svg"
          alt="NIBE logo"
          width={200}
          height={48}
          priority
        />
      </main>
    </div>
  );
}
