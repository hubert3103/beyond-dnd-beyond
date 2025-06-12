
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';

interface Character {
  id: string;
  name: string;
  level: number;
  class: string;
  race: string;
  avatar: string;
}

const CharactersTab = () => {
  const navigate = useNavigate();
  const [characters] = useState<Character[]>([
    {
      id: '1',
      name: 'Thalara Brightbranch',
      level: 10,
      class: 'Druid',
      race: 'Wood elf',
      avatar: '/avatarPlaceholder.svg'
    },
    {
      id: '2',
      name: 'Magnus Ironmantle',
      level: 4,
      class: 'Paladin',
      race: 'Mountain dwarf',
      avatar: '/avatarPlaceholder.svg'
    },
    {
      id: '3',
      name: 'Ziri Shadowveil',
      level: 8,
      class: 'Warlock',
      race: 'Tiefling',
      avatar: '/avatarPlaceholder.svg'
    }
  ]);

  const [showDeleteDialog, setShowDeleteDialog] = useState<string | null>(null);

  const handleDeleteCharacter = (id: string) => {
    setShowDeleteDialog(null);
    // Handle character deletion
    console.log('Deleting character:', id);
  };

  const handleEditCharacter = () => {
    navigate('/dm');
  };

  return (
    <div className="p-4 space-y-4">
      {characters.map((character) => (
        <div key={character.id} className="bg-white rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
              <img 
                src={character.avatar} 
                alt="Character avatar"
                className="w-8 h-8"
                style={{
                  filter: 'invert(0%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(0%) contrast(100%)'
                }}
              />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">{character.name}</h3>
              <p className="text-sm text-gray-600">Level {character.level} • {character.class}</p>
              <p className="text-sm text-gray-600">{character.race}</p>
            </div>
          </div>
          
          <ContextMenu>
            <ContextMenuTrigger asChild>
              <button className="text-gray-400 hover:text-gray-600">
                ⋮
              </button>
            </ContextMenuTrigger>
            <ContextMenuContent>
              <ContextMenuItem onClick={handleEditCharacter}>
                Edit Character
              </ContextMenuItem>
              <ContextMenuItem onClick={() => setShowDeleteDialog(character.id)}>
                Delete Character
              </ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu>
        </div>
      ))}
      
      <Button className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg">
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
