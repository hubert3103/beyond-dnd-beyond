
import { Open5eEquipment } from '../../../services/open5eApi';

interface ItemDetailModalProps {
  item: Open5eEquipment | null;
  onClose: () => void;
}

const ItemDetailModal = ({ item, onClose }: ItemDetailModalProps) => {
  if (!item) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-md p-6 max-h-[80vh] overflow-y-auto">
        <h3 className="text-xl font-bold text-gray-900 mb-4">{item.name}</h3>
        <p className="text-gray-600 mb-2"><strong>Type:</strong> {item.type}</p>
        <p className="text-gray-600 mb-2"><strong>Rarity:</strong> <span className="capitalize">{item.rarity}</span></p>
        {item.cost && (
          <p className="text-gray-600 mb-2"><strong>Cost:</strong> {item.cost.quantity} {item.cost.unit}</p>
        )}
        {item.weight && (
          <p className="text-gray-600 mb-2"><strong>Weight:</strong> {item.weight} lb</p>
        )}
        {item.requires_attunement && (
          <p className="text-gray-600 mb-4"><strong>Requires Attunement:</strong> Yes</p>
        )}
        
        {item.desc && (
          <div className="mb-4">
            <strong className="text-gray-600">Description:</strong>
            <p className="text-gray-600 mt-1" dangerouslySetInnerHTML={{ __html: item.desc }} />
          </div>
        )}
        
        <button
          onClick={onClose}
          className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default ItemDetailModal;
