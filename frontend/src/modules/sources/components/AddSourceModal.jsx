import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Grid,
  Typography,
  Card,
  Button,
  TextField,
  Box,
  Chip,
  InputAdornment,
} from "@mui/material";
import { useState } from "react";
import { LinkYoutubeCard } from "./LinkYoutubeCard";
import { LinkTikTokCard } from "./LinkTikTokCard";
import { LinkTwitchCard } from "./LinkTwitchCard";
import { LinkVimeoCard } from "./LinkVimeoCard";
import { LinkInstagramCard } from "./LinkInstagramCard";
import googleAdsLogo from "../../common/assets/img/platform_logos/google_ads.webp";
import amazonLogo from "../../common/assets/img/platform_logos/amazon.svg";
import patreonLogo from "../../common/assets/img/platform_logos/patreon.webp";
import appleAppStoreLogo from "../../common/assets/img/platform_logos/apple_app_store.png";
import googlePlayLogo from "../../common/assets/img/platform_logos/google_play.svg";
import spotifyLogo from "../../common/assets/img/platform_logos/spotify.svg";
import audibleLogo from "../../common/assets/img/platform_logos/audible.svg";
import temuLogo from "../../common/assets/img/platform_logos/temu.svg";
import { ReactComponent as FacebookLogo } from "../../common/assets/img/platform_logos/facebook.svg";
import { X, Search } from "lucide-react";

export const AddSourceModal = ({ open, onClose, createSource }) => {
  const [searchTerm, setSearchTerm] = useState("");

  // Define all sources with their data
  const allSources = [
    {
      name: "YouTube",
      component: <LinkYoutubeCard createSource={createSource} />,
      isCustomComponent: true,
    },
    {
      name: "Google Ads",
      logo: googleAdsLogo,
      description:
        "Connect your Google Ads account to track and manage your ad campaigns, performance metrics, and insights all in one place.",
      buttonText: "Link Google Ads",
      isCustomComponent: false,
    },
    {
      name: "Amazon",
      logo: amazonLogo,
      description:
        "Integrate your Amazon account to monitor sales data, product performance, and streamline your e-commerce operations.",
      buttonText: "Link Amazon",
      isCustomComponent: false,
    },
    {
      name: "TikTok",
      component: <LinkTikTokCard createSource={createSource} />,
      isCustomComponent: true,
    },
    {
      name: "Vimeo",
      component: <LinkVimeoCard createSource={createSource} />,
      isCustomComponent: true,
    },
    {
      name: "Instagram",
      component: <LinkInstagramCard createSource={createSource} />,
      isCustomComponent: true,
    },
    {
      name: "Twitch",
      component: <LinkTwitchCard createSource={createSource} />,
      isCustomComponent: true,
    },
    {
      name: "Patreon",
      logo: patreonLogo,
      description:
        "Connect your Patreon account to monitor subscription revenue, patron growth, and content performance analytics.",
      buttonText: "Link Patreon",
      isCustomComponent: false,
    },
    {
      name: "Facebook",
      logo: FacebookLogo,
      description:
        "Integrate your Facebook account to analyze page insights, post engagement, and audience demographics.",
      buttonText: "Link Facebook",
      isCustomComponent: false,
      isSvgComponent: true,
    },
    {
      name: "Apple App Store",
      logo: appleAppStoreLogo,
      description:
        "Connect your Apple App Store account to track app downloads, revenue, and user reviews across iOS devices.",
      buttonText: "Link Apple App Store",
      isCustomComponent: false,
    },
    {
      name: "Google Play",
      logo: googlePlayLogo,
      description:
        "Link your Google Play Console to monitor app performance, downloads, and revenue from Android users.",
      buttonText: "Link Google Play",
      isCustomComponent: false,
    },
    {
      name: "Audible",
      logo: audibleLogo,
      description:
        "Connect your Audible account to track audiobook sales, listener engagement, and royalty earnings.",
      buttonText: "Link Audible",
      isCustomComponent: false,
    },
    {
      name: "Spotify",
      logo: spotifyLogo,
      description:
        "Link your Spotify for Artists account to analyze streaming data, listener demographics, and track performance.",
      buttonText: "Link Spotify",
      isCustomComponent: false,
    },
    {
      name: "Temu",
      logo: temuLogo,
      description:
        "Connect your Temu seller account to monitor product sales, customer reviews, and marketplace performance.",
      buttonText: "Link Temu",
      isCustomComponent: false,
    },
  ];

  // Filter sources based on search term and sort by integration status
  const filteredSources = allSources
    .filter((source) =>
      source.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      // Put integrated sources (isCustomComponent: true) first
      if (a.isCustomComponent && !b.isCustomComponent) return -1;
      if (!a.isCustomComponent && b.isCustomComponent) return 1;
      return 0; // Keep original order for sources with same status
    });

  const renderSourceCard = (source) => {
    if (source.isCustomComponent) {
      return source.component;
    }

    return (
      <Grid size={{ xs: 12, md: 4 }} key={source.name}>
        <Card
          sx={{
            p: 3,
            borderRadius: 2,
            boxShadow: 2,
            height: "100%",
            mt: 1,
            opacity: 0.7,
            position: "relative",
            "&:hover": {
              opacity: 0.8,
            },
          }}
        >
          {/* Coming Soon Badge */}
          <Chip
            label="Coming Soon"
            size="small"
            sx={{
              position: "absolute",
              top: 12,
              right: 12,
              backgroundColor: "#1976d2",
              color: "white",
              fontSize: "0.75rem",
              fontWeight: "bold",
              zIndex: 1,
            }}
          />

          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              height: "100%",
            }}
          >
            <Box>
              {source.isSvgComponent ? (
                <source.logo
                  style={{
                    height: "70px",
                    width: "auto",
                    marginBottom: 10,
                  }}
                />
              ) : (
                <img
                  src={source.logo}
                  alt={`${source.name} Logo`}
                  style={{
                    height: "70px",
                    objectFit: "contain",
                    marginBottom: 10,
                  }}
                />
              )}
              <Typography variant="h6" sx={{ fontWeight: "bold", mb: 1 }}>
                {source.name}
              </Typography>
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                {source.description}
              </Typography>
            </Box>

            <Button variant="outlined" sx={{ mt: 3 }} disabled fullWidth>
              {source.buttonText}
            </Button>
          </Box>
        </Card>
      </Grid>
    );
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xl" fullWidth>
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          pb: 2,
        }}
      >
        <Typography variant="h4">Add new source</Typography>
        <IconButton onClick={onClose}>
          <X size={25} />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pb: 3 }}>
        {/* Search Input */}
        <Box sx={{ mb: 3, display: "flex", justifyContent: "flex-end" }}>
          <TextField
            placeholder="Search sources..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            variant="outlined"
            size="small"
            sx={{
              width: "300px",
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search size={18} color="#6b7280" />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        {/* Sources Grid */}
        <Grid container spacing={3}>
          {filteredSources.map((source) => renderSourceCard(source))}
        </Grid>

        {/* No results message */}
        {filteredSources.length === 0 && searchTerm && (
          <Box sx={{ textAlign: "center", py: 4 }}>
            <Typography variant="h6" color="text.secondary">
              No sources found for "{searchTerm}"
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Try searching for platforms like TikTok, Instagram, YouTube, or
              others.
            </Typography>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};
