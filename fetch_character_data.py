
import requests
import csv
import json
from typing import List, Dict, Any, Optional
import time
import re

class Open5eCharacterDataFetcher:
    def __init__(self):
        self.base_url = 'https://api.open5e.com'
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'D&D Character Data Fetcher'
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
    
    def parse_asi_data(self, asi_data: Any) -> List[Dict[str, Any]]:
        """Parse ability score improvement data"""
        if not asi_data:
            return []
        
        if isinstance(asi_data, str):
            # Try to parse simple formats like "Dex +2, Con +1"
            asi_list = []
            # Match patterns like "Dex +2", "Constitution +1", etc.
            matches = re.findall(r'(\w+)\s*\+(\d+)', asi_data)
            for attr, value in matches:
                # Normalize attribute names
                attr_map = {
                    'str': 'strength', 'dex': 'dexterity', 'con': 'constitution',
                    'int': 'intelligence', 'wis': 'wisdom', 'cha': 'charisma',
                    'strength': 'strength', 'dexterity': 'dexterity', 
                    'constitution': 'constitution', 'intelligence': 'intelligence',
                    'wisdom': 'wisdom', 'charisma': 'charisma'
                }
                normalized_attr = attr_map.get(attr.lower(), attr.lower())
                asi_list.append({
                    'attributes': [normalized_attr],
                    'value': int(value)
                })
            return asi_list
        
        if isinstance(asi_data, list):
            return asi_data
        
        return []
    
    def parse_speed_data(self, speed_data: Any) -> Dict[str, int]:
        """Parse speed data from various formats"""
        if not speed_data:
            return {'walk': 30}  # Default walking speed
        
        if isinstance(speed_data, dict):
            return speed_data
        
        if isinstance(speed_data, str):
            # Try to parse formats like "30 feet", "25 ft", etc.
            speed_match = re.search(r'(\d+)', speed_data)
            if speed_match:
                return {'walk': int(speed_match.group(1))}
        
        if isinstance(speed_data, int):
            return {'walk': speed_data}
        
        return {'walk': 30}  # Default fallback
    
    def parse_classes_list(self, classes_data: Any) -> List[str]:
        """Parse classes data from various formats"""
        if not classes_data:
            return []
        
        if isinstance(classes_data, list):
            # Handle list of objects with 'name' property
            if classes_data and isinstance(classes_data[0], dict):
                return [cls.get('name', str(cls)) for cls in classes_data]
            # Handle list of strings
            return classes_data
        
        if isinstance(classes_data, str):
            # Handle comma-separated strings
            return [cls.strip() for cls in classes_data.split(',')]
        
        return []
    
    def extract_subraces_from_desc(self, description: str, name: str) -> List[Dict[str, str]]:
        """Extract subrace information from description"""
        subraces = []
        
        # Look for common subrace patterns in descriptions
        subrace_patterns = [
            r'(\w+)\s+(?:dwarf|elf|halfling|gnome|dragonborn)',
            r'(?:variant|subrace):\s*(\w+)',
            r'(\w+)\s+heritage',
        ]
        
        for pattern in subrace_patterns:
            matches = re.findall(pattern, description, re.IGNORECASE)
            for match in matches:
                if match.lower() not in name.lower():
                    subraces.append({
                        'name': match.title(),
                        'slug': match.lower().replace(' ', '-')
                    })
        
        return subraces
    
    def extract_archetypes_from_desc(self, description: str) -> List[Dict[str, str]]:
        """Extract archetype/subclass information from description"""
        archetypes = []
        
        # Look for common archetype patterns
        archetype_patterns = [
            r'(?:archetype|path|tradition|circle|oath|domain|patron|school):\s*([^.\n]+)',
            r'(\w+\s+\w+)(?:\s+archetype|\s+path|\s+tradition)',
        ]
        
        for pattern in archetype_patterns:
            matches = re.findall(pattern, description, re.IGNORECASE)
            for match in matches:
                clean_match = match.strip()
                if len(clean_match) > 3:  # Avoid single letters/short matches
                    archetypes.append({
                        'name': clean_match.title(),
                        'slug': clean_match.lower().replace(' ', '-')
                    })
        
        return archetypes[:10]  # Limit to reasonable number
    
    def normalize_race_item(self, item: Dict[str, Any]) -> Dict[str, Any]:
        """Normalize a race item to match Supabase schema"""
        
        print(f"Processing race: {item.get('name', 'Unknown')}")
        
        # Parse ASI data
        asi_data = self.parse_asi_data(item.get('asi'))
        
        # Parse speed data
        speed_data = self.parse_speed_data(item.get('speed'))
        
        # Extract subraces from description
        subraces = self.extract_subraces_from_desc(item.get('desc', ''), item.get('name', ''))
        
        normalized_item = {
            'slug': item.get('slug', ''),
            'name': item.get('name', ''),
            'description': item.get('desc', ''),
            'asi': json.dumps(asi_data),
            'age': item.get('age', ''),
            'alignment': item.get('alignment', ''),
            'size': item.get('size', ''),
            'speed': json.dumps(speed_data),
            'languages': item.get('languages', ''),
            'proficiencies': item.get('proficiencies', ''),
            'traits': item.get('traits', ''),
            'document_slug': item.get('document__slug', ''),
            'subraces': json.dumps(subraces)
        }
        
        # Log what we extracted for debugging
        if asi_data:
            print(f"  ASI: {json.dumps(asi_data)}")
        if speed_data:
            print(f"  Speed: {json.dumps(speed_data)}")
        if subraces:
            print(f"  Subraces: {json.dumps(subraces)}")
        
        return normalized_item
    
    def normalize_class_item(self, item: Dict[str, Any]) -> Dict[str, Any]:
        """Normalize a class item to match Supabase schema"""
        
        print(f"Processing class: {item.get('name', 'Unknown')}")
        
        # Extract archetypes from description
        archetypes = self.extract_archetypes_from_desc(item.get('desc', ''))
        
        normalized_item = {
            'slug': item.get('slug', ''),
            'name': item.get('name', ''),
            'description': item.get('desc', ''),
            'hit_die': item.get('hit_die', 8),  # Default to d8
            'prof_armor': item.get('prof_armor', ''),
            'prof_weapons': item.get('prof_weapons', ''),
            'prof_tools': item.get('prof_tools', ''),
            'prof_saving_throws': item.get('prof_saving_throws', ''),
            'prof_skills': item.get('prof_skills', ''),
            'equipment': item.get('equipment', ''),
            'spellcasting_ability': item.get('spellcasting_ability', ''),
            'subtypes_name': item.get('subtypes_name', ''),
            'document_slug': item.get('document__slug', ''),
            'archetypes': json.dumps(archetypes)
        }
        
        # Log what we extracted for debugging
        if archetypes:
            print(f"  Archetypes: {json.dumps(archetypes)}")
        print(f"  Hit Die: d{normalized_item['hit_die']}")
        
        return normalized_item
    
    def normalize_background_item(self, item: Dict[str, Any]) -> Dict[str, Any]:
        """Normalize a background item to match Supabase schema"""
        
        print(f"Processing background: {item.get('name', 'Unknown')}")
        
        normalized_item = {
            'slug': item.get('slug', ''),
            'name': item.get('name', ''),
            'description': item.get('desc', ''),
            'skill_proficiencies': item.get('skill_proficiencies', ''),
            'languages': item.get('languages', ''),
            'equipment': item.get('equipment', ''),
            'feature': item.get('feature', ''),
            'feature_desc': item.get('feature_desc', ''),
            'document_slug': item.get('document__slug', '')
        }
        
        return normalized_item
    
    def fetch_all_character_data(self) -> tuple[List[Dict[str, Any]], List[Dict[str, Any]], List[Dict[str, Any]]]:
        """Fetch all character creation data from multiple endpoints"""
        
        # Fetch races
        print("Fetching races...")
        races_data = self.fetch_paginated_data('/races')
        races = []
        for item in races_data:
            normalized = self.normalize_race_item(item)
            races.append(normalized)
        
        # Fetch classes
        print("Fetching classes...")
        classes_data = self.fetch_paginated_data('/classes')
        classes = []
        for item in classes_data:
            normalized = self.normalize_class_item(item)
            classes.append(normalized)
        
        # Fetch backgrounds
        print("Fetching backgrounds...")
        backgrounds_data = self.fetch_paginated_data('/backgrounds')
        backgrounds = []
        for item in backgrounds_data:
            normalized = self.normalize_background_item(item)
            backgrounds.append(normalized)
        
        # Deduplicate by name (case-insensitive)
        def deduplicate_by_name(items):
            seen_names = set()
            unique_items = []
            
            for item in items:
                name_lower = item['name'].lower()
                if name_lower not in seen_names:
                    seen_names.add(name_lower)
                    unique_items.append(item)
                else:
                    print(f"Skipping duplicate: {item['name']}")
            
            return unique_items
        
        races = deduplicate_by_name(races)
        classes = deduplicate_by_name(classes)
        backgrounds = deduplicate_by_name(backgrounds)
        
        print(f"Total after deduplication:")
        print(f"  Races: {len(races)}")
        print(f"  Classes: {len(classes)}")
        print(f"  Backgrounds: {len(backgrounds)}")
        
        return races, classes, backgrounds
    
    def save_to_csv(self, data: List[Dict[str, Any]], filename: str, fieldnames: List[str]):
        """Save data to CSV file"""
        if not data:
            print(f"No data to save for {filename}")
            return
        
        print(f"Saving {len(data)} items to {filename}...")
        
        with open(filename, 'w', newline='', encoding='utf-8') as csvfile:
            writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
            writer.writeheader()
            
            for item in data:
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
        
        print(f"Data saved to {filename}")
    
    def generate_stats_report(self, races: List[Dict[str, Any]], classes: List[Dict[str, Any]], backgrounds: List[Dict[str, Any]]):
        """Generate a stats report of the fetched data"""
        print("\n=== CHARACTER DATA STATISTICS ===")
        
        print(f"Total races: {len(races)}")
        print(f"Total classes: {len(classes)}")
        print(f"Total backgrounds: {len(backgrounds)}")
        
        # Count by document source
        def count_by_source(items):
            source_counts = {}
            for item in items:
                source = item.get('document_slug', 'unknown')
                source_counts[source] = source_counts.get(source, 0) + 1
            return source_counts
        
        print("\nRaces by source:")
        race_sources = count_by_source(races)
        for source, count in sorted(race_sources.items()):
            print(f"  {source}: {count}")
        
        print("\nClasses by source:")
        class_sources = count_by_source(classes)
        for source, count in sorted(class_sources.items()):
            print(f"  {source}: {count}")
        
        print("\nBackgrounds by source:")
        bg_sources = count_by_source(backgrounds)
        for source, count in sorted(bg_sources.items()):
            print(f"  {source}: {count}")
        
        # Sample data
        print("\nSample races with ASI data:")
        for race in races[:3]:
            if race.get('asi') and race['asi'] != '[]':
                print(f"  {race['name']}: ASI {race['asi']}")
        
        print("\nSample classes with hit dice:")
        for cls in classes[:3]:
            print(f"  {cls['name']}: d{cls['hit_die']} hit die")
        
        print("\nSample backgrounds with features:")
        for bg in backgrounds[:3]:
            if bg.get('feature'):
                print(f"  {bg['name']}: {bg['feature']}")

