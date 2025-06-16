
interface CharacterSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CharacterSelectModal = ({ isOpen, onClose }: CharacterSelectModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-sm p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Add to Character</h3>
        <div className="space-y-2 mb-4">
          <button className="w-full text-left p-3 bg-gray-100 rounded-lg hover:bg-gray-200">
            Thalara Brightbranch
          </button>
          <button className="w-full text-left p-3 bg-gray-100 rounded-lg hover:bg-gray-200">
            Magnus Ironmantle
          </button>
          <button className="w-full text-left p-3 bg-gray-100 rounded-lg hover:bg-gray-200">
            Ziri Shadowveil
          </button>
        </div>
        <button
          onClick={onClose}
          className="w-full bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-3 rounded-lg"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default CharacterSelectModal;
