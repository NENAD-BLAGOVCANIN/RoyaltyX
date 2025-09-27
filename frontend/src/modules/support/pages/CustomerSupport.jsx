import { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Fab,
  Paper,
  Divider,
} from "@mui/material";
import {
  Plus,
  MessageSquare,
  Clock,
  CheckCircle,
  AlertCircle,
  HelpCircle,
} from "lucide-react";
import { toast } from "react-toastify";
import {
  useCustomerTickets,
  useCreateSupportTicket,
  useCustomerSupportStats,
} from "../api/support";

function CustomerSupport() {
  const [createTicketDialog, setCreateTicketDialog] = useState(false);
  const [newTicket, setNewTicket] = useState({
    subject: "",
    priority: "medium",
    initial_message: "",
  });

  // Use hooks for data fetching
  const { tickets, loading: ticketsLoading, error: ticketsError, refetch: refetchTickets } = useCustomerTickets();
  const { stats, loading: statsLoading, error: statsError, refetch: refetchStats } = useCustomerSupportStats();
  const { createTicket, loading: _creatingTicket, error: createError } = useCreateSupportTicket();

  const loading = ticketsLoading || statsLoading;

  useEffect(() => {
    if (ticketsError) {
      toast.error("Failed to load tickets");
      console.error("Error fetching tickets:", ticketsError);
    }
    if (statsError) {
      toast.error("Failed to load support stats");
      console.error("Error fetching stats:", statsError);
    }
    if (createError) {
      toast.error("Failed to create support ticket");
      console.error("Error creating ticket:", createError);
    }
  }, [ticketsError, statsError, createError]);

  const handleCreateTicket = async () => {
    try {
      if (!newTicket.subject.trim() || !newTicket.initial_message.trim()) {
        toast.error("Please fill in all required fields");
        return;
      }

      await createTicket(newTicket);
      toast.success("Support ticket created successfully!");
      setCreateTicketDialog(false);
      setNewTicket({
        subject: "",
        priority: "medium",
        initial_message: "",
      });
      // Refetch data to show the new ticket
      refetchTickets();
      refetchStats();
    } catch (error) {
      toast.error("Failed to create support ticket");
      console.error("Error creating ticket:", error);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "open":
        return <HelpCircle size={16} color="orange" />;
      case "in_progress":
        return <Clock size={16} color="blue" />;
      case "resolved":
        return <CheckCircle size={16} color="green" />;
      case "closed":
        return <AlertCircle size={16} color="gray" />;
      default:
        return <HelpCircle size={16} color="gray" />;
    }
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

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: "auto" }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 4,
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          Customer Support
        </Typography>
        <Button
          variant="contained"
          startIcon={<Plus />}
          onClick={() => setCreateTicketDialog(true)}
        >
          New Ticket
        </Button>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent sx={{ textAlign: "center", p: 2 }}>
              <Typography
                variant="h4"
                sx={{ fontWeight: 600, color: "primary.main" }}
              >
                {stats.total_tickets || 0}
              </Typography>
              <Typography variant="bodySm" color="text.secondary">
                Total Tickets
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent sx={{ textAlign: "center", p: 2 }}>
              <Typography
                variant="h4"
                sx={{ fontWeight: 600, color: "warning.main" }}
              >
                {stats.open_tickets || 0}
              </Typography>
              <Typography variant="bodySm" color="text.secondary">
                Open Tickets
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent sx={{ textAlign: "center", p: 2 }}>
              <Typography
                variant="h4"
                sx={{ fontWeight: 600, color: "success.main" }}
              >
                {stats.resolved_tickets || 0}
              </Typography>
              <Typography variant="bodySm" color="text.secondary">
                Resolved
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent sx={{ textAlign: "center", p: 2 }}>
              <Typography
                variant="h4"
                sx={{ fontWeight: 600, color: "text.secondary" }}
              >
                {stats.closed_tickets || 0}
              </Typography>
              <Typography variant="bodySm" color="text.secondary">
                Closed
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tickets List */}
      <Card>
        <CardContent sx={{ p: 0 }}>
          {tickets.length > 0 ? (
            <List sx={{ p: 0 }}>
              {tickets.map((ticket, index) => (
                <Box key={ticket.id}>
                  <ListItem
                    sx={{
                      px: 3,
                      py: 2,
                      "&:hover": {
                        backgroundColor: "action.hover",
                      },
                    }}
                  >
                    <ListItemText
                      primary={
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            mb: 1,
                          }}
                        >
                          <Typography
                            variant="subtitle1"
                            sx={{ fontWeight: 500 }}
                          >
                            {ticket.subject}
                          </Typography>
                          <Chip
                            label={ticket.ticket_number}
                            size="small"
                            variant="outlined"
                            sx={{ fontSize: "0.75rem" }}
                          />
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography
                            variant="bodySm"
                            color="text.secondary"
                            sx={{ mb: 1 }}
                          >
                            {ticket.last_message?.content || "No messages yet"}
                          </Typography>
                          <Box
                            sx={{
                              display: "flex",
                              gap: 1,
                              alignItems: "center",
                            }}
                          >
                            <Chip
                              icon={getStatusIcon(ticket.status)}
                              label={
                                ticket.status.charAt(0).toUpperCase() +
                                ticket.status.slice(1)
                              }
                              color={getStatusColor(ticket.status)}
                              size="small"
                            />
                            <Chip
                              label={
                                ticket.priority.charAt(0).toUpperCase() +
                                ticket.priority.slice(1)
                              }
                              color={getPriorityColor(ticket.priority)}
                              size="small"
                              variant="outlined"
                            />
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {formatDate(ticket.created_at)}
                            </Typography>
                          </Box>
                        </Box>
                      }
                    />
                    <ListItemSecondaryAction>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<MessageSquare size={16} />}
                        href={`/support/tickets/${ticket.id}`}
                      >
                        View
                      </Button>
                    </ListItemSecondaryAction>
                  </ListItem>
                  {index < tickets.length - 1 && <Divider />}
                </Box>
              ))}
            </List>
          ) : (
            <Paper
              elevation={0}
              sx={{
                p: 6,
                textAlign: "center",
              }}
            >
              <HelpCircle size={48} color="gray" style={{ marginBottom: 16 }} />
              <Typography variant="h6" gutterBottom>
                No support tickets yet
              </Typography>
              <Typography variant="bodySm" color="text.secondary" sx={{ mb: 3 }}>
                Create your first support ticket to get help from our team
              </Typography>

              <Box sx={{ mt: 3}}>
                <Button
                  variant="contained"
                  startIcon={<Plus />}
                  onClick={() => setCreateTicketDialog(true)}
                >
                  Create Ticket
                </Button>
              </Box>
            </Paper>
          )}
        </CardContent>
      </Card>

      {/* Floating Action Button for mobile */}
      <Fab
        color="primary"
        aria-label="add"
        sx={{
          position: "fixed",
          bottom: 16,
          right: 16,
          display: { xs: "flex", sm: "none" },
        }}
        onClick={() => setCreateTicketDialog(true)}
      >
        <Plus />
      </Fab>

      {/* Create Ticket Dialog */}
      <Dialog
        open={createTicketDialog}
        onClose={() => setCreateTicketDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Create Support Ticket</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Subject"
              value={newTicket.subject}
              onChange={(e) =>
                setNewTicket({ ...newTicket, subject: e.target.value })
              }
              sx={{ mb: 2 }}
              required
            />
            <TextField
              select
              fullWidth
              label="Priority"
              value={newTicket.priority}
              onChange={(e) =>
                setNewTicket({ ...newTicket, priority: e.target.value })
              }
              sx={{ mb: 2 }}
            >
              <MenuItem value="low">Low</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="high">High</MenuItem>
              <MenuItem value="urgent">Urgent</MenuItem>
            </TextField>
            <TextField
              fullWidth
              label="Message"
              multiline
              rows={4}
              value={newTicket.initial_message}
              onChange={(e) =>
                setNewTicket({ ...newTicket, initial_message: e.target.value })
              }
              placeholder="Describe your issue in detail..."
              required
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateTicketDialog(false)}>Cancel</Button>
          <Button
            onClick={handleCreateTicket}
            variant="contained"
            disabled={
              !newTicket.subject.trim() || !newTicket.initial_message.trim()
            }
          >
            Create Ticket
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default CustomerSupport;
