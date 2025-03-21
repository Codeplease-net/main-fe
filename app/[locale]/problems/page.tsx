"use client"

import React from "react"
import ProblemsPage from "@/components/Problems/ProblemsetPage"
import Footer from "@/components/footer"
import Header from "@/components/header"

interface SearchParams {
  [key: string]: string | undefined
}

export default function ProblemSetPage({ searchParams }: { searchParams: SearchParams }) {
  return (
  <>
    <header>
      <title>Problem Collection</title>
    </header>
    <Header/>
    <ProblemsPage searchParams={searchParams} />
    <Footer />
  </>
  )
}