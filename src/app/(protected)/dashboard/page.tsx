import { auth } from "@/lib/auth"

export default async function DashboardPage() {
  const session = await auth()

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">대시보드</h1>
      <p className="text-muted-foreground">
        안녕하세요,{" "}
        <span className="font-medium text-foreground">
          {session?.user?.name ?? "사용자"}
        </span>
        님!
      </p>
      <p className="text-sm text-muted-foreground mt-1">
        역할:{" "}
        <span className="font-mono bg-muted px-1 rounded">
          {session?.user?.role}
        </span>
      </p>
    </div>
  )
}
