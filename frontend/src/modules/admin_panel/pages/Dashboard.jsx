import { useState } from "react";
import { Box2Heart, CurrencyDollar, Person } from "react-bootstrap-icons";

function Dashboard() {
  const [stats] = useState({
    total_number_of_users: 0,
    total_earnings: 0,
    number_of_subscribed_users: 0,
    number_of_standard_subscribed_users: 0,
    number_of_pro_subscribed_users: 0,
  });

  return (
    <div className="container">
      <h3 className="mt-4 mb-3 ps-2 bold">Dashboard</h3>

      <div className="row">
        <div className="col-md-4 p-3">
          <div className="card p-3 rounded">
            <div className="d-flex align-items-center justify-content-between pb-2">
              <span className="medium fw-500">Total users</span>
              <Person className="txt-lighter" />
            </div>
            <div className="d-flex align-items-center">
              <h2 className="m-0 pe-2">{stats.total_number_of_users}</h2>
            </div>

            <div className="pt-1">
              <span className="small">
                <span className="text-success">+00.0%</span> from last period
              </span>
            </div>
          </div>
        </div>
        <div className="col-md-4 p-3">
          <div className="card p-3 rounded">
            <div className="d-flex align-items-center justify-content-between pb-2">
              <span className="medium fw-500">Active users</span>
              <CurrencyDollar className="txt-lighter" />
            </div>
            <div className="d-flex align-items-center">
              <h2 className="m-0 pe-2">{stats.total_earnings}</h2>
            </div>

            <div className="pt-1">
              <span className="small">
                <span className="text-success">+00.0%</span> from last period
              </span>
            </div>
          </div>
        </div>
        <div className="col-md-4 p-3">
          <div className="card p-3 rounded">
            <div className="d-flex align-items-center justify-content-between pb-2">
              <span className="medium fw-500">Products</span>
              <Box2Heart className="txt-lighter" />
            </div>
            <div className="d-flex align-items-center">
              <h2 className="m-0 pe-2">{stats.number_of_subscribed_users}</h2>
            </div>

            <div className="pt-1">
              <span className="small">
                <span className="text-success">+00.0%</span> from last period
              </span>
            </div>
          </div>
        </div>
      </div>
      <h5 className="mt-4 mb-3">Top Performing Content</h5>

      <div className="bgc-body shadow-sm">
        <div className="table-responsive">
          <table className="table table-striped table-hover mb-0">
            <tbody>
              <tr>
                <th>Rank</th>
                <th>Title</th>
                <th>Views</th>
                <th>Revenue</th>
              </tr>
              <tr>
                <td>1</td>
                <td>Summer Vibes</td>
                <td>1,500,000</td>
                <td>$65,000</td>
              </tr>
              <tr>
                <td>1</td>
                <td>Summer Vibes</td>
                <td>1,500,000</td>
                <td>$65,000</td>
              </tr>
              <tr>
                <td>1</td>
                <td>Summer Vibes</td>
                <td>1,500,000</td>
                <td>$65,000</td>
              </tr>
              <tr>
                <td>1</td>
                <td>Summer Vibes</td>
                <td>1,500,000</td>
                <td>$65,000</td>
              </tr>
              <tr>
                <td>1</td>
                <td>Summer Vibes</td>
                <td>1,500,000</td>
                <td>$65,000</td>
              </tr>
              <tr>
                <td>1</td>
                <td>Summer Vibes</td>
                <td>1,500,000</td>
                <td>$65,000</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
