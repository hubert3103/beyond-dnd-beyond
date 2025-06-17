
import requests
import csv
import json
from typing import List, Dict, Any
import time

class Open5eEquipmentFetcher:
    def __init__(self):
        self.base_url = 'https://api.open5e.com'
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'D&D Equipment Data Fetcher'
        })
    
    def fetch_paginated_data(self, endpoint: str) -> List[Dict[str, Any]]:
        """Fetch all data from a paginated endpoint"""
        all_results = []
        url = f"{self.base_url}{endpoint}?limit=1000"
        
        while url:
            print(f"Fetching: {url}")
            try:
                response = self.session.get(url, timeout=30)
                response.raise_for_status()
                data = response.json()
                
                all_results.extend(data.get('results', []))
                url = data.get('next')
                
                # Rate limiting - be nice to the API
                time.sleep(0.5)
                
            except requests.exceptions.RequestException as e:
                print(f"Error fetching {url}: {e}")
                break
                
        print(f"Fetched {len(all_results)} items from {endpoint}")
        return all_results
    
    def normalize_equipment_item(self, item: Dict[str, Any], item_type: str) -> Dict[str, Any]:
        """Normalize an equipment item to match Supabase schema"""
        
        # Handle cost data
        cost_quantity = None
        cost_unit = None
        if item.get('cost'):
            if isinstance(item['cost'], dict):
                cost_quantity = item['cost'].get('quantity')
                cost_unit = item['cost'].get('unit')
            elif isinstance(item['cost'], str):
                # Try to parse cost string like "2 gp"
                parts = item['cost'].strip().split()
                if len(parts) >= 2:
                    try:
                        cost_quantity = int(parts[0])
                        cost_unit = ' '.join(parts[1:])
                    except ValueError:
                        pass
        
        # Handle damage data for weapons
        damage_dice = None
        damage_type = None
        if item.get('damage'):
            if isinstance(item['damage'], dict):
                damage_dice = item['damage'].get('damage_dice')
                damage_type = item['damage'].get('damage_type')
        
        # Handle properties array
        properties = item.get('properties', [])
        if isinstance(properties, list):
            properties_json = json.dumps(properties)
        else:
            properties_json = json.dumps([])
        
        # Determine equipment type and category
        equipment_type = item_type
        category = item.get('category', item_type)
        
        # For armor, use more specific typing
        if item_type == 'armor':
            if 'shield' in item.get('name', '').lower():
                equipment_type = 'shield'
                category = 'shield'
            else:
                equipment_type = 'armor'
                category = item.get('category', 'armor')
        
        return {
            'slug': item.get('slug', ''),
            'name': item.get('name', ''),
            'type': equipment_type,
            'rarity': item.get('rarity', 'common'),
            'requires_attunement': item.get('requires_attunement', False),
            'cost_quantity': cost_quantity,
            'cost_unit': cost_unit,
            'weight': item.get('weight'),
            'description': item.get('desc', ''),
            'document_slug': item.get('document__slug', ''),
            'ac': item.get('ac_base'),  # For armor
            'ac_base': item.get('ac_base'),
            'ac_add_dex': item.get('ac_add_dex'),
            'ac_cap_dex': item.get('ac_cap_dex'),
            'dex_bonus': item.get('ac_add_dex'),  # Alternative field name
            'max_dex_bonus': item.get('ac_cap_dex'),  # Alternative field name
            'damage_dice': damage_dice,
            'damage_type': damage_type,
            'category': category,
            'properties': properties_json
        }
    
    def fetch_all_equipment(self) -> List[Dict[str, Any]]:
        """Fetch all equipment data from multiple endpoints"""
        all_equipment = []
        
        # Fetch magic items
        print("Fetching magic items...")
        magic_items = self.fetch_paginated_data('/magicitems')
        for item in magic_items:
            normalized = self.normalize_equipment_item(item, 'magic-item')
            all_equipment.append(normalized)
        
        # Fetch weapons
        print("Fetching weapons...")
        weapons = self.fetch_paginated_data('/weapons')
        for item in weapons:
            normalized = self.normalize_equipment_item(item, 'weapon')
            all_equipment.append(normalized)
        
        # Fetch armor
        print("Fetching armor...")
        armor = self.fetch_paginated_data('/armor')
        for item in armor:
            normalized = self.normalize_equipment_item(item, 'armor')
            all_equipment.append(normalized)
        
        # Deduplicate by name (case-insensitive)
        seen_names = set()
        unique_equipment = []
        
        for item in all_equipment:
            name_lower = item['name'].lower()
            if name_lower not in seen_names:
                seen_names.add(name_lower)
                unique_equipment.append(item)
        
        print(f"Total equipment after deduplication: {len(unique_equipment)}")
        return unique_equipment
    
    def save_to_csv(self, equipment: List[Dict[str, Any]], filename: str = 'open5e_equipment.csv'):
        """Save equipment data to CSV file"""
        if not equipment:
            print("No equipment data to save")
            return
        
        # Define CSV headers matching Supabase table structure
        fieldnames = [
            'slug', 'name', 'type', 'rarity', 'requires_attunement',
            'cost_quantity', 'cost_unit', 'weight', 'description', 'document_slug',
            'ac', 'ac_base', 'ac_add_dex', 'ac_cap_dex', 'dex_bonus', 'max_dex_bonus',
            'damage_dice', 'damage_type', 'category', 'properties'
        ]
        
        print(f"Saving {len(equipment)} equipment items to {filename}...")
        
        with open(filename, 'w', newline='', encoding='utf-8') as csvfile:
            writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
            writer.writeheader()
            
            for item in equipment:
                # Ensure all fields are present
                row = {}
                for field in fieldnames:
                    value = item.get(field)
                    # Convert None to empty string for CSV
                    if value is None:
                        row[field] = ''
                    elif isinstance(value, bool):
                        row[field] = str(value).lower()  # Convert boolean to lowercase string
                    else:
                        row[field] = str(value)
                
                writer.writerow(row)
        
        print(f"Equipment data saved to {filename}")
    
    def generate_stats_report(self, equipment: List[Dict[str, Any]]):
        """Generate a stats report of the fetched data"""
        print("\n=== EQUIPMENT DATA STATISTICS ===")
        print(f"Total items: {len(equipment)}")
        
        # Count by type
        type_counts = {}
        for item in equipment:
            item_type = item.get('type', 'unknown')
            type_counts[item_type] = type_counts.get(item_type, 0) + 1
        
        print("\nItems by type:")
        for item_type, count in sorted(type_counts.items()):
            print(f"  {item_type}: {count}")
        
        # Count by rarity
        rarity_counts = {}
        for item in equipment:
            rarity = item.get('rarity', 'unknown')
            rarity_counts[rarity] = rarity_counts.get(rarity, 0) + 1
        
        print("\nItems by rarity:")
        for rarity, count in sorted(rarity_counts.items()):
            print(f"  {rarity}: {count}")
        
        # Count by source
        source_counts = {}
        for item in equipment:
            source = item.get('document_slug', 'unknown')
            source_counts[source] = source_counts.get(source, 0) + 1
        
        print("\nItems by source:")
        for source, count in sorted(source_counts.items()):
            print(f"  {source}: {count}")
        
        # Sample of items with all properties
        print("\nSample items with AC data:")
        ac_items = [item for item in equipment if item.get('ac_base')]
        for item in ac_items[:3]:
            print(f"  {item['name']}: AC {item['ac_base']}, Type: {item['type']}")
        
        print("\nSample weapons with damage:")
        weapon_items = [item for item in equipment if item.get('damage_dice')]
        for item in weapon_items[:3]:
            print(f"  {item['name']}: {item['damage_dice']} {item.get('damage_type', '')} damage")

def main():
    print("Starting Open5e Equipment Data Fetch...")
    
    fetcher = Open5eEquipmentFetcher()
    
    try:
        # Fetch all equipment data
        equipment = fetcher.fetch_all_equipment()
        
        # Generate stats report
        fetcher.generate_stats_report(equipment)
        
        # Save to CSV
        fetcher.save_to_csv(equipment)
        
        print("\n=== FETCH COMPLETE ===")
        print("You can now upload 'open5e_equipment.csv' to your Supabase table.")
        print("\nTo upload to Supabase:")
        print("1. Go to your Supabase dashboard")
        print("2. Navigate to Table Editor > open5e_equipment")
        print("3. Click 'Insert' > 'Import data from CSV'")
        print("4. Upload the generated CSV file")
        
    except Exception as e:
        print(f"Error during fetch: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()
