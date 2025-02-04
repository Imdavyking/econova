import type { ReactNode } from "react";
import clsx from "clsx";
import Heading from "@theme/Heading";
import styles from "./styles.module.css";

type FeatureItem = {
  title: string;
  Svg: React.ComponentType<React.ComponentProps<"svg">>;
  description: ReactNode;
};

const FeatureList: FeatureItem[] = [
  {
    title: "Transparent & Secure",
    Svg: require("@site/static/img/undraw_secure_data.svg").default,
    description: (
      <>
        EcoNova leverages blockchain technology to ensure all donations are
        transparent, traceable, and secure.
      </>
    ),
  },
  {
    title: "Impactful Giving",
    Svg: require("@site/static/img/undraw_impactful_donation.svg").default,
    description: (
      <>
        Every donation directly supports verified causes, maximizing the impact
        and ensuring funds reach the right hands.
      </>
    ),
  },
  {
    title: "Built for the Future",
    Svg: require("@site/static/img/undraw_blockchain_future.svg").default,
    description: (
      <>
        EcoNova integrates decentralized finance (DeFi) and smart contracts to
        revolutionize the way charitable contributions work.
      </>
    ),
  },
];

function Feature({ title, Svg, description }: FeatureItem) {
  return (
    <div className={clsx("col col--4")}>
      <div className="text--center">
        <Svg className={styles.featureSvg} role="img" />
      </div>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): ReactNode {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
