
# Open5e Equipment Data Fetcher

This Python script fetches equipment data from the Open5e API and generates a CSV file that can be uploaded directly to your Supabase database.

## Setup

1. Install Python 3.7 or higher
2. Install required packages:
   ```bash
   pip install -r requirements.txt
   ```

## Usage

Run the script:
```bash
python fetch_equipment_data.py
```

The script will:
1. Fetch data from multiple Open5e API endpoints (magic items, weapons, armor)
2. Normalize the data to match your Supabase table structure
3. Deduplicate items by name
4. Generate a detailed statistics report
5. Save everything to `open5e_equipment.csv`

## Data Sources

The script fetches from:
- `/magicitems` - Magic items and artifacts
- `/weapons` - All weapon types
- `/armor` - All armor types including shields

## CSV Structure

The generated CSV matches your Supabase `open5e_equipment` table with these columns:
- `slug`, `name`, `type`, `rarity`, `requires_attunement`
- `cost_quantity`, `cost_unit`, `weight`, `description`, `document_slug`
- `ac`, `ac_base`, `ac_add_dex`, `ac_cap_dex`, `dex_bonus`, `max_dex_bonus`
- `damage_dice`, `damage_type`, `category`, `properties`

## Upload to Supabase

1. Go to your Supabase dashboard
2. Navigate to Table Editor > `open5e_equipment`
3. Click "Insert" > "Import data from CSV"
4. Upload the generated `open5e_equipment.csv` file
5. Map the columns (they should auto-match)
6. Import the data

## Features

- **Rate limiting**: Respects API limits with delays between requests
- **Error handling**: Continues fetching even if some requests fail
- **Deduplication**: Removes duplicate items by name
- **Data normalization**: Converts API response to match your database schema
- **Statistics report**: Shows breakdown by type, rarity, and source
- **Progress tracking**: Shows fetch progress in real-time

## Expected Results

You should get approximately:
- 500+ magic items
- 100+ weapons
- 50+ armor pieces
- Total: ~650+ unique equipment items

The script handles all the data transformation needed to make the API data compatible with your application.
