const PageHeader = ({ title, description = "", action = null }) => {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
      }}
    >
      <div>
        <h4 className="bold mb-2">{title}</h4>
        <p className="mb-4 txt-lighter" style={{ maxWidth: 500 }}>
          {description}
        </p>
      </div>
      {action && (
        <div style={{ marginLeft: "16px", flexShrink: 0 }}>{action}</div>
      )}
    </div>
  );
};

export default PageHeader;
