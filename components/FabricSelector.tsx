'use client';

import Image from 'next/image';
import { Fabric } from '@/types';

interface FabricSelectorProps {
  fabrics: Fabric[];
  selectedFabric: string;
  onSelect: (fabricId: string) => void;
  label: string;
}

export default function FabricSelector({
  fabrics,
  selectedFabric,
  onSelect,
  label,
}: FabricSelectorProps) {
  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-charcoal">
        {label}
      </label>
      <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
        {fabrics.map((fabric) => (
          <button
            key={fabric.id}
            onClick={() => onSelect(fabric.id)}
            className={`fabric-option aspect-square ${
              selectedFabric === fabric.id ? 'selected' : ''
            }`}
            title={fabric.name}
          >
            <Image
              src={fabric.image}
              alt={fabric.name}
              fill
              sizes="(max-width: 640px) 20vw, (max-width: 768px) 15vw, 10vw"
              className="object-cover"
              loading="lazy"
              quality={75}
            />
          </button>
        ))}
      </div>
      {selectedFabric && (
        <p className="text-sm text-gray-500">
          Valt: <span className="font-medium text-pink-500">{fabrics.find(f => f.id === selectedFabric)?.name}</span>
        </p>
      )}
    </div>
  );
}
