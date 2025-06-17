
import requests
import csv
import json
from typing import List, Dict, Any, Optional
import time
import re

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
    
    def parse_cost_from_string(self, cost_str: str) -> tuple[Optional[int], Optional[str]]:
        """Parse cost from various string formats"""
        if not cost_str or cost_str.lower() in ['—', '-', 'varies', 'special']:
            return None, None
        
        # Handle formats like "2 gp", "50 sp", "1,500 gp", etc.
        cost_patterns = [
            r'(\d+(?:,\d{3})*(?:\.\d+)?)\s*([a-z]{2})',  # "1,500 gp" or "2.5 gp"
            r'(\d+(?:,\d{3})*)\s*([a-z]{2})',           # "50 sp"
            r'(\d+)\s*([a-z]{2})',                       # "2 gp"
        ]
        
        for pattern in cost_patterns:
            match = re.search(pattern, cost_str.lower())
            if match:
                quantity_str = match.group(1).replace(',', '')
                try:
                    quantity = int(float(quantity_str))
                    unit = match.group(2)
                    return quantity, unit
                except ValueError:
                    continue
        
        return None, None
    
    def parse_weight_from_string(self, weight_str: str) -> Optional[float]:
        """Parse weight from string format"""
        if not weight_str or weight_str.lower() in ['—', '-', 'varies']:
            return None
        
        # Handle formats like "3 lb.", "1/2 lb.", "0.5 lb", etc.
        weight_patterns = [
            r'(\d+(?:\.\d+)?)\s*lbs?\.?',               # "3 lb." or "3.5 lbs"
            r'(\d+)/(\d+)\s*lbs?\.?',                   # "1/2 lb."
            r'(\d+(?:\.\d+)?)',                         # Just numbers
        ]
        
        for pattern in weight_patterns:
            match = re.search(pattern, weight_str.lower())
            if match:
                if '/' in pattern and len(match.groups()) == 2:
                    # Handle fractions
                    numerator = float(match.group(1))
                    denominator = float(match.group(2))
                    return numerator / denominator
                else:
                    try:
                        return float(match.group(1))
                    except ValueError:
                        continue
        
        return None
    
    def extract_properties_from_desc(self, description: str, item_type: str) -> List[str]:
        """Extract properties from item description"""
        if not description:
            return []
        
        properties = []
        desc_lower = description.lower()
        
        # Common weapon properties
        weapon_properties = [
            'light', 'finesse', 'thrown', 'two-handed', 'versatile', 'heavy',
            'reach', 'loading', 'ammunition', 'special', 'silvered', 'adamantine'
        ]
        
        # Common armor properties
        armor_properties = [
            'stealth disadvantage', 'heavy armor', 'medium armor', 'light armor',
            'shield', 'magical', 'cursed'
        ]
        
        # Magic item properties
        magic_properties = [
            'requires attunement', 'cursed', 'sentient', 'artifact', 'legendary',
            'very rare', 'rare', 'uncommon', 'common'
        ]
        
        all_properties = weapon_properties + armor_properties + magic_properties
        
        for prop in all_properties:
            if prop in desc_lower:
                properties.append(prop.title())
        
        return properties
    
    def normalize_equipment_item(self, item: Dict[str, Any], item_type: str) -> Dict[str, Any]:
        """Normalize an equipment item to match Supabase schema"""
        
        print(f"Processing {item_type}: {item.get('name', 'Unknown')}")
        
        # Handle cost data with improved parsing
        cost_quantity = None
        cost_unit = None
        if item.get('cost'):
            if isinstance(item['cost'], dict):
                cost_quantity = item['cost'].get('quantity')
                cost_unit = item['cost'].get('unit')
            elif isinstance(item['cost'], str):
                cost_quantity, cost_unit = self.parse_cost_from_string(item['cost'])
        
        # Handle weight with improved parsing
        weight = None
        if item.get('weight'):
            if isinstance(item['weight'], (int, float)):
                weight = float(item['weight'])
            elif isinstance(item['weight'], str):
                weight = self.parse_weight_from_string(item['weight'])
        
        # Handle damage data for weapons
        damage_dice = None
        damage_type = None
        if item.get('damage'):
            if isinstance(item['damage'], dict):
                damage_dice = item['damage'].get('damage_dice')
                damage_type = item['damage'].get('damage_type')
            elif isinstance(item['damage'], str):
                # Try to parse damage string
                damage_match = re.search(r'(\d+d\d+(?:\+\d+)?)\s+(\w+)', item['damage'])
                if damage_match:
                    damage_dice = damage_match.group(1)
                    damage_type = damage_match.group(2)
        
        # Handle properties with better extraction
        properties = item.get('properties', [])
        if isinstance(properties, list):
            # Add extracted properties from description
            desc_properties = self.extract_properties_from_desc(item.get('desc', ''), item_type)
            properties.extend(desc_properties)
            properties = list(set(properties))  # Remove duplicates
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
        
        # Handle armor class data with better mapping
        ac = item.get('ac_base') or item.get('ac')
        ac_base = item.get('ac_base') or item.get('ac')
        ac_add_dex = item.get('ac_add_dex')
        ac_cap_dex = item.get('ac_cap_dex')
        
        # Handle dex bonus mapping
        dex_bonus = ac_add_dex
        max_dex_bonus = ac_cap_dex
        
        # Extract AC info from description if not in structured data
        if not ac and item_type in ['armor', 'shield']:
            desc = item.get('desc', '')
            ac_match = re.search(r'AC (\d+)', desc)
            if ac_match:
                ac = int(ac_match.group(1))
                ac_base = ac
        
        # Handle rarity with better defaults
        rarity = item.get('rarity', 'common')
        if not rarity or rarity.lower() == 'none':
            rarity = 'common'
        
        # Handle attunement
        requires_attunement = item.get('requires_attunement', False)
        if not requires_attunement and item.get('desc', ''):
            requires_attunement = 'requires attunement' in item['desc'].lower()
        
        normalized_item = {
            'slug': item.get('slug', ''),
            'name': item.get('name', ''),
            'type': equipment_type,
            'rarity': rarity,
            'requires_attunement': requires_attunement,
            'cost_quantity': cost_quantity,
            'cost_unit': cost_unit,
            'weight': weight,
            'description': item.get('desc', ''),
            'document_slug': item.get('document__slug', ''),
            'ac': ac,
            'ac_base': ac_base,
            'ac_add_dex': ac_add_dex,
            'ac_cap_dex': ac_cap_dex,
            'dex_bonus': dex_bonus,
            'max_dex_bonus': max_dex_bonus,
            'damage_dice': damage_dice,
            'damage_type': damage_type,
            'category': category,
            'properties': properties_json
        }
        
        # Log what we extracted for debugging
        if cost_quantity:
            print(f"  Cost: {cost_quantity} {cost_unit}")
        if weight:
            print(f"  Weight: {weight} lbs")
        if ac:
            print(f"  AC: {ac}")
        if damage_dice:
            print(f"  Damage: {damage_dice} {damage_type}")
        if properties and properties != '[]':
            print(f"  Properties: {properties_json}")
        
        return normalized_item
    
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
            else:
                print(f"Skipping duplicate: {item['name']}")
        
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
        
        # Count items with cost data
        items_with_cost = len([item for item in equipment if item.get('cost_quantity')])
        print(f"\nItems with cost data: {items_with_cost}/{len(equipment)} ({items_with_cost/len(equipment)*100:.1f}%)")
        
        # Count items with weight data
        items_with_weight = len([item for item in equipment if item.get('weight')])
        print(f"Items with weight data: {items_with_weight}/{len(equipment)} ({items_with_weight/len(equipment)*100:.1f}%)")
        
        # Count armor with AC data
        armor_items = [item for item in equipment if item.get('type') in ['armor', 'shield']]
        armor_with_ac = len([item for item in armor_items if item.get('ac')])
        if armor_items:
            print(f"Armor/shields with AC data: {armor_with_ac}/{len(armor_items)} ({armor_with_ac/len(armor_items)*100:.1f}%)")
        
        # Count weapons with damage data
        weapon_items = [item for item in equipment if item.get('type') == 'weapon']
        weapons_with_damage = len([item for item in weapon_items if item.get('damage_dice')])
        if weapon_items:
            print(f"Weapons with damage data: {weapons_with_damage}/{len(weapon_items)} ({weapons_with_damage/len(weapon_items)*100:.1f}%)")
        
        # Sample of items with all properties
        print("\nSample armor with AC data:")
        ac_items = [item for item in equipment if item.get('ac')]
        for item in ac_items[:3]:
            print(f"  {item['name']}: AC {item['ac']}, Type: {item['type']}")
        
        print("\nSample weapons with damage:")
        weapon_items = [item for item in equipment if item.get('damage_dice')]
        for item in weapon_items[:3]:
            print(f"  {item['name']}: {item['damage_dice']} {item.get('damage_type', '')} damage")
        
        print("\nSample items with cost:")
        cost_items = [item for item in equipment if item.get('cost_quantity')]
        for item in cost_items[:3]:
            print(f"  {item['name']}: {item['cost_quantity']} {item.get('cost_unit', '')}")

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
