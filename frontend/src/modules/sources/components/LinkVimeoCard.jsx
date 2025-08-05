import { useEffect } from "react";
import { appUrl, vimeoClientId } from "../../common/api/config";
import vimeoLogo from "../../common/assets/img/platform_logos/vimeo.webp";
import { Typography, Card, Button, Grid, Box } from "@mui/material";
import { requestAccessTokenFromVimeo } from "../api/vimeo";

const a = "https://7b63d104c29d.ngrok-free.app"

const openVimeoOAuthPopup = () => {
    console.log(appUrl);
    
  const redirectUri = `${a}/vimeo-oauth-callback`;

  const scope = "public private";
  const state = "vimeo-oauth";
  const oauthUrl = `https://api.vimeo.com/oauth/authorize?client_id=${vimeoClientId}&redirect_uri=${encodeURIComponent(
    redirectUri
  )}&response_type=code&scope=${encodeURIComponent(scope)}&state=${state}`;

  const width = 500;
  const height = 600;
  const left = (window.innerWidth - width) / 2;
  const top = (window.innerHeight - height) / 2;

  window.open(
    oauthUrl,
    "VimeoOAuth",
    `width=${width},height=${height},top=${top},left=${left}`
  );
};

export const LinkVimeoCard = ({ createSource }) => {
  useEffect(() => {
    const handleMessage = async (event) => {
      if (event.origin !== window.location.origin) return;

      if (event.data?.source === "vimeo-oauth" && event.data.code) {
        const authCode = event.data.code;
        const tokenData = await requestAccessTokenFromVimeo(authCode);
        let tokenExpiresAt = null;
        if (tokenData.expires_in) {
          const expiresAt = Date.now() + tokenData.expires_in * 1000;
          tokenExpiresAt = new Date(expiresAt).toISOString();
        }
        
        const source = {
          account_name: "Account Name",
          platform: "vimeo",
          access_token: tokenData.access_token,
          refresh_token: tokenData.refresh_token,
          token_expires_at: tokenExpiresAt,
          channel_id: (tokenData.user?.uri || '').split('/').pop(),
          account_name: (tokenData.user?.name || ''),
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
            <Box>
            <img
              src={vimeoLogo}
              alt="Vimeo Logo"
              style={{ height: "70px", objectFit: "contain", marginBottom: 10 }}
            />
              <Typography variant="h6" sx={{ color: "white", fontWeight: "bold" }}>
                V
              </Typography>
            </Box>
            <Typography variant="h6" sx={{ fontWeight: "bold", mb: 1 }}>
              Vimeo
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              Connect your Vimeo account to analyze video performance, audience
              engagement, and optimize your content strategy for better reach.
            </Typography>
          </Box>

          <Button
            variant="outlined"
            sx={{ mt: 3 }}
            onClick={openVimeoOAuthPopup}
            fullWidth
          >
            Link Vimeo
          </Button>
        </Box>
      </Card>
    </Grid>
  );
};
