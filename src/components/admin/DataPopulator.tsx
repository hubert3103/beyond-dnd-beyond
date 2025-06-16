
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useOpen5eData } from '../../hooks/useOpen5eData';
import { Loader2 } from 'lucide-react';

const DataPopulator = () => {
  const { populateData } = useOpen5eData();
  const [populatingType, setPopulatingType] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<string | null>(null);

  const handlePopulate = async (type: string) => {
    setPopulatingType(type);
    setLastResult(null);
    
    try {
      await populateData(type);
      setLastResult(`Successfully populated ${type} data!`);
    } catch (error) {
      console.error('Error populating data:', error);
      setLastResult(`Error populating ${type}: ${error.message}`);
    } finally {
      setPopulatingType(null);
    }
  };

  const dataTypes = [
    { key: 'spells', label: 'Spells', description: 'Populate spell database' },
    { key: 'equipment', label: 'Equipment', description: 'Populate equipment, weapons, and armor' },
    { key: 'races', label: 'Races', description: 'Populate character races' },
    { key: 'classes', label: 'Classes', description: 'Populate character classes' },
    { key: 'backgrounds', label: 'Backgrounds', description: 'Populate character backgrounds' },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">Data Population Admin</h1>
        <p className="text-gray-600">
          Use these controls to populate your local database with Open5e data. 
          This will improve performance by eliminating the need to fetch from external APIs.
        </p>
      </div>

      {lastResult && (
        <Card className={lastResult.includes('Error') ? 'border-red-500' : 'border-green-500'}>
          <CardContent className="p-4">
            <p className={lastResult.includes('Error') ? 'text-red-600' : 'text-green-600'}>
              {lastResult}
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {dataTypes.map((dataType) => (
          <Card key={dataType.key} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="text-lg">{dataType.label}</CardTitle>
              <p className="text-sm text-gray-600">{dataType.description}</p>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => handlePopulate(dataType.key)}
                disabled={populatingType !== null}
                className="w-full"
              >
                {populatingType === dataType.key ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Populating...
                  </>
                ) : (
                  `Populate ${dataType.label}`
                )}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Instructions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm text-gray-600">
            1. Click on each "Populate" button to fetch data from the Open5e API and store it locally.
          </p>
          <p className="text-sm text-gray-600">
            2. Start with Spells and Equipment as they are most commonly used.
          </p>
          <p className="text-sm text-gray-600">
            3. The process may take a few minutes for each data type.
          </p>
          <p className="text-sm text-gray-600">
            4. Once populated, your app will load much faster without external API calls.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default DataPopulator;
