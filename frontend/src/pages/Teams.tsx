import { useCallback, useEffect, useState, type FormEvent } from "react";
import axios from "axios";
import { Plus, Users, ClipboardList, RefreshCw } from "lucide-react";

import { createTeam, getTeams } from "../api/team.api";
import type { Team } from "../types/team.types";

export default function Teams() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const loadTeams = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await getTeams();

      setTeams(data);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || "Unable to load teams.");
      } else {
        setError("Something went wrong while loading teams.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadTeams();
  }, [loadTeams]);

  async function handleCreateTeam(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setSubmitting(true);

    try {
      const team = await createTeam({
        name: name.trim(),
        description: description.trim() || undefined,
      });

      setTeams((currentTeams) => [team, ...currentTeams]);

      setName("");
      setDescription("");
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || "Unable to create team.");
      } else {
        setError("Something went wrong while creating the team.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-indigo-600">
              Workspace
            </p>

            <h1 className="mt-2 text-3xl font-bold text-slate-900">
              Your Teams
            </h1>

            <p className="mt-2 text-slate-500">
              Organize your people and collaborate on tasks.
            </p>
          </div>

          <button
            type="button"
            onClick={() => void loadTeams()}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-50"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </header>

        {error && (
          <div
            role="alert"
            className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            <span>{error}</span>

            <button
              type="button"
              onClick={() => void loadTeams()}
              className="font-semibold underline"
            >
              Try again
            </button>
          </div>
        )}

        <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-3">
            <div className="rounded-xl bg-indigo-50 p-3 text-indigo-600">
              <Plus size={22} />
            </div>

            <div>
              <h2 className="font-semibold text-slate-900">Create a team</h2>

              <p className="text-sm text-slate-500">
                Start a workspace for your project.
              </p>
            </div>
          </div>

          <form onSubmit={handleCreateTeam} className="space-y-4">
            <div>
              <label
                htmlFor="team-name"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Team name
              </label>

              <input
                id="team-name"
                type="text"
                minLength={2}
                maxLength={100}
                required
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="e.g. Development Team"
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            <div>
              <label
                htmlFor="team-description"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Description
                <span className="ml-2 font-normal text-slate-400">
                  Optional
                </span>
              </label>

              <textarea
                id="team-description"
                rows={3}
                maxLength={1000}
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="What will this team work on?"
                className="w-full resize-y rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            <button
              type="submit"
              disabled={submitting || name.trim().length < 2}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-5 py-3 font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Plus size={18} />
              {submitting ? "Creating..." : "Create team"}
            </button>
          </form>
        </section>

        <section className="mt-10">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900">All teams</h2>

            <span className="rounded-full bg-slate-200 px-3 py-1 text-sm font-medium text-slate-700">
              {teams.length}
            </span>
          </div>

          {loading ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-slate-500">
              Loading your teams...
            </div>
          ) : teams.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
              <Users className="mx-auto text-slate-400" size={36} />

              <h3 className="mt-4 font-semibold text-slate-900">
                No teams yet
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                Create your first team using the form above.
              </p>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {teams.map((team) => (
                <article
                  key={team.id}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                      <Users size={22} />
                    </div>

                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                      Active
                    </span>
                  </div>

                  <h3 className="mt-5 break-words text-lg font-semibold text-slate-900">
                    {team.name}
                  </h3>

                  <p className="mt-2 min-h-10 break-words text-sm text-slate-500">
                    {team.description || "No description provided."}
                  </p>

                  <div className="mt-5 flex items-center gap-5 border-t border-slate-100 pt-4 text-sm text-slate-600">
                    <span className="flex items-center gap-2">
                      <Users size={16} />
                      {team._count?.members ?? team.members?.length ?? 0}{" "}
                      members
                    </span>

                    <span className="flex items-center gap-2">
                      <ClipboardList size={16} />
                      {team._count?.tasks ?? 0} tasks
                    </span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
