import { useEffect } from "react";
import { appUrl, googleClientId } from "../../common/api/config";
import youtubeLogo from "../../common/assets/img/platform_logos/youtube.webp";
import { Typography, Card, Button, Grid, Box } from "@mui/material";
import { requestAccessTokenFromGoogle } from "../api/google";

const openGoogleOAuthPopup = () => {
  const redirectUri = `${appUrl}/google-oauth-callback`;
  const scope =
    "https://www.googleapis.com/auth/yt-analytics.readonly https://www.googleapis.com/auth/youtube.readonly";
  const oauthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${googleClientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}&access_type=offline&prompt=consent`;

  const width = 500;
  const height = 600;
  const left = (window.innerWidth - width) / 2;
  const top = (window.innerHeight - height) / 2;

  window.open(
    oauthUrl,
    "GoogleOAuth",
    `width=${width},height=${height},top=${top},left=${left}`
  );
};

export const LinkYoutubeCard = ({ createSource }) => {
  useEffect(() => {
    const handleMessage = async (event) => {
      if (event.origin !== window.location.origin) return; // for security

      if (event.data?.source === "google-oauth" && event.data.code) {
        const authCode = event.data.code;
        const googleTokenData = await requestAccessTokenFromGoogle(authCode);
        const expiresAt = Date.now() + googleTokenData.expires_in * 1000;
        const source = {
          account_name: "Account Name",
          platform: "youtube",
          access_token: googleTokenData.access_token,
          refresh_token: googleTokenData.refresh_token,
          token_expires_at: new Date(expiresAt).toISOString(),
        };
        try {
          await createSource(source);
        } catch (error) {
          console.error("Error creating data source:", error);
        }
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  return (
    <Grid size={{ xs: 12, md: 4 }}>
      <Card sx={{ p: 3, borderRadius: 2, boxShadow: 2, height: "100%", mt: 1 }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            height: "100%",
          }}
        >
          <Box>
            <img
              src={youtubeLogo}
              alt="YouTube Logo"
              style={{ height: "70px", objectFit: "contain", marginBottom: 10 }}
            />
            <Typography variant="h6" sx={{ fontWeight: "bold", mb: 1 }}>
              YouTube
            </Typography>
            <Typography variant="bodySm" sx={{ color: "text.secondary" }}>
              Link your YouTube account to fetch analytics data. This will allow
              you to monitor your channel's performance and gain insights into
              your audience.
            </Typography>
          </Box>

          <Button
            variant="outlined"
            sx={{ mt: 3 }}
            onClick={openGoogleOAuthPopup}
            fullWidth
          >
            Link YouTube
          </Button>
        </Box>
      </Card>
    </Grid>
  );
};
