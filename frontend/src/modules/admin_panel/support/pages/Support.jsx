import { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  MenuItem,
  InputAdornment,
  IconButton,
  Menu,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
  Container,
} from "@mui/material";
import {
  Search,
  MessageSquare,
  UserCheck,
  HelpCircle,
  TrendingUp,
  Users,
  Timer,
  MoreVertical,
} from "lucide-react";
import { toast } from "react-toastify";
import {
  useAdminTickets,
  useAdminSupportStats,
  useTakeTicket,
  useUpdateTicketStatus,
} from "../../../support/api/support";

function Support() {
  const [filters, setFilters] = useState({
    status: "",
    priority: "",
    assignment: "",
    search: "",
  });
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [statusDialog, setStatusDialog] = useState(false);
  const [newStatus, setNewStatus] = useState("");

  // Use hooks for data fetching
  const {
    tickets,
    error: ticketsError,
    refetch: refetchTickets,
  } = useAdminTickets(filters);
  const {
    stats,
    error: statsError,
    refetch: refetchStats,
  } = useAdminSupportStats();
  const { takeTicket, error: takeError } = useTakeTicket(selectedTicket?.id);
  const { updateTicket, error: updateError } = useUpdateTicketStatus(
    selectedTicket?.id
  );

  useEffect(() => {
    if (ticketsError) {
      toast.error("Failed to load tickets");
      console.error("Error fetching tickets:", ticketsError);
    }
    if (statsError) {
      toast.error("Failed to load support stats");
      console.error("Error fetching stats:", statsError);
    }
    if (takeError) {
      toast.error("Failed to take ticket");
      console.error("Error taking ticket:", takeError);
    }
    if (updateError) {
      toast.error("Failed to update ticket status");
      console.error("Error updating status:", updateError);
    }
  }, [ticketsError, statsError, takeError, updateError]);

  const handleTakeTicket = async (_ticketId) => {
    try {
      await takeTicket();
      toast.success("Ticket assigned to you successfully!");
      refetchTickets();
      refetchStats();
      handleMenuClose();
    } catch (error) {
      toast.error("Failed to take ticket");
      console.error("Error taking ticket:", error);
    }
  };

  const handleStatusUpdate = async () => {
    try {
      await updateTicket({ status: newStatus });
      toast.success("Ticket status updated successfully!");
      setStatusDialog(false);
      setSelectedTicket(null);
      setNewStatus("");
      refetchTickets();
      refetchStats();
    } catch (error) {
      toast.error("Failed to update ticket status");
      console.error("Error updating status:", error);
    }
  };

  const handleMenuClick = (event, ticket) => {
    setAnchorEl(event.currentTarget);
    setSelectedTicket(ticket);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedTicket(null);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "open":
        return "warning";
      case "in_progress":
        return "info";
      case "resolved":
        return "success";
      case "closed":
        return "default";
      default:
        return "default";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "urgent":
        return "error";
      case "high":
        return "warning";
      case "medium":
        return "info";
      case "low":
        return "default";
      default:
        return "default";
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Container>
      <Typography variant="h4" sx={{ mt: 4, mb: 3 }}>
        Support Tickets
      </Typography>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent sx={{ display: "flex", alignItems: "center", p: 2 }}>
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="h4" sx={{ fontWeight: 600 }}>
                  {stats.total_tickets || 0}
                </Typography>
                <Typography variant="bodySm" color="text.secondary">
                  Total Tickets
                </Typography>
              </Box>
              <TrendingUp size={32} color="var(--mui-palette-primary-main)" />
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent sx={{ display: "flex", alignItems: "center", p: 2 }}>
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="h4" sx={{ fontWeight: 600 }}>
                  {stats.open_tickets || 0}
                </Typography>
                <Typography variant="bodySm" color="text.secondary">
                  Open Tickets
                </Typography>
              </Box>
              <HelpCircle size={32} color="var(--mui-palette-warning-main)" />
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent sx={{ display: "flex", alignItems: "center", p: 2 }}>
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="h4" sx={{ fontWeight: 600 }}>
                  {stats.unassigned_tickets || 0}
                </Typography>
                <Typography variant="bodySm" color="text.secondary">
                  Unassigned
                </Typography>
              </Box>
              <Users size={32} color="var(--mui-palette-info-main)" />
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent sx={{ display: "flex", alignItems: "center", p: 2 }}>
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="h4" sx={{ fontWeight: 600 }}>
                  {stats.my_tickets || 0}
                </Typography>
                <Typography variant="bodySm" color="text.secondary">
                  My Tickets
                </Typography>
              </Box>
              <UserCheck size={32} color="var(--mui-palette-success-main)" />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField
                fullWidth
                placeholder="Search tickets..."
                value={filters.search}
                onChange={(e) =>
                  setFilters({ ...filters, search: e.target.value })
                }
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search size={20} />
                    </InputAdornment>
                  ),
                }}
                size="small"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4, md: 2 }}>
              <TextField
                select
                fullWidth
                label="Status"
                value={filters.status}
                onChange={(e) =>
                  setFilters({ ...filters, status: e.target.value })
                }
                size="small"
              >
                <MenuItem value="">All Statuses</MenuItem>
                <MenuItem value="open">Open</MenuItem>
                <MenuItem value="in_progress">In Progress</MenuItem>
                <MenuItem value="resolved">Resolved</MenuItem>
                <MenuItem value="closed">Closed</MenuItem>
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 4, md: 2 }}>
              <TextField
                select
                fullWidth
                label="Priority"
                value={filters.priority}
                onChange={(e) =>
                  setFilters({ ...filters, priority: e.target.value })
                }
                size="small"
              >
                <MenuItem value="">All Priorities</MenuItem>
                <MenuItem value="urgent">Urgent</MenuItem>
                <MenuItem value="high">High</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="low">Low</MenuItem>
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 4, md: 2 }}>
              <TextField
                select
                fullWidth
                label="Assignment"
                value={filters.assignment}
                onChange={(e) =>
                  setFilters({ ...filters, assignment: e.target.value })
                }
                size="small"
              >
                <MenuItem value="">All Tickets</MenuItem>
                <MenuItem value="unassigned">Unassigned</MenuItem>
                <MenuItem value="my_tickets">My Tickets</MenuItem>
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <Button
                variant="outlined"
                fullWidth
                onClick={() =>
                  setFilters({
                    status: "",
                    priority: "",
                    assignment: "",
                    search: "",
                  })
                }
              >
                Clear Filters
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Tickets Table */}
      <Card>
        <CardContent sx={{ p: 0 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Ticket</TableCell>
                  <TableCell>Customer</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Priority</TableCell>
                  <TableCell>Assigned To</TableCell>
                  <TableCell>Created</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {tickets.map((ticket) => (
                  <TableRow key={ticket.id} hover>
                    <TableCell>
                      <Box>
                        <Typography
                          variant="subtitle2"
                          sx={{ fontWeight: 500 }}
                        >
                          {ticket.subject}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {ticket.ticket_number}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <Avatar
                          src={ticket.customer?.avatar}
                          sx={{ width: 32, height: 32 }}
                        />
                        <Box sx={{ display: "flex", flexDirection: "column" }}>
                          <Typography variant="bodySm" sx={{ fontWeight: 500 }}>
                            {ticket.customer?.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {ticket.customer?.email}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={
                          ticket.status.charAt(0).toUpperCase() +
                          ticket.status.slice(1)
                        }
                        color={getStatusColor(ticket.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={
                          ticket.priority.charAt(0).toUpperCase() +
                          ticket.priority.slice(1)
                        }
                        color={getPriorityColor(ticket.priority)}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      {ticket.assigned_admin ? (
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <Avatar
                            src={ticket.assigned_admin?.avatar}
                            sx={{ width: 24, height: 24 }}
                          />
                          <Typography variant="bodySm">
                            {ticket.assigned_admin?.name}
                          </Typography>
                        </Box>
                      ) : (
                        <Chip
                          label="Unassigned"
                          size="small"
                          variant="outlined"
                        />
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography variant="bodySm">
                        {formatDate(ticket.created_at)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        onClick={(e) => handleMenuClick(e, ticket)}
                        size="small"
                      >
                        <MoreVertical size={16} />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {tickets.length === 0 && (
            <Box sx={{ p: 4, textAlign: "center" }}>
              <HelpCircle size={48} color="gray" style={{ marginBottom: 16 }} />
              <Typography variant="h6" color="text.secondary">
                No tickets found
              </Typography>
              <Typography variant="bodySm" color="text.secondary">
                Try adjusting your filters or check back later
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem
          onClick={() =>
            window.open(
              `/admin/support/tickets/${selectedTicket?.id}`,
              "_blank"
            )
          }
        >
          <MessageSquare size={16} style={{ marginRight: 8 }} />
          View Conversation
        </MenuItem>
        {!selectedTicket?.assigned_admin && (
          <MenuItem onClick={() => handleTakeTicket(selectedTicket?.id)}>
            <UserCheck size={16} style={{ marginRight: 8 }} />
            Take Ticket
          </MenuItem>
        )}
        <MenuItem
          onClick={() => {
            setNewStatus(selectedTicket?.status || "");
            setStatusDialog(true);
            handleMenuClose();
          }}
        >
          <Timer size={16} style={{ marginRight: 8 }} />
          Update Status
        </MenuItem>
      </Menu>

      {/* Status Update Dialog */}
      <Dialog
        open={statusDialog}
        onClose={() => setStatusDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Update Ticket Status</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              select
              fullWidth
              label="Status"
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
            >
              <MenuItem value="open">Open</MenuItem>
              <MenuItem value="in_progress">In Progress</MenuItem>
              <MenuItem value="resolved">Resolved</MenuItem>
              <MenuItem value="closed">Closed</MenuItem>
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStatusDialog(false)}>Cancel</Button>
          <Button
            onClick={handleStatusUpdate}
            variant="contained"
            disabled={!newStatus || newStatus === selectedTicket?.status}
          >
            Update Status
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default Support;
