import { useState } from 'react'
export const useBoardDrag=()=>{const [sourceSlot,setSourceSlot]=useState<number>();return {sourceSlot,setSourceSlot}}
