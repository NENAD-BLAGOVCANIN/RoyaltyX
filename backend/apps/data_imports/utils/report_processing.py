import csv
import io
from decimal import Decimal
from typing import Any, BinaryIO, Dict, List

from apps.product.models import Product, ProductImpressions, ProductSale


def validate_csv(file: BinaryIO) -> bool:
    """Validates if the uploaded file is a valid CSV."""
    try:
        decoded_file = io.StringIO(file.read().decode("utf-8"))
        file.seek(0)
        reader = csv.reader(decoded_file)
        headers = next(reader, None)
        if not headers:
            return False
        return True
    except Exception as e:
        print(f"CSV validation error: {e}")
        return False


def read_csv(file: BinaryIO) -> List[Dict[str, str]]:
    """Reads a CSV file and returns its content as a list of dictionaries."""
    file.seek(0)  # Ensure the file pointer is at the beginning
    decoded_file = io.StringIO(file.read().decode("utf-8"))
    reader = csv.DictReader(decoded_file)

    data = [row for row in reader]
    return data


def process_report_with_mappings(file_obj) -> Dict[str, str]:
    """Processes CSV report using column mappings and updates products."""
    try:
        if not validate_csv(file_obj.file):
            return {"status": "error", "message": "Invalid CSV file"}

        data = read_csv(file_obj.file)
        mappings = file_obj.column_mappings or {}
        
        result = update_products_with_mappings(data, file_obj.project_id, file_obj.id, mappings)

        return {
            "status": "success",
            "message": f"Updated {result['updated']} products",
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}


def update_products_with_mappings(
    data: List[Dict[str, str]], project_id: int, file_id: int, mappings: Dict[str, str]
) -> Dict[str, int]:
    """Updates products based on CSV data using column mappings and returns a summary."""
    updated_count = 0

    # Get the mapped column name for title
    title_column = mappings.get('title')
    if not title_column:
        return {"updated": 0}

    for row in data:
        title = row.get(title_column)
        if not title:
            continue

        product = Product.objects.filter(title=title, project_id=project_id).first()
        if not product:
            product = Product.objects.create(title=title, project_id=project_id)

        # Check if this row contains sales data
        unit_price_column = mappings.get('unit_price')
        if unit_price_column and row.get(unit_price_column):
            store_product_sales_with_mappings(row, product, file_id, mappings)

        # Check if this row contains impressions data
        impressions_column = mappings.get('impressions')
        if impressions_column and row.get(impressions_column):
            store_product_impressions_with_mappings(row, product, file_id, mappings)

        updated_count += 1

    return {"updated": updated_count}


def store_product_sales_with_mappings(row: Dict[str, Any], product: Product, file_id: int, mappings: Dict[str, str]) -> None:
    """Store product sales using column mappings"""
    try:
        # Get values using mappings
        unit_price = row.get(mappings.get('unit_price', ''))
        unit_price_currency = row.get(mappings.get('unit_price_currency', ''), 'USD')
        quantity = row.get(mappings.get('quantity', ''), '1')
        consumption_type = row.get(mappings.get('consumption_type', ''), 'purchase')
        is_refund_str = row.get(mappings.get('is_refund', ''), 'No')
        royalty_amount = row.get(mappings.get('royalty_amount', ''), '0')
        royalty_currency = row.get(mappings.get('royalty_currency', ''), 'USD')
        period_start = row.get(mappings.get('period_start', ''))
        period_end = row.get(mappings.get('period_end', ''))

        # Convert and validate data
        if not unit_price:
            return

        ProductSale.objects.create(
            product=product,
            type=consumption_type.lower() if consumption_type else 'purchase',
            unit_price=Decimal(str(unit_price)),
            unit_price_currency=unit_price_currency,
            quantity=int(float(quantity)) if quantity else 1,
            is_refund=is_refund_str.lower() in ['yes', 'true', '1'],
            royalty_amount=Decimal(str(royalty_amount)) if royalty_amount else Decimal('0'),
            royalty_currency=royalty_currency,
            period_start=period_start if period_start else None,
            period_end=period_end if period_end else None,
            from_file_id=file_id,
        )
    except Exception as e:
        print(f"Error storing product sales: {e}", flush=True)


def store_product_impressions_with_mappings(
    row: Dict[str, Any], product: Product, file_id: int, mappings: Dict[str, str]
) -> None:
    """Store product impressions using column mappings"""
    try:
        # Get values using mappings
        impressions = row.get(mappings.get('impressions', ''))
        ecpm = row.get(mappings.get('ecpm', ''))
        period_start = row.get(mappings.get('period_start', ''))
        period_end = row.get(mappings.get('period_end', ''))

        if not impressions:
            return

        ProductImpressions.objects.create(
            product=product,
            impressions=int(float(impressions)) if impressions else 0,
            ecpm=Decimal(str(ecpm)) if ecpm else None,
            period_start=period_start if period_start else None,
            period_end=period_end if period_end else None,
            from_file_id=file_id,
        )
    except Exception as e:
        print(f"Error storing product impressions: {e}", flush=True)


# Legacy functions for backward compatibility (if needed)
def process_report(file: BinaryIO, project_id: int, file_id: int) -> Dict[str, str]:
    """Legacy function - processes CSV report with hardcoded column names."""
    try:
        if not validate_csv(file):
            return {"status": "error", "message": "Invalid CSV file"}

        data = read_csv(file)
        result = update_products(data, project_id, file_id)

        return {
            "status": "success",
            "message": f"Updated {result['updated']} products",
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}


def update_products(
    data: List[Dict[str, str]], project_id: int, file_id: int
) -> Dict[str, int]:
    """Legacy function - updates products based on CSV data with hardcoded column names."""
    updated_count = 0

    for row in data:
        title = row.get("Title") or row.get("program_name") or row.get("Title Name")
        if not title:
            continue

        product = Product.objects.filter(title=title, project_id=project_id).first()
        if not product:
            product = Product.objects.create(title=title, project_id=project_id)

        if row.get("Unit Price"):
            storeProductSales(row, product, file_id)

        if row.get("impressions"):
            storeProductImpressions(row, product, file_id)

        updated_count += 1

    return {"updated": updated_count}


def storeProductSales(row: Dict[str, Any], product: Product, file_id: int) -> None:
    """Legacy function for storing product sales"""
    ProductSale.objects.create(
        product=product,
        type=row.get("Consumption Type", "purchase").lower(),
        unit_price=Decimal(row.get("Unit Price")),
        unit_price_currency=row.get("Unit Price Currency", "USD"),
        quantity=Decimal(row.get("Quantity", "1")),
        is_refund=row.get("Is Refund") == "Yes",
        royalty_amount=Decimal(row.get("Royalty Amount", "0")),
        royalty_currency=row.get("Royalty Currency", "USD"),
        period_start=row.get("Period Start"),
        period_end=row.get("Period End"),
        from_file_id=file_id,
    )


def storeProductImpressions(
    row: Dict[str, Any], product: Product, file_id: int
) -> None:
    """Legacy function for storing product impressions"""
    try:
        ProductImpressions.objects.create(
            product=product,
            ecpm=Decimal(row.get("ecpm", "0")),
            impressions=row.get("impressions", "0"),
            period_start=row.get("Period Start"),
            period_end=row.get("Period End"),
            from_file_id=file_id,
        )
    except Exception as e:
        print(e, flush=True)
