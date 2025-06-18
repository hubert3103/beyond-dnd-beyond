
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useCharacters } from '@/hooks/useCharacters';
import { Loader2 } from 'lucide-react';

const CharactersTab = () => {
  const navigate = useNavigate();
  const { characters, loading, deleteCharacter } = useCharacters();
  const [showDeleteDialog, setShowDeleteDialog] = useState<string | null>(null);

  const handleDeleteCharacter = async (id: string) => {
    await deleteCharacter(id);
    setShowDeleteDialog(null);
  };

  const handleEditCharacter = (character: any) => {
    navigate(`/character-creation?edit=${character.id}`);
  };

  const handleNewCharacter = () => {
    navigate('/character-creation');
  };

  const handleCharacterTap = (character: any) => {
    navigate(`/character/${character.id}`);
  };

  if (loading) {
    return (
      <div className="p-4 flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-white" />
        <span className="ml-2 text-white">Loading characters...</span>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      {characters.length === 0 ? (
        // Empty state when no characters exist
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-600 rounded-full mx-auto mb-4 flex items-center justify-center">
            <img 
              src="/characterIcon.svg" 
              alt="No characters"
              className="w-8 h-8"
              style={{
                filter: 'invert(100%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(100%) contrast(100%)'
              }}
            />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">No Characters Yet</h3>
          <p className="text-gray-300 mb-6">Create your first character to get started on your adventure!</p>
        </div>
      ) : (
        // Character list (when characters exist)
        characters.map((character) => (
          <div key={character.id} className="bg-white rounded-lg p-4 flex items-center justify-between">
            <div 
              className="flex items-center space-x-3 flex-1 cursor-pointer"
              onClick={() => handleCharacterTap(character)}
            >
              <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                <img 
                  src="/avatarPlaceholder.svg" 
                  alt="Character avatar"
                  className="w-8 h-8"
                  style={{
                    filter: 'invert(0%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(0%) contrast(100%)'
                  }}
                />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">{character.name}</h3>
                <p className="text-sm text-gray-600">
                  Level {character.level}
                  {character.class_name && ` • ${character.class_name}`}
                </p>
                {character.species_name && (
                  <p className="text-sm text-gray-600">{character.species_name}</p>
                )}
              </div>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="text-gray-600 hover:text-gray-800 p-2 text-xl font-bold">
                  ⋮
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-white border border-gray-200 shadow-lg">
                <DropdownMenuItem onClick={() => handleEditCharacter(character)} className="text-gray-900 hover:bg-gray-100">
                  Edit Character
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowDeleteDialog(character.id)} className="text-red-600 hover:bg-red-50">
                  Delete Character
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ))
      )}
      
      <Button 
        onClick={handleNewCharacter}
        className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg"
      >
        New Character
      </Button>

      {showDeleteDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-sm p-6 space-y-4">
            <h3 className="text-lg font-bold text-gray-900">Delete Character</h3>
            <p className="text-gray-600">Are you sure you want to delete this character? This action cannot be undone.</p>
            <div className="flex space-x-3">
              <Button
                onClick={() => handleDeleteCharacter(showDeleteDialog)}
                variant="destructive"
                className="flex-1"
              >
                Delete
              </Button>
              <Button
                onClick={() => setShowDeleteDialog(null)}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CharactersTab;
