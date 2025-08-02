import { Link } from "react-router-dom";

const TopicsList = () => {
  return (
    <>
      <h4 className="bold mb-4">Topics</h4>
      <ul>
        <li className="py-2">
          <Link to="/admin/documentation/data-upload" className="mb-0">
            Data Upload
          </Link>
        </li>
        <li className="py-2">
          <Link to="/admin/documentation/products-list-view" className="mb-0">
            Products List View
          </Link>
        </li>
        <li className="py-2">
          <Link to="/admin/documentation/report-generation" className="mb-0">
            Report Generation
          </Link>
        </li>
        <li className="py-2">
          <Link to="/admin/documentation/messaging" className="mb-0">
            Messaging
          </Link>
        </li>
      </ul>
    </>
  );
};

export default TopicsList;
