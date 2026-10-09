import styles from "./page.module.css";

export default function Home() {
  return (
    <main className={styles.container}>
      <div className={styles.heroCard}>
        <div className={styles.badge}>
          <span className={styles.badgeDot} />
          Fase 0: Arnés y Fundamentos Inicializados
        </div>

        <h1 className={styles.title}>DemoPanel Inventory OS</h1>
        <p className={styles.subtitle}>
          Showcase de gestión de inventario empresarial con diseño Apple HIG,
          motor desacoplado multi-nicho y compuertas de verificación.
        </p>

        <div className={styles.grid}>
          <div className={styles.statItem}>
            <div className={styles.statLabel}>Arquitectura</div>
            <div className={styles.statValue}>Next.js 16 + React 19</div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statLabel}>Diseño Base</div>
            <div className={styles.statValue}>Apple HIG Tokens</div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statLabel}>Perfiles de Nicho</div>
            <div className={styles.statValue}>4 Industrias Listas</div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statLabel}>Estado del Arnés</div>
            <div className={styles.statValue} style={{ color: "var(--apple-success)" }}>
              ✓ Activo y Verificado
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
