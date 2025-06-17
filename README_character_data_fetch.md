
# Open5e Character Data Fetcher

This Python script fetches character creation data (races, classes, backgrounds) from the Open5e API and generates CSV files that can be uploaded directly to your Supabase database.

## Setup

1. Install Python 3.7 or higher
2. Install required packages:
   ```bash
   pip install -r requirements.txt
   ```

## Usage

Run the script:
```bash
python fetch_character_data.py
```

The script will:
1. Fetch data from multiple Open5e API endpoints (races, classes, backgrounds)
2. Normalize the data to match your Supabase table structures
3. Extract additional data from descriptions (subraces, archetypes, etc.)
4. Deduplicate items by name
5. Generate detailed statistics reports
6. Save everything to separate CSV files

## Data Sources

The script fetches from:
- `/races` - All player character races and their variants
- `/classes` - All character classes with proficiencies and features
- `/backgrounds` - All character backgrounds with features and equipment

## Generated Files

- `open5e_races.csv` - Matches your `open5e_races` table
- `open5e_classes.csv` - Matches your `open5e_classes` table  
- `open5e_backgrounds.csv` - Matches your `open5e_backgrounds` table

## CSV Structure

### Races CSV
- `slug`, `name`, `description`, `asi`, `age`, `alignment`, `size`
- `speed`, `languages`, `proficiencies`, `traits`, `document_slug`, `subraces`

### Classes CSV
- `slug`, `name`, `description`, `hit_die`, `prof_armor`, `prof_weapons`
- `prof_tools`, `prof_saving_throws`, `prof_skills`, `equipment`
- `spellcasting_ability`, `subtypes_name`, `document_slug`, `archetypes`

### Backgrounds CSV
- `slug`, `name`, `description`, `skill_proficiencies`, `languages`
- `equipment`, `feature`, `feature_desc`, `document_slug`

## Upload to Supabase

For each CSV file:
1. Go to your Supabase dashboard
2. Navigate to Table Editor > [respective table]
3. Click "Insert" > "Import data from CSV"
4. Upload the CSV file
5. Map the columns (should auto-match)
6. Import the data

## Features

- **Smart Data Parsing**: Converts API responses to match your database schema
- **ASI Extraction**: Parses ability score improvements from various text formats
- **Speed Normalization**: Handles different speed data formats
- **Subrace Detection**: Extracts subrace information from descriptions
- **Archetype Discovery**: Finds class archetypes/subclasses in text
- **Rate limiting**: Respects API limits with delays between requests
- **Error handling**: Continues fetching even if some requests fail
- **Deduplication**: Removes duplicate items by name
- **Statistics report**: Shows breakdown by type, source, and completeness
- **Progress tracking**: Shows fetch progress in real-time

## Expected Results

You should get approximately:
- 30+ races (including variants and subraces)
- 12+ classes (core D&D classes)
- 20+ backgrounds
- Total: ~60+ character creation options

The script handles all the data transformation needed to make the API data compatible with your character creation system.

## Data Quality Features

- **ASI Parsing**: Converts text like "Dex +2, Con +1" to structured JSON
- **Speed Handling**: Normalizes "30 feet", "25 ft", etc. to consistent format
- **JSON Fields**: Properly formats arrays for subraces, archetypes, and ASI data
- **Missing Data**: Provides sensible defaults for missing information
- **Text Cleaning**: Removes extra whitespace and normalizes formatting
