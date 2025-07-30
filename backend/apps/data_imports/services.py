from django.shortcuts import get_object_or_404

from apps.product.models import ProductImpressions, ProductSale

from .models import File, ColumnMapping
from .serializers import FileSerializer
from .utils.report_processing import process_report_with_mappings, read_csv
from .utils.column_mapping import get_csv_headers, detect_column_mappings, get_csv_preview
from .utils.validation import validate_column_mappings, validate_csv_data_with_mappings


def create_file(file, data):
    """Create file and return column mapping suggestions"""
    file_name = file.name
    existing_file = File.objects.filter(name=file_name, project=data["project"]).first()

    if existing_file:
        raise ValueError("A file with this name already exists")

    serializer = FileSerializer(data=data)
    if not serializer.is_valid():
        print(serializer.errors, flush=True)
        raise ValueError(serializer.errors)

    saved_file = serializer.save()

    # Get CSV headers and detect column mappings
    csv_headers = get_csv_headers(file)
    suggested_mappings = detect_column_mappings(csv_headers)
    csv_preview = get_csv_preview(file)

    return {
        "file": FileSerializer(saved_file).data,
        "csv_headers": csv_headers,
        "suggested_mappings": suggested_mappings,
        "csv_preview": csv_preview,
        "requires_mapping": True
    }


def confirm_column_mappings(file_id, mappings):
    """Confirm column mappings and process the file"""
    file = get_object_or_404(File, pk=file_id)
    
    # Validate column mappings first
    is_valid, validation_errors = validate_column_mappings(mappings)
    if not is_valid:
        raise ValueError("; ".join(validation_errors))
    
    # Read CSV data to validate against actual content
    try:
        csv_data = read_csv(file.file)
        data_is_valid, data_errors = validate_csv_data_with_mappings(csv_data, mappings)
        if not data_is_valid:
            raise ValueError("; ".join(data_errors))
    except Exception as e:
        raise ValueError(f"Error reading CSV file: {str(e)}")
    
    # Clear existing mappings
    ColumnMapping.objects.filter(file=file).delete()
    
    # Save new mappings
    for expected_field, csv_column in mappings.items():
        if csv_column:  # Only save if a column is mapped
            ColumnMapping.objects.create(
                file=file,
                csv_column=csv_column,
                mapped_field=expected_field
            )
    
    # Store mappings in JSON field for quick access
    file.column_mappings = mappings
    file.save()
    
    # Process the report with the confirmed mappings
    report_response = process_report_with_mappings(file)
    
    # Check if processing was successful
    if report_response.get("status") == "error":
        # If processing failed, don't mark as processed and return error
        raise ValueError(f"Processing failed: {report_response.get('message', 'Unknown error')}")
    
    # Mark file as processed only if everything succeeded
    file.is_processed = True
    file.save()
    
    return {
        "report": report_response,
        "file": FileSerializer(file).data,
    }


def delete_file(pk):
    file = get_object_or_404(File, pk=pk)

    ProductImpressions.objects.filter(from_file=file).delete()
    ProductSale.objects.filter(from_file=file).delete()

    file.delete()

    return {"message": "File and related data deleted successfully"}
