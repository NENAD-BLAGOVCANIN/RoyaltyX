from typing import Dict, List, Tuple


def get_required_fields_for_data_type(data_type: str) -> List[str]:
    """Get required fields for different data types"""
    if data_type == "sales":
        return [
            "unit_price",  # Required for ProductSale
            "quantity",  # Required for ProductSale
            "royalty_amount",  # Required for ProductSale
        ]
    elif data_type == "impressions":
        return [
            "impressions",  # Required for ProductImpressions
        ]
    else:
        # No additional requirements for basic product data
        return []


def detect_data_types_from_mappings(mappings: Dict[str, str]) -> List[str]:
    """Detect what types of data will be created based on mappings"""
    data_types = []
    
    # Check if sales data will be created
    sales_indicators = ["unit_price", "quantity", "royalty_amount"]
    if any(field in mappings and mappings[field] for field in sales_indicators):
        data_types.append("sales")
    
    # Check if impressions data will be created
    impressions_indicators = ["impressions", "ecpm"]
    if any(field in mappings and mappings[field] for field in impressions_indicators):
        data_types.append("impressions")
    
    return data_types


def validate_column_mappings(mappings: Dict[str, str]) -> Tuple[bool, List[str]]:
    """
    Validate that all required fields are mapped based on the data types detected
    Returns (is_valid, list_of_missing_fields)
    """
    errors = []
    
    # Always require title, period_start, and period_end for any import
    base_required_fields = ["title", "period_start", "period_end"]
    for field in base_required_fields:
        if not mappings.get(field):
            field_label = field.replace('_', ' ').title()
            errors.append(f"'{field_label}' field is required - please map a column")
    
    # Detect what types of data will be created
    data_types = detect_data_types_from_mappings(mappings)
    
    # If no data types detected, that's fine - user just wants basic product data
    if not data_types:
        return len(errors) == 0, errors
    
    # Validate requirements for each detected data type
    for data_type in data_types:
        required_fields = get_required_fields_for_data_type(data_type)
        
        for field in required_fields:
            if not mappings.get(field):
                field_label = field.replace('_', ' ').title()
                if data_type == "sales":
                    errors.append(f"Sales data detected but '{field_label}' is not mapped - required for sales records")
                elif data_type == "impressions":
                    errors.append(f"Impressions data detected but '{field_label}' is not mapped - required for impression records")
    
    return len(errors) == 0, errors


def validate_csv_data_with_mappings(csv_data: List[Dict[str, str]], mappings: Dict[str, str]) -> Tuple[bool, List[str]]:
    """
    Validate that the CSV data contains the required values for mapped fields
    Returns (is_valid, list_of_errors)
    """
    errors = []
    
    if not csv_data:
        errors.append("CSV file appears to be empty")
        return False, errors
    
    # Check if required mapped columns have data
    required_mappings = {k: v for k, v in mappings.items() if v}  # Only mapped fields
    
    # Sample first few rows to check for data
    sample_size = min(5, len(csv_data))
    sample_rows = csv_data[:sample_size]
    
    for field, csv_column in required_mappings.items():
        # Check if the mapped column exists in CSV
        if csv_column not in sample_rows[0].keys():
            errors.append(f"Mapped column '{csv_column}' not found in CSV file")
            continue
            
        # Check if there's any data in the mapped column
        has_data = any(row.get(csv_column, '').strip() for row in sample_rows)
        if not has_data:
            field_label = field.replace('_', ' ').title()
            errors.append(f"Column '{csv_column}' mapped to '{field_label}' appears to be empty")
    
    return len(errors) == 0, errors
