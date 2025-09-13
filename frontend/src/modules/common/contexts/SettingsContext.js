import { createContext, useContext, useEffect, useState } from "react";

const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
  const [showSalesOverTime, setShowSalesOverTime] = useState(() => {
    const savedShowSalesOverTimePreference =
      localStorage.getItem("showSalesOverTime");
    return savedShowSalesOverTimePreference !== null
      ? savedShowSalesOverTimePreference === "true"
      : true;
  });

  const [showRentalsOverTime, setShowRentalsOverTime] = useState(() => {
    const savedShowRentalsOverTimePreference = localStorage.getItem(
      "showRentalsOverTime",
    );
    return savedShowRentalsOverTimePreference !== null
      ? savedShowRentalsOverTimePreference === "true"
      : true;
  });

  const [showImpressionsOverTime, setShowImpressionsOverTime] = useState(() => {
    const savedShowImpressionsOverTimePreference = localStorage.getItem(
      "showImpressionsOverTime",
    );
    return savedShowImpressionsOverTimePreference !== null
      ? savedShowImpressionsOverTimePreference === "true"
      : true;
  });

  const [showImpressionRevenueOverTime, setShowImpressionRevenueOverTime] =
    useState(() => {
      const savedShowImpressionRevenueOverTimePreference = localStorage.getItem(
        "showImpressionRevenueOverTime",
      );
      return savedShowImpressionRevenueOverTimePreference !== null
        ? savedShowImpressionRevenueOverTimePreference === "true"
        : true;
    });

  const [showTotalImpressionsCard, setShowTotalImpressionsCard] = useState(
    () => {
      const savedShowTotalImpressionsCardPreference = localStorage.getItem(
        "showTotalImpressionsCard",
      );
      return savedShowTotalImpressionsCardPreference !== null
        ? savedShowTotalImpressionsCardPreference === "true"
        : true;
    },
  );

  const [showTotalSalesCard, setShowTotalSalesCard] = useState(() => {
    const savedShowTotalSalesCardPreference =
      localStorage.getItem("showTotalSalesCard");
    return savedShowTotalSalesCardPreference !== null
      ? savedShowTotalSalesCardPreference === "true"
      : true;
  });

  const [showTotalRevenueCard, setShowTotalRevenueCard] = useState(() => {
    const savedShowTotalRevenueCardPreference = localStorage.getItem(
      "showTotalRevenueCard",
    );
    return savedShowTotalRevenueCardPreference !== null
      ? savedShowTotalRevenueCardPreference === "true"
      : true;
  });

  const [showTotalEarningsOverTime, setShowTotalEarningsOverTime] = useState(() => {
    const savedShowTotalEarningsOverTimePreference = localStorage.getItem(
      "showTotalEarningsOverTime",
    );
    return savedShowTotalEarningsOverTimePreference !== null
      ? savedShowTotalEarningsOverTimePreference === "true"
      : true;
  });

  const [showROIOverTime, setShowROIOverTime] = useState(() => {
    const savedShowROIOverTimePreference = localStorage.getItem(
      "showROIOverTime",
    );
    return savedShowROIOverTimePreference !== null
      ? savedShowROIOverTimePreference === "true"
      : true;
  });

  const [
    impressionsGraphColor,
    setimpressionsGraphColor,
  ] = useState(() => {
    const savedimpressionsGraphColor = localStorage.getItem(
      "impressionsGraphColor",
    );
    return savedimpressionsGraphColor !== null
      ? savedimpressionsGraphColor
      : "#009efd";
  });

  const [salesGraphColor, setsalesGraphColor] =
    useState(() => {
      const savedsalesGraphColor = localStorage.getItem(
        "salesGraphColor",
      );
      return savedsalesGraphColor !== null
        ? savedsalesGraphColor
        : "#009efd";
    });

  const [revenueGraphColor, setrevenueGraphColor] =
    useState(() => {
      const savedrevenueGraphColor = localStorage.getItem(
        "revenueGraphColor",
      );
      return savedrevenueGraphColor !== null
        ? savedrevenueGraphColor
        : "#009efd";
    });

  const [salesOverTimeGraphColor, setSalesOverTimeGraphColor] = useState(() => {
    const savedSalesOverTimeGraphColor = localStorage.getItem(
      "salesOverTimeGraphColor",
    );
    return savedSalesOverTimeGraphColor !== null
      ? savedSalesOverTimeGraphColor
      : "#009efd";
  });

  const [rentalsOverTimeGraphColor, setRentalsOverTimeGraphColor] = useState(
    () => {
      const savedRentalsOverTimeGraphColor = localStorage.getItem(
        "rentalsOverTimeGraphColor",
      );
      return savedRentalsOverTimeGraphColor !== null
        ? savedRentalsOverTimeGraphColor
        : "#009efd";
    },
  );

  const [impressionsOverTimeGraphColor, setImpressionsOverTimeGraphColor] =
    useState(() => {
      const savedImpressionsOverTimeGraphColor = localStorage.getItem(
        "impressionsOverTimeGraphColor",
      );
      return savedImpressionsOverTimeGraphColor !== null
        ? savedImpressionsOverTimeGraphColor
        : "#009efd";
    });

  const [
    impressionRevenueOverTimeGraphColor,
    setImpressionRevenueOverTimeGraphColor,
  ] = useState(() => {
    const savedImpressionRevenueOverTimeGraphColor = localStorage.getItem(
      "impressionRevenueOverTimeGraphColor",
    );
    return savedImpressionRevenueOverTimeGraphColor !== null
      ? savedImpressionRevenueOverTimeGraphColor
      : "#009efd";
  });

  const [totalEarningsOverTimeGraphColor, setTotalEarningsOverTimeGraphColor] = useState(() => {
    const savedTotalEarningsOverTimeGraphColor = localStorage.getItem(
      "totalEarningsOverTimeGraphColor",
    );
    return savedTotalEarningsOverTimeGraphColor !== null
      ? savedTotalEarningsOverTimeGraphColor
      : "#009efd";
  });

  const [roiGraphColor, setRoiGraphColor] = useState(() => {
    const savedRoiGraphColor = localStorage.getItem(
      "roiGraphColor",
    );
    return savedRoiGraphColor !== null
      ? savedRoiGraphColor
      : "#28a745";
  });

  const [roiOverTimeGraphColor, setRoiOverTimeGraphColor] = useState(() => {
    const savedRoiOverTimeGraphColor = localStorage.getItem(
      "roiOverTimeGraphColor",
    );
    return savedRoiOverTimeGraphColor !== null
      ? savedRoiOverTimeGraphColor
      : "#28a745";
  });

  useEffect(() => {
    localStorage.setItem("showSalesOverTime", showSalesOverTime.toString());
  }, [showSalesOverTime]);

  useEffect(() => {
    localStorage.setItem("showRentalsOverTime", showRentalsOverTime.toString());
  }, [showRentalsOverTime]);

  useEffect(() => {
    localStorage.setItem(
      "showImpressionsOverTime",
      showImpressionsOverTime.toString(),
    );
  }, [showImpressionsOverTime]);

  useEffect(() => {
    localStorage.setItem(
      "showImpressionRevenueOverTime",
      showImpressionRevenueOverTime.toString(),
    );
  }, [showImpressionRevenueOverTime]);

  useEffect(() => {
    localStorage.setItem(
      "showTotalImpressionsCard",
      showTotalImpressionsCard.toString(),
    );
  }, [showTotalImpressionsCard]);

  useEffect(() => {
    localStorage.setItem("showTotalSalesCard", showTotalSalesCard.toString());
  }, [showTotalSalesCard]);

  useEffect(() => {
    localStorage.setItem(
      "showTotalRevenueCard",
      showTotalRevenueCard.toString(),
    );
  }, [showTotalRevenueCard]);

  useEffect(() => {
    localStorage.setItem(
      "impressionsGraphColor",
      impressionsGraphColor,
    );
  }, [impressionsGraphColor]);

  useEffect(() => {
    localStorage.setItem(
      "salesGraphColor",
      salesGraphColor,
    );
  }, [salesGraphColor]);

  useEffect(() => {
    localStorage.setItem(
      "revenueGraphColor",
      revenueGraphColor,
    );
  }, [revenueGraphColor]);

  useEffect(() => {
    localStorage.setItem(
      "impressionsOverTimeGraphColor",
      impressionsOverTimeGraphColor,
    );
  }, [impressionsOverTimeGraphColor]);

  useEffect(() => {
    localStorage.setItem("salesOverTimeGraphColor", salesOverTimeGraphColor);
  }, [salesOverTimeGraphColor]);

  useEffect(() => {
    localStorage.setItem(
      "rentalsOverTimeGraphColor",
      rentalsOverTimeGraphColor,
    );
  }, [rentalsOverTimeGraphColor]);

  useEffect(() => {
    localStorage.setItem(
      "impressionsOverTimeGraphColor",
      impressionsOverTimeGraphColor,
    );
  }, [impressionsOverTimeGraphColor]);

  useEffect(() => {
    localStorage.setItem(
      "impressionRevenueOverTimeGraphColor",
      impressionRevenueOverTimeGraphColor,
    );
  }, [impressionRevenueOverTimeGraphColor]);

  useEffect(() => {
    localStorage.setItem("showTotalEarningsOverTime", showTotalEarningsOverTime.toString());
  }, [showTotalEarningsOverTime]);

  useEffect(() => {
    localStorage.setItem("showROIOverTime", showROIOverTime.toString());
  }, [showROIOverTime]);

  useEffect(() => {
    localStorage.setItem("totalEarningsOverTimeGraphColor", totalEarningsOverTimeGraphColor);
  }, [totalEarningsOverTimeGraphColor]);

  useEffect(() => {
    localStorage.setItem("roiGraphColor", roiGraphColor);
  }, [roiGraphColor]);

  useEffect(() => {
    localStorage.setItem("roiOverTimeGraphColor", roiOverTimeGraphColor);
  }, [roiOverTimeGraphColor]);

  return (
    <SettingsContext.Provider
      value={{
        showSalesOverTime,
        setShowSalesOverTime,
        showRentalsOverTime,
        setShowRentalsOverTime,
        showImpressionsOverTime,
        setShowImpressionsOverTime,
        showImpressionRevenueOverTime,
        setShowImpressionRevenueOverTime,
        showTotalImpressionsCard,
        setShowTotalImpressionsCard,
        showTotalSalesCard,
        setShowTotalSalesCard,
        showTotalRevenueCard,
        setShowTotalRevenueCard,
        showTotalEarningsOverTime,
        setShowTotalEarningsOverTime,
        showROIOverTime,
        setShowROIOverTime,
        impressionsGraphColor,
        setimpressionsGraphColor,
        salesGraphColor,
        setsalesGraphColor,
        revenueGraphColor,
        setrevenueGraphColor,
        salesOverTimeGraphColor,
        setSalesOverTimeGraphColor,
        rentalsOverTimeGraphColor,
        setRentalsOverTimeGraphColor,
        impressionsOverTimeGraphColor,
        setImpressionsOverTimeGraphColor,
        impressionRevenueOverTimeGraphColor,
        setImpressionRevenueOverTimeGraphColor,
        totalEarningsOverTimeGraphColor,
        setTotalEarningsOverTimeGraphColor,
        roiGraphColor,
        setRoiGraphColor,
        roiOverTimeGraphColor,
        setRoiOverTimeGraphColor,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);
