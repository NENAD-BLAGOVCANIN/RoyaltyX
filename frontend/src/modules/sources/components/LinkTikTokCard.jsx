import { useEffect } from "react";
import { appUrl, tiktokClientId } from "../../common/api/config";
import tiktokLogo from "../../common/assets/img/platform_logos/tiktok.webp";
import { Typography, Card, Button, Grid, Box } from "@mui/material";
import { requestAccessTokenFromTikTok } from "../api/tiktok";

const openTikTokOAuthPopup = () => {
  const redirectUri = `${appUrl}/tiktok-oauth-callback`;

  const scope = "user.info.basic,video.list";
  const state = "tiktok-oauth";
  const oauthUrl = `https://www.tiktok.com/v2/auth/authorize?client_key=${tiktokClientId}&redirect_uri=${encodeURIComponent(
    redirectUri
  )}&response_type=code&scope=${encodeURIComponent(scope)}&state=${state}`;

  const width = 500;
  const height = 600;
  const left = (window.innerWidth - width) / 2;
  const top = (window.innerHeight - height) / 2;

  window.open(
    oauthUrl,
    "TikTokOAuth",
    `width=${width},height=${height},top=${top},left=${left}`
  );
};

export const LinkTikTokCard = ({ createSource }) => {
  useEffect(() => {
    const handleMessage = async (event) => {
      if (event.origin !== window.location.origin) return;

      if (event.data?.source === "tiktok-oauth" && event.data.code) {
        const authCode = event.data.code;
        const tokenData = await requestAccessTokenFromTikTok(authCode);
        const expiresAt = Date.now() + tokenData.expires_in * 1000;
        const source = {
          account_name: "Account Name",
          platform: "tiktok",
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
              src={tiktokLogo}
              alt="TikTok Logo"
              style={{ height: "70px", objectFit: "contain", marginBottom: 10 }}
            />
            <Typography variant="h6" sx={{ fontWeight: "bold", mb: 1 }}>
              TikTok
            </Typography>
            <Typography variant="bodySm" sx={{ color: "text.secondary" }}>
              Connect your TikTok account to analyze video performance, audience
              engagement, and optimize your content strategy for better reach.
            </Typography>
          </Box>

          <Button
            variant="outlined"
            sx={{ mt: 3 }}
            onClick={openTikTokOAuthPopup}
            fullWidth
          >
            Link TikTok
          </Button>
        </Box>
      </Card>
    </Grid>
  );
};
