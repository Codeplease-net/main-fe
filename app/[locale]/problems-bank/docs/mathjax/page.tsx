"use client";
import Footer from "@/components/footer";
import Header from "@/components/header";
import MathJaxInstructions from "@/components/ProblemsBank/docs/mathjax";

export default function MathJaxInstructionsPage() {
  return (
    <div>
      <head>
        <title>MathJax Documentation</title>
      </head>
      <Header/>
      <MathJaxInstructions />
      <Footer/>
    </div>
  );
}
