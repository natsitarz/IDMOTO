"use client";

import React, { Suspense } from "react";
import CarPageInner from "../parts/CarPageInner";

export default function CarPage() {
  return (
    <Suspense>
      <CarPageInner />
    </Suspense>
  );
}
