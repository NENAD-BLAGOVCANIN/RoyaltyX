import csv
import io
from typing import Dict, List, BinaryIO
from difflib import SequenceMatcher


def get_expected_fields():
    """Returns the list of fields our system expects"""
    return {
        'title': ['title', 'name', 'program_name', 'title name', 'product_name', 'product name'],
        'impressions': ['impressions', 'impression', 'views', 'view_count', 'view count'],
        'ecpm': ['ecpm', 'cpm', 'revenue_per_mille', 'rpm', 'earnings_per_mille'],
        'unit_price': ['unit price', 'price', 'unit_price', 'cost', 'amount'],
        'unit_price_currency': ['unit price currency', 'currency', 'unit_price_currency', 'price_currency'],
        'quantity': ['quantity', 'qty', 'count', 'units', 'number'],
        'consumption_type': ['consumption type', 'type', 'consumption_type', 'purchase_type'],
        'is_refund': ['is refund', 'refund', 'is_refund', 'refunded'],
        'royalty_amount': ['royalty amount', 'royalty', 'royalty_amount', 'earnings', 'revenue'],
        'royalty_currency': ['royalty currency', 'royalty_currency', 'earnings_currency'],
        'period_start': ['period start', 'start_date', 'period_start', 'from_date', 'start'],
        'period_end': ['period end', 'end_date', 'period_end', 'to_date', 'end']
    }


def similarity(a: str, b: str) -> float:
    """Calculate similarity between two strings"""
    return SequenceMatcher(None, a.lower(), b.lower()).ratio()


def detect_column_mappings(csv_headers: List[str]) -> Dict[str, str]:
    """
    Automatically detect the best mapping between CSV columns and expected fields
    Returns a dict mapping expected_field -> csv_column
    """
    expected_fields = get_expected_fields()
    mappings = {}
    used_columns = set()
    
    # For each expected field, find the best matching CSV column
    for expected_field, possible_names in expected_fields.items():
        best_match = None
        best_score = 0
        
        for csv_header in csv_headers:
            if csv_header in used_columns:
                continue
                
            # Check exact matches first
            for possible_name in possible_names:
                if csv_header.lower() == possible_name.lower():
                    best_match = csv_header
                    best_score = 1.0
                    break
            
            if best_score == 1.0:
                break
                
            # Check similarity matches
            for possible_name in possible_names:
                score = similarity(csv_header, possible_name)
                if score > best_score and score > 0.6:  # Minimum similarity threshold
                    best_match = csv_header
                    best_score = score
        
        if best_match and best_score > 0.6:
            mappings[expected_field] = best_match
            used_columns.add(best_match)
    
    return mappings


def get_csv_headers(file: BinaryIO) -> List[str]:
    """Extract headers from CSV file"""
    file.seek(0)
    decoded_file = io.StringIO(file.read().decode("utf-8"))
    file.seek(0)
    reader = csv.reader(decoded_file)
    headers = next(reader, [])
    return headers


def get_csv_preview(file: BinaryIO, max_rows: int = 5) -> List[Dict[str, str]]:
    """Get a preview of CSV data"""
    file.seek(0)
    decoded_file = io.StringIO(file.read().decode("utf-8"))
    file.seek(0)
    reader = csv.DictReader(decoded_file)
    
    preview_data = []
    for i, row in enumerate(reader):
        if i >= max_rows:
            break
        preview_data.append(row)
    
    return preview_data
