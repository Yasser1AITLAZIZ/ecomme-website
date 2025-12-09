"""JSON schema validators for product specifications."""
import jsonschema
from typing import Dict, Any
from app.core.exceptions import ValidationError


# Product specification schemas by category
SPEC_SCHEMAS: Dict[str, Dict[str, Any]] = {
    "iphone": {
        "type": "object",
        "properties": {
            "storage": {
                "type": "string",
                "enum": ["64GB", "128GB", "256GB", "512GB", "1TB"]
            },
            "color": {"type": "string"},
            "screen_size": {"type": "string"},
            "processor": {"type": "string"},
            "camera": {"type": "string"},
            "battery": {"type": "string"},
            "connectivity": {
                "type": "array",
                "items": {"type": "string"}
            }
        },
        "required": ["storage", "color"]
    },
    "android": {
        "type": "object",
        "properties": {
            "storage": {
                "type": "string",
                "enum": ["32GB", "64GB", "128GB", "256GB", "512GB"]
            },
            "ram": {
                "type": "string",
                "enum": ["2GB", "3GB", "4GB", "6GB", "8GB", "12GB"]
            },
            "color": {"type": "string"},
            "screen_size": {"type": "string"},
            "processor": {"type": "string"},
            "camera": {"type": "string"},
            "battery": {"type": "string"},
            "os_version": {"type": "string"}
        },
        "required": ["storage", "ram", "color"]
    },
    "accessories": {
        "type": "object",
        "properties": {
            "type": {"type": "string"},
            "compatibility": {
                "type": "array",
                "items": {"type": "string"}
            },
            "material": {"type": "string"},
            "color": {"type": "string"},
            "dimensions": {"type": "string"}
        },
        "required": ["type"]
    }
}


def validate_product_specs(category: str, specs: Dict[str, Any]) -> None:
    """
    Validate product specifications against category schema.
    
    Args:
        category: Product category
        specs: Specifications to validate
        
    Raises:
        ValidationError: If specs don't match schema
    """
    if category not in SPEC_SCHEMAS:
        # If category has no schema, allow any specs
        return
    
    schema = SPEC_SCHEMAS[category]
    
    try:
        jsonschema.validate(instance=specs, schema=schema)
    except jsonschema.ValidationError as e:
        raise ValidationError(f"Invalid product specifications: {e.message}")

