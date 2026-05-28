import { db } from "@/lib/db"

export default async function AdminPage() {
  const users = await db.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  })

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">관리자 패널</h1>
      <div className="rounded-md border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-4 py-2 text-left font-medium">이름</th>
              <th className="px-4 py-2 text-left font-medium">이메일</th>
              <th className="px-4 py-2 text-left font-medium">역할</th>
              <th className="px-4 py-2 text-left font-medium">가입일</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b last:border-0">
                <td className="px-4 py-2">{user.name ?? "-"}</td>
                <td className="px-4 py-2">{user.email}</td>
                <td className="px-4 py-2">
                  <span className="font-mono bg-muted px-1 rounded text-xs">
                    {user.role}
                  </span>
                </td>
                <td className="px-4 py-2">
                  {user.createdAt.toLocaleDateString("ko-KR")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
