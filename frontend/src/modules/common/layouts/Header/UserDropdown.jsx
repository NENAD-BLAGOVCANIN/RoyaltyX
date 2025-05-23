import { Link } from "react-router-dom";
import { Dropdown } from "react-bootstrap";
import {
  BoxArrowRight,
  Folder,
  PersonCircle,
  UiChecksGrid,
} from "react-bootstrap-icons";
import { useAuth } from "../../contexts/AuthContext";

function UserDropdown() {
  const { name, email, avatar } = useAuth();

  return (
    <Dropdown className="d-flex align-items-center">
      <Dropdown.Toggle
        variant="basic"
        id="dropdown-basic"
        className="p-0 border-0 bg-transparent"
      >
        <img
          src={avatar}
          className="rounded pointer"
          style={{ width: 23, height: 23, objectFit: "cover" }}
          alt="Profile"
        />
      </Dropdown.Toggle>

      <Dropdown.Menu
        className="border-0 shadow rounded-lg mt-2 px-2"
        align="end"
        style={{ width: 290, background: "var(--color-body-background)" }}
      >
        <div className="d-flex align-items-center pt-1 px-2">
          <div className="position-relative">
            <img
              src={avatar}
              className="rounded"
              style={{ width: 30, height: 30, objectFit: "cover" }}
              alt=""
            />
          </div>
          <div className="d-flex flex-column ps-3">
            <span
              className="medium fw-500"
              style={{ color: "var(--color-text)" }}
            >
              {name}
            </span>
            <span className="small txt-lighter">{email}</span>
          </div>
        </div>

        <Dropdown.Divider />

        <Dropdown.Item className="rounded" as={Link} to="/admin/dashboard">
          <UiChecksGrid /> <span className="ps-3 medium">Admin Panel</span>
        </Dropdown.Item>
        <Dropdown.Item className="rounded" as={Link} to="/account">
          <PersonCircle /> <span className="ps-3 medium">My Account</span>
        </Dropdown.Item>
        <Dropdown.Item className="rounded" as={Link} to="/my-projects">
          <Folder /> <span className="ps-3 medium">My Projects</span>
        </Dropdown.Item>

        <Dropdown.Divider />

        <Dropdown.Item className="rounded text-danger" as={Link} to="/logout">
          <BoxArrowRight className="text-danger" />{" "}
          <span className="ps-3 medium text-danger">Logout</span>
        </Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  );
}

export default UserDropdown;
