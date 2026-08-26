import { useAuth } from "../../hooks/UseAuth";
import ContentPanel from "./ContentPanel";
import LeftPanel from "./LeftPanel";

const Dashboard = () => {
  return (
    <div className="flex min-h-screen w-full ">
      <LeftPanel />
      <ContentPanel />
    </div>
  );
};

export default Dashboard;
