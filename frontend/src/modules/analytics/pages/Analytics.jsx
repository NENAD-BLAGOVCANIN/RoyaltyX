import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Container, Spinner } from "react-bootstrap";
import { getProjectAnalytics } from "../api/analytics";
import { useLocation } from "react-router";
import DateRangeSelector from "../../common/components/DateRangeSelector";
import ImpressionsOverTime from "../components/ImpressionsOverTime";
import ImpressionRevenueOverTime from "../components/ImpressionRevenueOverTime";
import SalesOverTime from "../components/SalesOverTime";
import RentalsOverTime from "../components/RentalsOverTime";
import { useSettings } from "../../common/contexts/SettingsContext";
import { TopPerfomingContentByImpressions } from "../components/TopPerfomingContentByImpressions";
import { TopPerfomingContentBySales } from "../components/TopPerfomingContentBySales";
import { SourceAnalytics } from "../components/SourceAnalytics";
import SalesStatsCard from "../components/SalesStatsCard";
import GeneralStatsCard from "../components/GeneralStatsCard";
import EarningsCard from "../components/EarningsCard";
import { Grid, Typography } from "@mui/material";

function Analytics() {
  const [analytics, setAnalytics] = useState(null);
  const {
    showSalesOverTime,
    showRentalsOverTime,
    showImpressionsOverTime,
    showImpressionRevenueOverTime,
  } = useSettings();
  const location = useLocation();
  const params = new URLSearchParams(location.search);

  useEffect(() => {
    const periodStart = params.get("period_start");
    const periodEnd = params.get("period_end");

    const period_range = {
      period_start: periodStart,
      period_end: periodEnd,
    };

    const fetchAnalytics = async () => {
      try {
        const fetchedAnalytics = await getProjectAnalytics(period_range);
        setAnalytics(fetchedAnalytics);
      } catch (error) {
        toast.error(error.message || "Failed to fetch analytics");
      }
    };

    fetchAnalytics();
  }, [location.search]);

  if (!analytics) {
    return (
      <Container className="d-flex justify-content-center mt-5">
        <Spinner animation="border" />
      </Container>
    );
  }

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3 ps-1">
        <Typography variant="h2" mb={0}>
          Analytics
        </Typography>
        <DateRangeSelector />
      </div>


      <Grid container columnSpacing={3}>
        {showSalesOverTime && <SalesOverTime analytics={analytics} />}
        {showRentalsOverTime && <RentalsOverTime analytics={analytics} />}
        {showImpressionsOverTime && (
          <ImpressionsOverTime analytics={analytics} />
        )}
        {showImpressionRevenueOverTime && (
          <ImpressionRevenueOverTime analytics={analytics} />
        )}
      </Grid>

      <Grid container spacing={3}>
        <SalesStatsCard analytics={analytics} />
        <GeneralStatsCard analytics={analytics} showProductCount={true} />
        <EarningsCard analytics={analytics} />
      </Grid>

      <SourceAnalytics analytics={analytics} />

      <TopPerfomingContentByImpressions />

      <TopPerfomingContentBySales />
    </>
  );
}

export default Analytics;
