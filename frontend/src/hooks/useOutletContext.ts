import { useOutletContext } from "react-router";
export type Workspace = {
  id?: number;
  name: string;
  ownerId: number;
  createdAt?: string;
  updatedAt?: string;
};

type Member = {
  id: number;
  userId: number;
  name: string;
  email: string;
  avatar?: string | null;
  role?: "OWNER" | "MEMBER";
};

export type ContentPanelContext = {
  workspace: Workspace | null;
  setWorkspace: React.Dispatch<React.SetStateAction<Workspace | null>>;
  refreshWorkspace: () => void;
  members: Member[];
  setMembers: React.Dispatch<React.SetStateAction<Member[]>>;
  membersLoading: boolean;
};

// Helper hook for child routes
export const useWorkspaceContext = () => {
  return useOutletContext<ContentPanelContext>();
};
