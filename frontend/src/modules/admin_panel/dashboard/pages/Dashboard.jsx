import { useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Container,
  Paper,
  Skeleton,
} from "@mui/material";
import { Users, FolderOpen, Database, UserPlus, Activity } from "lucide-react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { toast } from "react-toastify";
import { useAdminDashboardStats } from "../../api/admin";
import { StatCard } from "../components/StatCard";
import { useNavigate } from "react-router";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

function Dashboard() {
  const { stats, loading, error } = useAdminDashboardStats();
  const navigate = useNavigate();

  useEffect(() => {
    if (error) {
      toast.error("Failed to load dashboard statistics");
      console.error("Error fetching dashboard stats:", error);
    }
  }, [error]);

  // Prepare chart data for users growth
  const chartData = {
    labels: stats?.users_growth_data?.map((item) => item.month_name) || [],
    datasets: [
      {
        label: "New Users",
        data: stats?.users_growth_data?.map((item) => item.count) || [],
        borderColor: "#1976d2",
        backgroundColor: "#1976d2aa",
        tension: 0.1,
        fill: true,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "User Growth Over Time",
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Typography variant="h4" sx={{ mb: 4, fontWeight: 600 }}>
          Admin Dashboard
        </Typography>
        <Grid container spacing={3}>
          {[1, 2, 3, 4].map((item) => (
            <Grid key={item} size={{ xs: 12, sm: 6, md: 3 }}>
              <Card>
                <CardContent>
                  <Skeleton variant="text" width="60%" height={24} />
                  <Skeleton variant="text" width="40%" height={40} />
                  <Skeleton variant="text" width="80%" height={20} />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    );
  }

  return (
    <Container>
      <Typography variant="h4" sx={{ mt: 4, mb: 3 }}>
        Admin Dashboard
      </Typography>

      {/* Main Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Total Users"
            value={stats?.total_users}
            icon={Users}
            color="#1976d2"
            trend={stats?.recent_activity?.new_users_last_30_days}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Total Projects"
            value={stats?.total_projects}
            icon={FolderOpen}
            color="#ed6c02"
            trend={stats?.recent_activity?.new_projects_last_30_days}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Total Sources"
            value={stats?.total_sources}
            icon={Database}
            color="#2e7d32"
            trend={stats?.recent_activity?.new_sources_last_30_days}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="New Users (30d)"
            value={stats?.recent_activity?.new_users_last_30_days}
            icon={UserPlus}
            color="#9c27b0"
            subtitle="Last 30 days"
          />
        </Grid>
      </Grid>

      {/* Charts Section */}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <Paper sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              User Growth Over Time
            </Typography>
            {stats?.users_growth_data?.length > 0 ? (
              <Box sx={{ height: 320 }}>
                <Line data={chartData} options={chartOptions} />
              </Box>
            ) : (
              <Box
                sx={{
                  height: 320,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "text.secondary",
                }}
              >
                <Typography>No user growth data available</Typography>
              </Box>
            )}
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, lg: 4 }}>
          <Paper sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
              Recent Activity
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Box
                sx={{
                  p: 2,
                  borderRadius: 2,
                  backgroundColor: "#1976d2",
                  color: "#fff",
                }}
              >
                <Typography variant="h4" sx={{ fontWeight: 600 }}>
                  {stats?.recent_activity?.new_users_last_30_days || 0}
                </Typography>
                <Typography variant="bodySm">
                  New users in last 30 days
                </Typography>
              </Box>

              <Box
                sx={{
                  p: 2,
                  borderRadius: 2,
                  backgroundColor: "#1976d2",
                  color: "#fff",
                }}
              >
                <Typography variant="h4" sx={{ fontWeight: 600 }}>
                  {stats?.recent_activity?.new_projects_last_30_days || 0}
                </Typography>
                <Typography variant="bodySm">
                  New projects in last 30 days
                </Typography>
              </Box>

              <Box
                sx={{
                  p: 2,
                  borderRadius: 2,
                  backgroundColor: "#1976d2",
                  color: "#fff",
                }}
              >
                <Typography variant="h4" sx={{ fontWeight: 600 }}>
                  {stats?.recent_activity?.new_sources_last_30_days || 0}
                </Typography>
                <Typography variant="bodySm">
                  New sources in last 30 days
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Quick Actions */}
      <Box sx={{ my: 4 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          Quick Actions
        </Typography>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card
              sx={{ cursor: "pointer", "&:hover": { boxShadow: 4 } }}
              onClick={() => navigate("/admin/users")}
            >
              <CardContent sx={{ textAlign: "center", py: 3 }}>
                <Users size={32} color="#1976d2" style={{ marginBottom: 8 }} />
                <Typography variant="h6">Manage Users</Typography>
                <Typography variant="bodySm" color="text.secondary">
                  View and manage user accounts
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card sx={{ cursor: "pointer", "&:hover": { boxShadow: 4 } }}>
              <CardContent sx={{ textAlign: "center", py: 3 }}>
                <FolderOpen
                  size={32}
                  color="#ed6c02"
                  style={{ marginBottom: 8 }}
                />
                <Typography variant="h6">View Projects</Typography>
                <Typography variant="bodySm" color="text.secondary">
                  Monitor project activity
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card sx={{ cursor: "pointer", "&:hover": { boxShadow: 4 } }}>
              <CardContent sx={{ textAlign: "center", py: 3 }}>
                <Database
                  size={32}
                  color="#2e7d32"
                  style={{ marginBottom: 8 }}
                />
                <Typography variant="h6">Data Sources</Typography>
                <Typography variant="bodySm" color="text.secondary">
                  Manage data connections
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card sx={{ cursor: "pointer", "&:hover": { boxShadow: 4 } }}>
              <CardContent sx={{ textAlign: "center", py: 3 }}>
                <Activity
                  size={32}
                  color="#9c27b0"
                  style={{ marginBottom: 8 }}
                />
                <Typography variant="h6">Analytics</Typography>
                <Typography variant="bodySm" color="text.secondary">
                  View detailed analytics
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
}

export default Dashboard;
