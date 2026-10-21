import api from "./axios";

import type {
  CreateTeamInput,
  Team,
  UpdateTeamInput,
} from "../types/team.types";

export type AddTeamMemberInput = {
  email: string;
  role: "ADMIN" | "MEMBER";
};

export const addTeamMember = async (
  teamId: string,
  data: AddTeamMemberInput,
) => {
  const response = await api.post(`/teams/${teamId}/members`, data);

  return response.data;
};

export const removeTeamMember = async (teamId: string, userId: string) => {
  const response = await api.delete(`/teams/${teamId}/members/${userId}`);

  return response.data;
};

export const getTeams = async (): Promise<Team[]> => {
  const response = await api.get("/teams");
  return response.data.teams;
};

export const getTeamById = async (teamId: string): Promise<Team> => {
  const response = await api.get(`/teams/${teamId}`);
  return response.data.team;
};

export const createTeam = async (data: CreateTeamInput): Promise<Team> => {
  const response = await api.post<Team>("/teams", data);

  return response.data;
};

export const updateTeam = async (
  teamId: string,
  data: UpdateTeamInput,
): Promise<Team> => {
  const response = await api.patch<Team>(`/teams/${teamId}`, data);
  return response.data;
};

export const deleteTeam = async (teamId: string): Promise<void> => {
  await api.delete(`/teams/${teamId}`);
};
