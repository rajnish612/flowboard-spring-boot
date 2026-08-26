import { useAuth } from "../../hooks/UseAuth";
import ContentPanel from "./ContentPanel";
import LeftPanel from "./LeftPanel";

const Dashboard = () => {
  const { user } = useAuth();
  console.log("user info in dashboard", user);

  return (
    <div className="flex min-h-screen w-full ">
      <LeftPanel />
      <ContentPanel />
    </div>
  );
};

export default Dashboard;
