import { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { getProduct } from "../api/product";
import { toast } from "react-toastify";
import { Container, Spinner } from "react-bootstrap";
import { apiUrl } from "../../common/api/config";
import DateRangeSelector from "../../common/components/DateRangeSelector";
import { getProductAnalytics } from "../api/analytics";
import { ImpressionsCard } from "../../analytics/components/ImpressionsCard";
import { SalesCard } from "../../analytics/components/SalesCard";
import { RevenueCard } from "../../analytics/components/RevenueCard";
import SalesOverTime from "../../analytics/components/SalesOverTime";
import RentalsOverTime from "../../analytics/components/RentalsOverTime";
import ImpressionsOverTime from "../../analytics/components/ImpressionsOverTime";
import ImpressionRevenueOverTime from "../../analytics/components/ImpressionRevenueOverTime";
import { useSettings } from "../../common/contexts/SettingsContext";
import { ReactComponent as ProductThumbnailPlaceholder } from "../../common/assets/img/vectors/product-thumbnail-placeholder.svg";

function Analytics() {
  const [product, setProduct] = useState(null);
  const { id } = useParams();
  const {
    showSalesOverTime,
    showRentalsOverTime,
    showImpressionsOverTime,
    showImpressionRevenueOverTime,
    showTotalImpressionsCard,
    showTotalSalesCard,
    showTotalRevenueCard,
  } = useSettings();

  const [analytics, setAnalytics] = useState(null);
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
        const fetchedAnalytics = await getProductAnalytics(id, period_range);
        setAnalytics(fetchedAnalytics);
      } catch (error) {
        toast.error(error.message || "Failed to fetch analytics");
      }
    };

    fetchAnalytics();
  }, [location]);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const fetchedProduct = await getProduct(id);
        setProduct(fetchedProduct);
      } catch (error) {
        toast.error(error.message || "Failed to fetch product");
      }
    };

    fetchProduct();
  }, [id]);

  if (!product) {
    return (
      <Container className="d-flex justify-content-center mt-5">
        <Spinner animation="border" />
      </Container>
    );
  }
  
  return (
    <>
      <div className="d-flex justify-content-between align-items-center mt-4 mb-3 ps-1">
        <div className="d-flex align-items-center gap-2">
          {product.thumbnail ? (
                <img
                src={`${apiUrl}${product.thumbnail}`}
                alt={product.title}
                style={{
                  height: 30,
                  width: 35,
                  objectFit: "cover"
                }}
                />
              ) : (
                <ProductThumbnailPlaceholder
                  style={{ 
                    width: 60, 
                    height: 60, 
                    objectFit: "cover",
                    marginBottom: "0.25rem"
                  }}
                />
              )}
          <h2 className="bold">{product.title}</h2>
        </div>
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
          <h4 className="bold mt-4 mb-4">Sales stats</h4>
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
          <h4 className="bold mt-4 mb-4">General stats</h4>
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
                  ${analytics?.impression_revenue?.toLocaleString()}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <h4 className="bold mt-4 mb-4">Sales</h4>
      <table className="table table-bordered table-hover">
        <thead>
          <tr>
            <th>Type</th>
            <th>Unit price</th>
            <th>Unit price currency</th>
            <th>Quantity</th>
            <th>Is refund</th>
            <th>Royalty amount</th>
            <th>Royalty currency</th>
            <th>Period start</th>
            <th>Period end</th>
          </tr>
        </thead>
        <tbody>
          {product?.sales.map((sale, index) => (
            <tr key={index}>
              <td>{sale.type}</td>
              <td>{sale.unit_price}</td>
              <td>{sale.unit_price_currency}</td>
              <td>{sale.quantity}</td>
              <td>{String(sale.is_refund)}</td>
              <td>{sale.royalty_amount}</td>
              <td>{sale.royalty_currency}</td>
              <td>{new Date(sale.period_start)?.toLocaleString()}</td>
              <td>{new Date(sale.period_end)?.toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}

export default Analytics;
