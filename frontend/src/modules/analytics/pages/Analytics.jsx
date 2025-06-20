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
import { SalesCard } from "../components/SalesCard";
import { ImpressionsCard } from "../components/ImpressionsCard";
import { RevenueCard } from "../components/RevenueCard";
import { useSettings } from "../../common/contexts/SettingsContext";
import { TopPerfomingContentByImpressions } from "../components/TopPerfomingContentByImpressions";
import { TopPerfomingContentBySales } from "../components/TopPerfomingContentBySales";

function Analytics() {
  const [analytics, setAnalytics] = useState(null);
  const {
    showSalesOverTime,
    showRentalsOverTime,
    showImpressionsOverTime,
    showImpressionRevenueOverTime,
    showTotalImpressionsCard,
    showTotalSalesCard,
    showTotalRevenueCard,
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
      <div className="d-flex justify-content-between align-items-center mt-4 mb-3 ps-1">
        <h2 className="bold mb-0">Analytics</h2>
        <DateRangeSelector />
      </div>

      <div className="row">
        {showTotalImpressionsCard && <ImpressionsCard analytics={analytics} />}
        {showTotalSalesCard && <SalesCard analytics={analytics} />}
        {showTotalRevenueCard && <RevenueCard analytics={analytics} />}
      </div>

      <div className="row">
        {showSalesOverTime && <SalesOverTime analytics={analytics} />}
        {showRentalsOverTime && <RentalsOverTime analytics={analytics} />}
        {showImpressionsOverTime && (
          <ImpressionsOverTime analytics={analytics} />
        )}
        {showImpressionRevenueOverTime && (
          <ImpressionRevenueOverTime analytics={analytics} />
        )}
      </div>

      <div className="row">
        <div className="col-md-6">
          <h5 className="bold mt-4 mb-4">Sales stats</h5>
          <table className="table table-bordered table-hover">
            <tbody>
              <tr>
                <th>Number of rentals</th>
                <td className="text-end">
                  {analytics?.rentals_count?.toLocaleString()}
                </td>
              </tr>
              <tr>
                <th>Number of purchases</th>
                <td className="text-end">
                  {analytics?.purchases_count?.toLocaleString()}
                </td>
              </tr>
              <tr>
                <th>Earnings from rentals</th>
                <td className="text-end">
                  {analytics?.rentals_revenue?.toLocaleString()} $
                </td>
              </tr>
              <tr>
                <th>Earnings from purchases</th>
                <td className="text-end">
                  {analytics?.purchases_revenue?.toLocaleString()} $
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="col-md-6">
          <h5 className="bold mt-4 mb-4">General stats</h5>
          <table className="table table-bordered table-hover">
            <tbody>
              <tr>
                <th>Impressions</th>
                <td className="text-end">
                  {analytics?.total_impressions?.toLocaleString()}
                </td>
              </tr>
              <tr>
                <th>Revenue From Impressions</th>
                <td className="text-end">
                  ${analytics?.total_impression_revenue?.toLocaleString()}
                </td>
              </tr>
              <tr>
                <th>Products</th>
                <td className="text-end">
                  {analytics?.product_count?.toLocaleString()}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="row">
        <h5 className="bold mt-4 mb-4">
          Top Performing Content (by impressions)
        </h5>
        <TopPerfomingContentByImpressions />
      </div>

      <div className="row">
        <h5 className="bold mt-4 mb-4">Top Performing Content (by sales)</h5>
        <TopPerfomingContentBySales />
      </div>
    </>
  );
}

export default Analytics;
