'use client'                     // NEED THIS to be able to embed HTML in TSX file
import React from 'react'
// import { Constant } from '../model'

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function homePage() {
  const router = useRouter();

  useEffect(() => {
    router.push("/home");
  }, []);

  return null;
}
