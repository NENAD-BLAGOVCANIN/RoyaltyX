import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { LinkedSourcesSection } from "../components/LinkedSourcesSection";
import { useProducts } from "../../products/contexts/ProductsContext";
import { ProductsList } from "../components/ProductsList";
import { useSources } from "../../sources/api/sources";
import { getProjectAnalytics } from "../../analytics/api/analytics";
import { SalesCard } from "../../analytics/components/SalesCard";
import { ImpressionsCard } from "../../analytics/components/ImpressionsCard";
import { RevenueCard } from "../../analytics/components/RevenueCard";
import { useSettings } from "../../common/contexts/SettingsContext";
import { Grid } from "@mui/material";

function Dashboard() {
  const { products, loading } = useProducts();
  const { sources } = useSources();
  const [analytics, setAnalytics] = useState(null);
  const {
    showTotalImpressionsCard,
    showTotalSalesCard,
    showTotalRevenueCard,
  } = useSettings();

  useEffect(() => {
    // Calculate the last 4 months date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 4);

    const period_range = {
      period_start: startDate.toISOString().split('T')[0], // Format as YYYY-MM-DD
      period_end: endDate.toISOString().split('T')[0], // Format as YYYY-MM-DD
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
  }, []);

  return (
    <>
      {analytics && (
        <Grid container spacing={3} className="mb-4">
          {showTotalImpressionsCard && <ImpressionsCard analytics={analytics} />}
          {showTotalSalesCard && <SalesCard analytics={analytics} />}
          {showTotalRevenueCard && <RevenueCard analytics={analytics} />}
        </Grid>
      )}
      
      <LinkedSourcesSection sources={sources} loading={loading} />
      <ProductsList products={products} loading={loading} />
    </>
  );
}

export default Dashboard;
