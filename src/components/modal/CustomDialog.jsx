import React from 'react';
import { useWindowContext } from '../../context/WindowContext';
import { Info, CheckCircle2, AlertTriangle, ShieldAlert, X } from 'lucide-react';

export const CustomDialog = () => {
  const { dialogState, closeDialog } = useWindowContext();

  if (!dialogState || !dialogState.isOpen) return null;

  const { type, title, message, confirmText, cancelText, onConfirm, onCancel } = dialogState;

  const handleConfirm = () => {
    closeDialog();
    if (typeof onConfirm === 'function') {
      onConfirm();
    }
  };

  const handleCancel = () => {
    closeDialog();
    if (typeof onCancel === 'function') {
      onCancel();
    }
  };

  const renderIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle2 size={22} />;
      case 'warning':
        return <AlertTriangle size={22} />;
      case 'danger':
        return <ShieldAlert size={22} />;
      case 'info':
      default:
        return <Info size={22} />;
    }
  };

  return (
    <div className="win11-dialog-overlay" onClick={handleCancel}>
      <div className={`win11-dialog-card dialog-type-${type}`} onClick={(e) => e.stopPropagation()}>
        {/* Header Badge & Close */}
        <div className="win11-dialog-header">
          <div className={`win11-dialog-badge badge-type-${type}`}>
            {renderIcon()}
          </div>
          <button className="win11-dialog-close" onClick={handleCancel} title="Tutup">
            <X size={15} />
          </button>
        </div>

        {/* Content */}
        <div className="win11-dialog-body">
          <h3 className="win11-dialog-title">{title}</h3>
          <p className="win11-dialog-message">{message}</p>
        </div>

        {/* Actions */}
        <div className="win11-dialog-footer">
          {cancelText && (
            <button className="btn-dialog-cancel" onClick={handleCancel}>
              {cancelText}
            </button>
          )}
          <button className={`btn-dialog-confirm btn-confirm-${type}`} onClick={handleConfirm}>
            {confirmText || 'Mengerti'}
          </button>
        </div>
      </div>
    </div>
  );
};
