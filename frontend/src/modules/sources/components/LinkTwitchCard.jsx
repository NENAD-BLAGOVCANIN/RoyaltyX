import { useEffect } from "react";
import { appUrl, twitchClientId } from "../../common/api/config";
import twitchLogo from "../../common/assets/img/platform_logos/twitch.webp";
import { Typography, Card, Button, Grid, Box } from "@mui/material";
import { requestAccessTokenFromTwitch } from "../api/twitch";

const openTwitchOAuthPopup = () => {
  const redirectUri = `${appUrl}/twitch-oauth-callback`;

  const scope = "user:read:email channel:read:subscriptions";
  const state = "twitch-oauth";
  const oauthUrl = `https://id.twitch.tv/oauth2/authorize?client_id=${twitchClientId}&redirect_uri=${encodeURIComponent(
    redirectUri
  )}&response_type=code&scope=${encodeURIComponent(scope)}&state=${state}`;

  const width = 500;
  const height = 600;
  const left = (window.innerWidth - width) / 2;
  const top = (window.innerHeight - height) / 2;

  window.open(
    oauthUrl,
    "TwitchOAuth",
    `width=${width},height=${height},top=${top},left=${left}`
  );
};

export const LinkTwitchCard = ({ createSource }) => {
  useEffect(() => {
    const handleMessage = async (event) => {
      if (event.origin !== window.location.origin) return;

      if (event.data?.source === "twitch-oauth" && event.data.code) {
        const authCode = event.data.code;
        const tokenData = await requestAccessTokenFromTwitch(authCode);
        const expiresAt = Date.now() + tokenData.expires_in * 1000;
        const source = {
          account_name: "Twitch Account",
          platform: "twitch",
          access_token: tokenData.access_token,
          refresh_token: tokenData.refresh_token,
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
      <Card sx={{ p: 3, height: "100%", mt: 1 }}>
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
              src={twitchLogo}
              alt="Twitch Logo"
              style={{ height: "70px", objectFit: "contain", marginBottom: 10 }}
            />
            <Typography variant="h6" sx={{ fontWeight: "bold", mb: 1 }}>
              Twitch
            </Typography>
            <Typography variant="bodySm" sx={{ color: "text.secondary" }}>
              Link your Twitch account to track streaming analytics, viewer
              engagement, and monetization metrics.
            </Typography>
          </Box>
          <Button
            variant="outlined"
            sx={{ mt: 3 }}
            onClick={openTwitchOAuthPopup}
            fullWidth
          >
            Link Twitch
          </Button>
        </Box>
      </Card>
    </Grid>
  );
};
