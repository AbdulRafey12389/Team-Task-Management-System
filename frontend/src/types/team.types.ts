export type TeamRole = "OWNER" | "ADMIN" | "MEMBER";

export interface TeamMember {
  id: string;
  userId: string;
  teamId: string;
  role: TeamRole;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

export interface Team {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  members?: TeamMember[];
  owner?: {
    id: string;
    name: string;
    email: string;
  };
  _count?: {
    members: number;
    tasks: number;
  };
}

export interface CreateTeamInput {
  name: string;
  description?: string;
}

export interface UpdateTeamInput {
  name?: string;
  description?: string | null;
}
