import React from 'react';
import { WorkbenchObject } from '../../types';
import { ResourceSize } from '../../types/resource';
import { ResourceCard } from '../resource/ResourceCard';

export interface V4ResourceCardProps {
  object: WorkbenchObject;
  isOwner: boolean;
  onSelect: (obj: WorkbenchObject) => void;
  onTogglePin?: (id: string) => void;
  onDelete?: (id: string) => void;
  onEdit?: (obj: WorkbenchObject) => void;
  onChangeSize?: (id: string, newSize: ResourceSize) => void;
}

export const V4ResourceCard: React.FC<V4ResourceCardProps> = ({
  object,
  isOwner,
  onSelect,
  onTogglePin,
  onDelete,
  onEdit,
  onChangeSize,
}) => {
  return (
    <ResourceCard
      resource={object}
      isOwner={isOwner}
      onSelect={() => onSelect(object)}
      onTogglePin={onTogglePin}
      onDelete={onDelete}
      onEdit={onEdit ? () => onEdit(object) : undefined}
      onChangeSize={onChangeSize}
    />
  );
};
