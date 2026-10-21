import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import {
  ArrowLeft,
  CalendarDays,
  ClipboardList,
  RefreshCw,
  Users,
} from "lucide-react";

import { getTeamById } from "../api/team.api";
import type { Team } from "../types/team.types";

export default function TeamDetails() {
  const { teamId } = useParams<{ teamId: string }>();

  const [team, setTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadTeam() {
    if (!teamId) {
      setError("Invalid team ID.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const data = await getTeamById(teamId);
      setTeam(data);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || "Unable to load team details.");
      } else {
        setError("Something went wrong. Please try again.");
      }

      setTeam(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadTeam();
  }, [teamId]);

  if (loading) {
    return (
      <main className="flex min-h-96 items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600" />

          <p className="mt-4 text-sm text-slate-500">Loading team details...</p>
        </div>
      </main>
    );
  }

  if (error || !team) {
    return (
      <main className="mx-auto max-w-5xl p-6 md:p-8">
        <Link
          to="/teams"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-indigo-600"
        >
          <ArrowLeft size={18} />
          Back to teams
        </Link>

        <div className="mt-8 rounded-2xl border border-red-200 bg-white p-8 text-center">
          <h1 className="text-xl font-bold text-slate-900">
            Unable to load team
          </h1>

          <p className="mt-2 text-sm text-red-600">
            {error || "Team not found."}
          </p>

          <button
            type="button"
            onClick={() => void loadTeam()}
            className="mt-5 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 font-medium text-white hover:bg-indigo-700"
          >
            <RefreshCw size={16} />
            Try again
          </button>
        </div>
      </main>
    );
  }

  const members = team.members ?? [];
  const memberCount = team._count?.members ?? members.length;
  const taskCount = team._count?.tasks ?? 0;

  const createdDate = new Date(team.createdAt);

  return (
    <main className="mx-auto max-w-6xl p-5 md:p-8">
      {/* Navigation */}
      <Link
        to="/teams"
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-indigo-600"
      >
        <ArrowLeft size={18} />
        Back to teams
      </Link>

      {/* Team Header */}
      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-start">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-700">
              <Users size={28} />
            </div>

            <div>
              <p className="text-sm font-medium text-indigo-600">
                TEAM WORKSPACE
              </p>

              <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
                {team.name}
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                {team.description || "No description provided."}
              </p>
            </div>
          </div>

          <span className="inline-flex w-fit items-center rounded-full bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-700">
            Active workspace
          </span>
        </div>

        {/* Statistics */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-slate-200 p-5">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-indigo-50 p-2.5 text-indigo-600">
                <Users size={20} />
              </div>

              <div>
                <p className="text-sm text-slate-500">Team members</p>

                <p className="mt-1 text-2xl font-bold text-slate-900">
                  {memberCount}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 p-5">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-violet-50 p-2.5 text-violet-600">
                <ClipboardList size={20} />
              </div>

              <div>
                <p className="text-sm text-slate-500">Total tasks</p>

                <p className="mt-1 text-2xl font-bold text-slate-900">
                  {taskCount}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Team Metadata */}
        <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3 border-t border-slate-100 pt-5 text-sm text-slate-500">
          <div className="flex items-center gap-2">
            <CalendarDays size={16} />

            <span>
              Created{" "}
              {Number.isNaN(createdDate.getTime())
                ? "date unavailable"
                : createdDate.toLocaleDateString()}
            </span>
          </div>

          {team.owner && (
            <div>
              Owner:{" "}
              <span className="font-medium text-slate-700">
                {team.owner.name}
              </span>
            </div>
          )}
        </div>
      </section>

      {/* Members */}
      <section className="mt-8 rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Team members</h2>

            <p className="mt-1 text-sm text-slate-500">
              People who have access to this workspace.
            </p>
          </div>

          <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-600">
            {members.length} listed
          </span>
        </div>

        {members.length === 0 ? (
          <div className="p-10 text-center">
            <Users size={32} className="mx-auto text-slate-300" />

            <h3 className="mt-4 font-semibold text-slate-900">
              No members found
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              Member details are not available for this team yet.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {members.map((member) => (
              <div
                key={member.id}
                className="flex flex-wrap items-center justify-between gap-4 p-5 transition hover:bg-slate-50"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-indigo-100 font-semibold text-indigo-700">
                    {member.user.name.trim().charAt(0).toUpperCase()}
                  </div>

                  <div className="min-w-0">
                    <p className="truncate font-semibold text-slate-900">
                      {member.user.name}
                    </p>

                    <p className="mt-1 truncate text-sm text-slate-500">
                      {member.user.email}
                    </p>
                  </div>
                </div>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    member.role === "OWNER"
                      ? "bg-violet-100 text-violet-700"
                      : member.role === "ADMIN"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {member.role}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
