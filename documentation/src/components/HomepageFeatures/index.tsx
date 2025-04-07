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
    title: "Automated & Trustless Donations",
    Svg: require("@site/static/img/undraw_impactful_donation.svg").default,
    description: (
      <>
        With Gelato-powered automation, donations are executed seamlessly,
        eliminating manual interventions and ensuring funds reach verified
        causes.
      </>
    ),
  },
  {
    title: "AI-Powered Insights",
    Svg: require("@site/static/img/undraw_ai_future.svg").default,
    description: (
      <>
        From AI-driven price predictions to intelligent portfolio management,
        EcoNova empowers users with real-time insights for informed decisions.
      </>
    ),
  },
  {
    title: "Seamless Cross-Chain Transfers",
    Svg: require("@site/static/img/undraw_cross_chain.svg").default,
    description: (
      <>
        EcoNova enables cost-efficient, decentralized cross-chain transactions
        via deBridge and LayerZero, ensuring seamless asset movement.
      </>
    ),
  },
  {
    title: "AI-Powered Tutoring & Audits",
    Svg: require("@site/static/img/undraw_teaching_ai.svg").default,
    description: (
      <>
        Learn about DeFi, AI, and blockchain security with an AI tutor, and
        audit smart contracts using SonicScan and GitHub Solidity analysis.
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
