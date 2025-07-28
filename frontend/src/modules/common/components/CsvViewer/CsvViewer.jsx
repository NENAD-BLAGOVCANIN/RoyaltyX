import { useState } from "react";
import { SYSTEM_FIELDS } from "../../../sources/constants";

const CsvViewer = ({ data, onCellChange }) => {
  const [selectedCell, setSelectedCell] = useState({ row: null, col: null });

  const filteredData = data?.filter((row) =>
    Object.values(row).some((val) => val && val.toString().trim() !== ""),
  );

  if (!filteredData || filteredData.length === 0)
    return <p>No data available.</p>;

  const columnKeys = Object.keys(filteredData[0]);

  const getColumnLetter = (colIndex) => {
    let result = "";
    let index = colIndex;
    while (index >= 0) {
      result = String.fromCharCode((index % 26) + 65) + result;
      index = Math.floor(index / 26) - 1;
    }
    return result;
  };

  return (
    <div>
      <table className="table table-bordered table-sm text-center m-0 table-sheet">
        <thead>
          <tr>
            <th></th>
            {columnKeys.map((_, index) => (
              <th key={index} className="text-center">
                {getColumnLetter(index)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {/* Column names row (like Excel) */}
          <tr>
            <th className="text-center font-weight-bold">↳</th>
            {columnKeys.map((key, colIndex) => (
              <td key={colIndex} className="font-weight-bold bg-light">
                {key}
              </td>
            ))}
          </tr>

          {/* Actual data rows */}
          {filteredData.map((row, rowIndex) => (
            <tr key={rowIndex}>
              <th className="text-center">{rowIndex + 1}</th>
              {columnKeys.map((key, colIndex) => {
                const isSelected = selectedCell.row === rowIndex && selectedCell.col === colIndex;
                return (
                <td
                  key={colIndex}
                  onClick={() =>
                    setSelectedCell({ row: rowIndex, col: colIndex })
                  }
                  style={
                    SYSTEM_FIELDS.includes(key) || isSelected
                      ? {}
                      : {
                          opacity: 0.4,
                        }
                  }
                  className={
                    isSelected 
                      ? "selected-cell"
                      : ""
                  }
                >
                  {isSelected ? (
                    <input
                      type="text"
                      value={row[key] ?? ""}
                      onChange={(e) =>
                        onCellChange?.(rowIndex, key, e.target.value)
                      }
                      onBlur={() => setSelectedCell({ row: null, col: null })}
                      autoFocus
                      className="form-control form-control-sm text-center border-0"
                    />
                  ) : (
                    row[key]
                  )}
                </td>
              )})}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CsvViewer;
