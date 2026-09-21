import React from 'react';
import { WorkbenchObject } from '../types';
import { DetailModal } from './resource/DetailModal';

export interface PreviewOverlayProps {
  object: WorkbenchObject | null;
  onClose: () => void;
  onEdit?: (obj: WorkbenchObject) => void;
}

export const PreviewOverlay: React.FC<PreviewOverlayProps> = ({ object, onClose, onEdit }) => {
  return <DetailModal object={object} onClose={onClose} onEdit={onEdit} />;
};
