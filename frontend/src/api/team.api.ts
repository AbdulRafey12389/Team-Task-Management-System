import api from "./axios";

import type {
  CreateTeamInput,
  Team,
  UpdateTeamInput,
} from "../types/team.types";

export const getTeams = async (): Promise<Team[]> => {
  const response = await api.get("/teams");
  return response.data.teams;
};

export const getTeamById = async (teamId: string): Promise<Team> => {
  const response = await api.get<Team>(`/teams/${teamId}`);
  return response.data;
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
