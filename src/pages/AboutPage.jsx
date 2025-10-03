import React from 'react';
import { Link } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import styles from './AboutPage.module.css';

export default function AboutPage() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Link to="/" className={styles.backButton} aria-label="Back to home">
          <FaArrowLeft aria-hidden="true" />
        </Link>
        <h1 className={styles.title}>Our Story</h1>
        <div className={styles.spacer} />
      </header>

      <main className={styles.main}>
        <div className={styles.heroImage}>
          <img
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAMyj8dAX6tHVt6LNMk3IcVfn0udwGA3bPASu2v39UGLt-CBcHQxm2LUdvmnmunczhsYIDTRCuAPd_GipZji6T_ogmuNHm1CtVQBxDJ7cBm8mnNC1fKsjkVAw2DfSVL7fclo13m7kzFcYWczDQ9BTpMiIlIi9-1fcm1NsysNv6rhAuFR-nKp4Pp0RAU8qwJRLoDyptZViHQMnF-f2wncRmI2c3e_lMb1136W3W2Ljvwr2Xi84oy1Kmcdefnr1scdzc0wf7YQe-q-1g"
            alt="Couple smiling together"
          />
        </div>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>How We Met</h2>
          <p className={styles.lead}>
            Our paths crossed in the most unexpected way, at a charity event where we were both volunteering. A shared passion for giving back sparked an instant connection, and we spent the evening in deep conversation, discovering our mutual love for adventure, travel, and making a difference in the world.
          </p>
          <div className={styles.imageCard}>
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAtpJ8S9ywEAjubq4mFJ8oAvyvdiVp4CwWuxR6axjgPEK3I61fSGBLZzWPo0mYhtKIn5CJolCT40nCMg_OGH0tlcICyxqoOLCxhwKLTpJ9EBS3Gkh7G-T9ci5DqLACS44Ey6KNwmDti-zC_SA5dMcDYFgEFs8yzvyNt-YYaXLEHNzkx9iRJzic9pG50zDarwjRE7V0lCHw4r6E4oSapcutStldHnGIatKcygwY2DFJzMzx6bD3HHXIDZTeK3DI4xwOhcz9tFBDAgdk"
              alt="A photo from the day they met"
            />
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>The Proposal</h2>
          <p className={styles.lead}>
            During a trip to the serene landscapes of the Scottish Highlands, amidst the breathtaking views of Loch Ness, one of us got down on one knee. The moment was perfect, with the mist rolling over the hills and the sound of the water lapping against the shore. It was a moment of pure joy and love, sealed with a 'yes' that echoed through the valleys.
          </p>
          <div className={styles.imageCard}>
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuARxtlrswl6qoeUsk0sgT4cH2d5ehQA0HNRuhm_5fZSg9kDcCnhywPvC9UFxDHc9Rh3sZTRzkihisyuOAuu6X4h3wM1KcBDSwB_8wUSnITFwZHACh7efIQRSGo2Br53_jF0NF6COx2bNiMj6lhjtTC4WTBV5nMsj-xpStIAQZE0VjTAsR2nNe3oToeoJKQCXm2fflan5h7JiH1YYaSyM4TeMS06o3woQzlvMlrRoyESjt2mYw65Tw9oGc1FIqFe5V2-exF6hoQ9KJE"
              alt="Proposal in the Scottish Highlands"
            />
          </div>
        </section>

        {/* The Wedding section removed per request */}
      </main>
    </div>
  );
}
