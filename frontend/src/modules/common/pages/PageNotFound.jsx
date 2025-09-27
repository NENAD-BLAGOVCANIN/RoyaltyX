import { 
  Box, 
  Container, 
  Typography, 
  Button, 
  Paper,
  Stack,
  useTheme
} from "@mui/material";
import { Home, ErrorOutline } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

function PageNotFound() {
  const theme = useTheme();
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.palette.background.default,
        padding: 2,
      }}
    >
      <Container maxWidth="md">
        <Paper
          elevation={3}
          sx={{
            padding: { xs: 4, md: 6 },
            textAlign: 'center',
            borderRadius: 3,
            backgroundColor: theme.palette.background.paper,
          }}
        >
          <Stack spacing={4} alignItems="center">
            {/* 404 Display */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 2,
                flexWrap: 'wrap',
              }}
            >
              <Typography
                variant="h1"
                sx={{
                  fontSize: { xs: '4rem', md: '6rem' },
                  fontWeight: 'bold',
                  color: theme.palette.primary.main,
                  lineHeight: 1,
                }}
              >
                4
              </Typography>
              <ErrorOutline
                sx={{
                  fontSize: { xs: '3rem', md: '4rem' },
                  color: theme.palette.error.main,
                }}
              />
              <Typography
                variant="h1"
                sx={{
                  fontSize: { xs: '4rem', md: '6rem' },
                  fontWeight: 'bold',
                  color: theme.palette.primary.main,
                  lineHeight: 1,
                }}
              >
                4
              </Typography>
            </Box>

            {/* Error Message */}
            <Stack spacing={2} alignItems="center">
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 600,
                  color: theme.palette.text.primary,
                  fontSize: { xs: '1.5rem', md: '2rem' },
                }}
              >
                Oops! Page Not Found
              </Typography>
              <Typography
                variant="bodyMd"
                sx={{
                  color: theme.palette.text.secondary,
                  fontSize: { xs: '1rem', md: '1.1rem' },
                  maxWidth: '500px',
                  lineHeight: 1.6,
                }}
              >
                The page you're looking for doesn't exist or has been moved. 
                Don't worry, let's get you back on track.
              </Typography>
            </Stack>

            {/* Action Buttons */}
            <Stack 
              direction={{ xs: 'column', sm: 'row' }} 
              spacing={2}
              sx={{ mt: 4 }}
            >
              <Button
                variant="contained"
                size="large"
                startIcon={<Home />}
                onClick={handleGoHome}
                sx={{
                  paddingX: 4,
                  paddingY: 1.5,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontSize: '1rem',
                  fontWeight: 500,
                }}
              >
                Back to Dashboard
              </Button>
              <Button
                variant="outlined"
                size="large"
                onClick={() => window.history.back()}
                sx={{
                  paddingX: 4,
                  paddingY: 1.5,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontSize: '1rem',
                  fontWeight: 500,
                }}
              >
                Go Back
              </Button>
            </Stack>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
}

export default PageNotFound;
