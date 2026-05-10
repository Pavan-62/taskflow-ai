import { forwardRef } from 'react';
import clsx from 'clsx';
import styles from './Input.module.css';

export const Input = forwardRef(({ label, error, className, id, ...props }, ref) => {
  return (
    <div className={clsx(styles.wrapper, className)}>
      {label && (
        <label htmlFor={id} className={styles.label}>
          {label}
        </label>
      )}
      <input
        id={id}
        ref={ref}
        className={clsx(styles.input, error && styles.hasError)}
        {...props}
      />
      {error && <span className={styles.errorText}>{error}</span>}
    </div>
  );
});

Input.displayName = 'Input';
