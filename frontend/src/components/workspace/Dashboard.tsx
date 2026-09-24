import { useState } from "react";
import ContentPanel from "./ContentPanel";
import LeftPanel from "./LeftPanel";

const Dashboard = () => {
  const [isMobileOpen, setIsMobileOpen] = useState<boolean>(false);

  return (
    <div className="flex h-screen min-h-0 w-full overflow-hidden bg-slate-50 text-slate-800">
      <LeftPanel
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />
      <ContentPanel
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />
    </div>
  );
};

export default Dashboard;
