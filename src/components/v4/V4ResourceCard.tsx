import React from 'react';
import { WorkbenchObject } from '../../types';
import { Resource, ResourceSize } from '../../types/resource';
import { toResource } from '../../adapters/resourceAdapter';
import { ResourceCard } from '../resource/ResourceCard';

export interface V4ResourceCardProps {
  object: WorkbenchObject;
  isOwner: boolean;
  editMode: boolean;
  onSelect: (obj: WorkbenchObject) => void;
  onTogglePin?: (id: string) => void;
  onDelete?: (id: string) => void;
  onEdit?: (obj: WorkbenchObject) => void;
  onChangeSize?: (id: string, newSize: ResourceSize) => void;
}

export const V4ResourceCard: React.FC<V4ResourceCardProps> = ({
  object,
  isOwner,
  editMode,
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
      editMode={editMode}
      onSelect={() => onSelect(object)}
      onTogglePin={onTogglePin}
      onDelete={onDelete}
      onEdit={onEdit ? () => onEdit(object) : undefined}
      onChangeSize={onChangeSize}
    />
  );
};
