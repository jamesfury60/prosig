// components/loaders/DiamondLoader.jsx

import styles from "./LoadingBubble.module.css";

export default function LoadingDiamond({
  message = "Preparing your dashboard...",
}) {
  return (
    <div className={styles.container}>
      <div className={styles.diamond}>
        <div className={styles.inner} />
      </div>

      {/* <div className={styles.text}>
        <span>{message}</span>
        <i />
      </div> */}
    </div>
  );
}
