import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import {
  ArrowLeft,
  CalendarDays,
  ClipboardList,
  LoaderCircle,
  Mail,
  Plus,
  RefreshCw,
  Shield,
  Trash2,
  Users,
  UserPlus,
} from "lucide-react";

import { addTeamMember, getTeamById, removeTeamMember } from "../api/team.api";
import type { Team } from "../types/team.types";
import { useAuth } from "../context/AuthContext";

type MemberRole = "ADMIN" | "MEMBER";

export default function TeamDetails() {
  const { teamId } = useParams<{ teamId: string }>();

  const [team, setTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);

  const [email, setEmail] = useState("");
  const [role, setRole] = useState<MemberRole>("MEMBER");

  const [isAdding, setIsAdding] = useState(false);
  const [removingUserId, setRemovingUserId] = useState<string | null>(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const { user } = useAuth();
  // Adjust this line to match how your application stores the
  // authenticated user's ID. Prefer your existing auth context/store.
  const currentUserId = user?.id || null; // Assuming the user object has an 'id' property

  console.log("Current user ID from useCOntext:", user);

  const isOwner = !!currentUserId && team?.owner?.id === currentUserId;

  const getErrorMessage = (err: unknown, fallback: string) => {
    if (axios.isAxiosError(err)) {
      return (
        err.response?.data?.message || err.response?.data?.error || fallback
      );
    }

    return fallback;
  };

  const loadTeam = useCallback(async () => {
    if (!teamId) {
      setError("Invalid team ID.");
      setTeam(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const data = await getTeamById(teamId);
      setTeam(data);
    } catch (err: unknown) {
      setTeam(null);
      setError(getErrorMessage(err, "Unable to load team details."));
    } finally {
      setLoading(false);
    }
  }, [teamId]);

  useEffect(() => {
    void loadTeam();
  }, [loadTeam]);

  const handleAddMember = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      setError("Please enter the member's email address.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    try {
      setError("");
      setSuccess("");
      setIsAdding(true);

      await addTeamMember(teamId!, {
        email: normalizedEmail,
        role,
      });

      setEmail("");
      setRole("MEMBER");
      setSuccess("Team member added successfully.");

      await loadTeam();
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Unable to add team member."));
    } finally {
      setIsAdding(false);
    }
  };

  const handleRemoveMember = async (userId: string, memberName: string) => {
    const confirmed = window.confirm(
      `Are you sure you want to remove ${memberName} from this team?`,
    );

    if (!confirmed) return;

    try {
      setError("");
      setSuccess("");
      setRemovingUserId(userId);

      await removeTeamMember(teamId!, userId);

      setSuccess(`${memberName} has been removed from the team.`);
      await loadTeam();
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Unable to remove team member."));
    } finally {
      setRemovingUserId(null);
    }
  };

  if (loading) {
    return (
      <main className="flex min-h-96 items-center justify-center">
        <div className="text-center">
          <LoaderCircle
            size={36}
            className="mx-auto animate-spin text-indigo-600"
          />
          <p className="mt-4 text-sm text-slate-500">Loading team details...</p>
        </div>
      </main>
    );
  }

  if (error && !team) {
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
          <p className="mt-2 text-sm text-red-600">{error}</p>

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

  if (!team) return null;

  const members = team.members ?? [];
  const memberCount = team._count?.members ?? members.length;
  const taskCount = team._count?.tasks ?? 0;
  const createdDate = new Date(team.createdAt);

  console.log("Team details:", team);

  return (
    <main className="mx-auto max-w-6xl p-5 md:p-8">
      <Link
        to="/teams"
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-indigo-600"
      >
        <ArrowLeft size={18} />
        Back to teams
      </Link>

      {/* Team header */}
      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-start">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-700">
              <Users size={28} />
            </div>

            <div>
              <p className="text-sm font-semibold text-indigo-600">
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

          {isOwner && (
            <span className="inline-flex w-fit items-center gap-2 rounded-full bg-violet-50 px-3 py-1.5 text-sm font-medium text-violet-700">
              <Shield size={15} />
              Team owner
            </span>
          )}
        </div>

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
            <p>
              Owner:{" "}
              <span className="font-medium text-slate-700">
                {team.owner.name}
              </span>
            </p>
          )}
        </div>
      </section>

      {/* API feedback */}
      {(error || success) && (
        <div
          role="status"
          className={`mt-6 rounded-xl border p-4 text-sm ${
            error
              ? "border-red-200 bg-red-50 text-red-700"
              : "border-emerald-200 bg-emerald-50 text-emerald-700"
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <p>{error || success}</p>
            <button
              type="button"
              onClick={() => {
                setError("");
                setSuccess("");
              }}
              className="font-semibold"
              aria-label="Dismiss message"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Add member form — owner only */}
      {isOwner && (
        <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-indigo-50 p-3 text-indigo-600">
              <UserPlus size={22} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Add team member
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Invite an existing registered user to this workspace.
              </p>
            </div>
          </div>

          <form
            onSubmit={handleAddMember}
            className="mt-6 grid gap-4 md:grid-cols-[minmax(0,1fr)_180px_auto]"
          >
            <div>
              <label
                htmlFor="memberEmail"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Email address
              </label>
              <div className="relative">
                <Mail
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  id="memberEmail"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="colleague@example.com"
                  required
                  disabled={isAdding}
                  className="w-full rounded-xl border border-slate-300 py-3 pl-10 pr-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:bg-slate-50"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="memberRole"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Member role
              </label>
              <select
                id="memberRole"
                value={role}
                onChange={(event) => setRole(event.target.value as MemberRole)}
                disabled={isAdding}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:bg-slate-50"
              >
                <option value="MEMBER">Member</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                disabled={isAdding || !email.trim()}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60 md:w-auto"
              >
                {isAdding ? (
                  <LoaderCircle size={17} className="animate-spin" />
                ) : (
                  <Plus size={17} />
                )}
                {isAdding ? "Adding..." : "Add member"}
              </button>
            </div>
          </form>
        </section>
      )}

      {/* Members list */}
      <section className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
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
              There are currently no member records to display.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {members.map((member) => {
              const name = member.user?.name || "Unknown user";
              const memberEmail = member.user?.email || "No email available";
              const isRemoving = removingUserId === member.userId;

              return (
                <div
                  key={member.id}
                  className="flex flex-wrap items-center justify-between gap-4 p-5 transition hover:bg-slate-50"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-indigo-100 font-semibold text-indigo-700">
                      {name.trim().charAt(0).toUpperCase()}
                    </div>

                    <div className="min-w-0">
                      <p className="truncate font-semibold text-slate-900">
                        {name}
                      </p>
                      <p className="mt-1 truncate text-sm text-slate-500">
                        {memberEmail}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
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

                    {isOwner && member.role !== "OWNER" && (
                      <button
                        type="button"
                        onClick={() =>
                          void handleRemoveMember(member.userId, name)
                        }
                        disabled={removingUserId !== null}
                        title={`Remove ${name}`}
                        aria-label={`Remove ${name} from team`}
                        className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {isRemoving ? (
                          <LoaderCircle size={16} className="animate-spin" />
                        ) : (
                          <Trash2 size={16} />
                        )}
                        <span className="hidden sm:inline">
                          {isRemoving ? "Removing..." : "Remove"}
                        </span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
