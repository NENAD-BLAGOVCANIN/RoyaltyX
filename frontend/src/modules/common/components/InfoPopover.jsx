import { InfoCircleFill } from "react-bootstrap-icons";
import { OverlayTrigger, Popover } from "react-bootstrap";

export const InfoPopover = ({ title = "", text }) => {
  const popover = (
    <Popover>
      {title && (
        <Popover.Header as="h3" className="text-dark">
          {title}
        </Popover.Header>
      )}
      <Popover.Body>{text}</Popover.Body>
    </Popover>
  );

  return (
    <OverlayTrigger
      placement="bottom"
      delay={{ show: 200, hide: 100 }}
      overlay={popover}
      trigger={["hover", "focus"]}
    >
      <InfoCircleFill className="ms-2" role="button" />
    </OverlayTrigger>
  );
};
