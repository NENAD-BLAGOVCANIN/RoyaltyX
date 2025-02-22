import csv
import io
from decimal import Decimal
from typing import BinaryIO, Dict, List, Any

from apps.product.models import Product, ProductSale


def validate_csv(file: BinaryIO) -> bool:
    """Validates if the uploaded file is a valid CSV."""
    try:
        decoded_file = io.StringIO(file.read().decode('utf-8'))
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
    decoded_file = io.StringIO(file.read().decode('utf-8'))
    reader = csv.DictReader(decoded_file)
    
    data = [row for row in reader]
    return data

def update_products(data: List[Dict[str, str]], project_id: int) -> Dict[str, int]:
    """Updates products based on CSV data and returns a summary."""
    updated_count = 0
    not_found_count = 0

    for row in data:
        title = row.get('Title') or row.get('program_name') or row.get('Title Name')
        if not title:
            continue

        product = Product.objects.filter(title=title).first()
        if not product:
            product = Product.objects.create(title=title, project_id=project_id)

        product.impressions = row.get('impressions')
        product.statement_frequency = row.get('Statement Frequency')
        product.first_statement_end_date = row.get('First Statement End Date')
        product.payment_threshold = row.get('Payment Threshold')
        product.payment_window = row.get('Payment Window')
        product.is_active = row.get('Active') == 'true'
        product.series_code = row.get('Series Code')
        product.notes = row.get('Notes')
        product.passthrough_fees = row.get('Passthrough Fees') == 'true'
        product.save()

        if row.get('Unit Price'):
            storeProductSales(row, product)


        updated_count += 1
    else:
        not_found_count += 1

    return {"updated": updated_count, "not_found": not_found_count}

def process_report(file: BinaryIO, project_id: int) -> Dict[str, str]:
    """Processes the CSV report and updates products. Returns success or error message."""
    try:
        if not validate_csv(file):
            return {"status": "error", "message": "Invalid CSV file"}

        data = read_csv(file)
        result = update_products(data, project_id)

        return {
            "status": "success",
            "message": f"Updated {result['updated']} products, {result['not_found']} not found"
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}


def storeProductSales(row: Dict[str, Any], product: Product) -> None:
    ProductSale.objects.create(
        product = product,
        type = row.get('Consumption Type'),
        unit_price = Decimal(row.get('Unit Price')),
        unit_price_currency = row.get('Unit Price Currency'),
        quantity = Decimal(row.get('Quantity')),
        is_refund = row.get('Is Refund') == "Yes",
        royalty_amount = Decimal(row.get('Royalty Amount')),
        royalty_currency = row.get('Royalty Currency'),
        period_start = row.get('Period Start'),
        period_end = row.get('Period End'),
    )