import React from 'react';
import Modal from './Modal';
import Button from './Button';
import { AlertTriangle } from 'lucide-react';

const ConfirmDialog = ({ isOpen, title, message, onConfirm, onCancel, loading = false }) => {
  return (
    <Modal isOpen={isOpen} onClose={onCancel} title={title} size="sm">
      <div className="flex flex-col items-center text-center">
        <div className="mb-4 rounded-full bg-red-400/10 p-3">
          <AlertTriangle className="h-8 w-8 text-red-400" />
        </div>
        <p className="mb-6 text-slate-300">{message}</p>
        <div className="flex w-full gap-3">
          <Button variant="secondary" onClick={onCancel} className="flex-1">
            Cancelar
          </Button>
          <Button variant="danger" onClick={onConfirm} loading={loading} className="flex-1">
            Confirmar
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;