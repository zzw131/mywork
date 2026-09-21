import React from 'react';
import { WorkbenchObject } from '../types';
import { AddResourceModal } from './resource/AddResourceModal';

export interface AddObjectFormProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (newObj: WorkbenchObject) => void;
  initialObject?: WorkbenchObject | null;
}

export const AddObjectForm: React.FC<AddObjectFormProps> = ({
  isOpen,
  onClose,
  onAdd,
  initialObject,
}) => {
  return (
    <AddResourceModal
      isOpen={isOpen}
      onClose={onClose}
      onSave={onAdd}
      initialObject={initialObject}
    />
  );
};
