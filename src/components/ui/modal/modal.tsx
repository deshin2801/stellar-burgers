import { CloseIcon } from '@krgaa/react-developer-burger-ui-components';
import { ModalOverlayUI } from '@ui';
import { memo } from 'react';

import type { TModalProps } from './type';

import styles from './modal.module.css';

export const ModalUI = memo(function ModalUI({
  title,
  onClose,
  children,
}: TModalProps): React.JSX.Element {
  return (
    <>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h3 className="text text_type_main-large">{title}</h3>
          <button className={styles.button} type="button" aria-label="Закрыть">
            <CloseIcon type="primary" onClick={onClose} />
          </button>
        </div>
        <div className={styles.content}>{children}</div>
      </div>
      <ModalOverlayUI onClick={onClose} />
    </>
  );
});
