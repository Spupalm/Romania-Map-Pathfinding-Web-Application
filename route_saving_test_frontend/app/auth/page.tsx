import Link from "next/link";
import AuthForm from "../../components/AuthForm";

interface AuthPageProps {
  searchParams: Promise<{ next?: string }>;
}

export default async function AuthPage({ searchParams }: AuthPageProps) {
  const requestedPath = (await searchParams).next;
  const nextPath =
    requestedPath?.startsWith("/") && !requestedPath.startsWith("//")
      ? requestedPath
      : "/main_page";

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        background: "#4d86b2",
      }}
    >
      <div style={{ position: "absolute", top: "20px", left: "20px" }}>
        <Link href="/main_page" style={{ color: "white" }}>
          ← Back to map
        </Link>
      </div>
      <AuthForm nextPath={nextPath} />
    </main>
  );
}

