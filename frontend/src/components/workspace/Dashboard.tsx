import {
  useNotificationSocket,
  type NotificationSocketData,
} from "../../websocket/NotificationSocket";
import ContentPanel from "./ContentPanel";
import LeftPanel from "./LeftPanel";

const Dashboard = () => {
  useNotificationSocket((notification: NotificationSocketData) => {
    console.log("Received notification:", notification);

    // Update notification state, show toast, refresh badge, etc.
  });
  return (
    <div className="flex h-screen min-h-0 w-full overflow-hidden bg-slate-50 text-slate-800">
      <LeftPanel />
      <ContentPanel />
    </div>
  );
};

export default Dashboard;
