import styles from './AuthLayout.module.css';

export default function AuthLayout({ children }) {
  return (
    <div className={styles.container}>
      <div className={styles.leftPane}>
        <div className={styles.branding}>
          <h1>TaskFlow AI</h1>
          <p>Modern collaborative productivity SaaS.</p>
        </div>
      </div>
      <div className={styles.rightPane}>
        <div className={styles.formContainer}>
          {children}
        </div>
      </div>
    </div>
  );
}
