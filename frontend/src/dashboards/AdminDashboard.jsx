import MasterDataManager from '../components/admin/MasterDataManager.jsx';
import LoginLogs from '../components/admin/LoginLogs.jsx';
import AdminReports from '../components/admin/AdminReports.jsx';
import AdminFeaturesManager from '../components/admin/AdminFeaturesManager.jsx';

const AdminDashboard = () => (
  <div className="space-y-6">
    <AdminReports />
    <AdminFeaturesManager />
    <div className="grid gap-6 lg:grid-cols-2">
      <MasterDataManager />
    </div>
    <LoginLogs />
  </div>
);

export default AdminDashboard;


