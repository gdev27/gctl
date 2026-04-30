import React from "react";
import Hero from "../components/landing/Hero";
import Pillars from "../components/landing/Pillars";
import HowItWorks from "../components/landing/HowItWorks";
import UseCases from "../components/landing/UseCases";
import CtaBlock from "../components/landing/CtaBlock";

export default function Landing() {
  return (
    <>
      <Hero />
      <Pillars />
      <HowItWorks />
      <UseCases />
      <CtaBlock />
    </>
  );
}