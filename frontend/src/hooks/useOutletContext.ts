import { useOutletContext } from "react-router";
export type Workspace = {
  id?: number;
  name: string;
  ownerId: number;
  createdAt?: string;
  updatedAt?: string;
};

export type ContentPanelContext = {
  workspace: Workspace | null;
  setWorkspace: React.Dispatch<React.SetStateAction<Workspace | null>>;
  refreshWorkspace: () => void;
};

// Helper hook for child routes
export const useWorkspaceContext = () => {
  return useOutletContext<ContentPanelContext>();
};
