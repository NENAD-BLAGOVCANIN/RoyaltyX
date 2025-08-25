import { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { useProduct } from "../api/product";
import { toast } from "react-toastify";
import { Container, Spinner } from "react-bootstrap";
import { apiUrl } from "../../common/api/config";
import DateRangeSelector from "../../common/components/DateRangeSelector";
import { getProductAnalytics } from "../api/analytics";
import SalesOverTime from "../../analytics/components/SalesOverTime";
import RentalsOverTime from "../../analytics/components/RentalsOverTime";
import ImpressionsOverTime from "../../analytics/components/ImpressionsOverTime";
import ImpressionRevenueOverTime from "../../analytics/components/ImpressionRevenueOverTime";
import { useSettings } from "../../common/contexts/SettingsContext";
import { ReactComponent as ProductThumbnailPlaceholder } from "../../common/assets/img/vectors/product-thumbnail-placeholder.svg";
import SalesStatsCard from "../../analytics/components/SalesStatsCard";
import GeneralStatsCard from "../../analytics/components/GeneralStatsCard";
import EarningsCard from "../../analytics/components/EarningsCard";
import { 
  Box, 
  Grid, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Card,
  Typography 
} from "@mui/material";

function Analytics() {
  const { id } = useParams();
  const { product } = useProduct(id);
  const {
    showSalesOverTime,
    showRentalsOverTime,
    showImpressionsOverTime,
    showImpressionRevenueOverTime,
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

  if (!product) {
    return (
      <Container className="d-flex justify-content-center mt-5">
        <Spinner animation="border" />
      </Container>
    );
  }

  return (
    <>
      <div className="d-flex justify-content-between flex-wrap align-items-center mb-3">
        <div className="d-flex align-items-center gap-2 mb-2">
          {product.thumbnail ? (
            <img
              src={(() => {
                const url = product.thumbnail.replace("/media/", "");
                if (url.startsWith("https")) {
                  return decodeURIComponent(url).replace("https", "http");
                } else {
                  return apiUrl + product.thumbnail;
                }
              })()}
              alt={product.title}
              style={{
                height: 40,
                width: 55,
                objectFit: "cover",
              }}
            />
          ) : (
            <ProductThumbnailPlaceholder
              style={{
                width: 60,
                height: 60,
                objectFit: "cover",
                marginBottom: "0.25rem",
              }}
            />
          )}
          <h2 className="bold mb-0">{product.title}</h2>
        </div>
        <Box sx={{ mb: 2, mt: 2 }}>
          <DateRangeSelector />
        </Box>
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
        <GeneralStatsCard analytics={analytics} showProductCount={false} />
        <EarningsCard analytics={analytics} />
      </Grid>

      <Typography variant="h4" fontWeight="bold" sx={{ mt: 4, mb: 2 }}>
        Sales
      </Typography>
      <Card sx={{ p: 0 }} variant="outlined">
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>
                  <Typography variant="subtitle2" fontWeight="bold">
                    Type
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle2" fontWeight="bold">
                    Unit price
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle2" fontWeight="bold">
                    Unit price currency
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle2" fontWeight="bold">
                    Quantity
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle2" fontWeight="bold">
                    Is refund
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle2" fontWeight="bold">
                    Royalty amount
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle2" fontWeight="bold">
                    Royalty currency
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle2" fontWeight="bold">
                    Period start
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle2" fontWeight="bold">
                    Period end
                  </Typography>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {product?.sales?.map((sale, index) => (
                <TableRow key={index} hover>
                  <TableCell>
                    <Typography variant="body2">
                      {sale.type}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {sale.unit_price}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {sale.unit_price_currency}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {sale.quantity}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {String(sale.is_refund)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {sale.royalty_amount}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {sale.royalty_currency}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {new Date(sale.period_start)?.toLocaleString()}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {new Date(sale.period_end)?.toLocaleString()}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </>
  );
}

export default Analytics;