def main():
    print("Starting Open5e Character Data Fetch...")
    
    fetcher = Open5eCharacterDataFetcher()
    
    try:
        # Fetch all character data
        races, classes, backgrounds = fetcher.fetch_all_character_data()
        
        # Generate stats report
        fetcher.generate_stats_report(races, classes, backgrounds)
        
        # Define CSV fieldnames for each data type
        race_fieldnames = [
            'slug', 'name', 'description', 'asi', 'age', 'alignment', 'size',
            'speed', 'languages', 'proficiencies', 'traits', 'document_slug', 'subraces'
        ]
        
        class_fieldnames = [
            'slug', 'name', 'description', 'hit_die', 'prof_armor', 'prof_weapons',
            'prof_tools', 'prof_saving_throws', 'prof_skills', 'equipment',
            'spellcasting_ability', 'subtypes_name', 'document_slug', 'archetypes'
        ]
        
        background_fieldnames = [
            'slug', 'name', 'description', 'skill_proficiencies', 'languages',
            'equipment', 'feature', 'feature_desc', 'document_slug'
        ]
        
        # Save to CSV files
        fetcher.save_to_csv(races, 'open5e_races.csv', race_fieldnames)
        fetcher.save_to_csv(classes, 'open5e_classes.csv', class_fieldnames)
        fetcher.save_to_csv(backgrounds, 'open5e_backgrounds.csv', background_fieldnames)
        
        print("\n=== FETCH COMPLETE ===")
        print("Generated files:")
        print("- open5e_races.csv")
        print("- open5e_classes.csv") 
        print("- open5e_backgrounds.csv")
        print("\nTo upload to Supabase:")
        print("1. Go to your Supabase dashboard")
        print("2. Navigate to Table Editor > [table_name]")
        print("3. Click 'Insert' > 'Import data from CSV'")
        print("4. Upload the respective CSV file")
        print("5. Map the columns (they should auto-match)")
        print("6. Import the data")
        
    except Exception as e:
        print(f"Error during fetch: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()
