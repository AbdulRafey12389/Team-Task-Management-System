import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const { user, logout } = useAuth();

  return (
    <main className="min-h-screen bg-slate-100 p-6 md:p-10">
      <div className="mx-auto max-w-5xl">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-indigo-600">
              TEAM TASK MANAGER
            </p>

            <h1 className="mt-2 text-3xl font-bold text-slate-900">
              Dashboard
            </h1>
          </div>

          <button
            onClick={() => void logout()}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 font-medium text-slate-700 hover:bg-slate-50"
          >
            Sign out
          </button>
        </header>

        <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">
            Welcome, {user?.name}!
          </h2>

          <p className="mt-2 text-slate-500">
            Your authentication is connected. Team and task management features
            will appear here.
          </p>

          <p className="mt-4 text-sm text-slate-600">
            Signed in as: {user?.email}
          </p>
        </section>
      </div>
    </main>
  );
}
