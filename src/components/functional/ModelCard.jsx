import { BellRing, Check } from "lucide-react"
import { Stats, OrbitControls } from '@react-three/drei'
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Canvas } from '@react-three/fiber'
import MacStatsChart from "./MacStatsChart"


export function CardDemo({ className, ...props }) {
  return (
    <Card className={cn("w-[35vw]", className, )} {...props}>
      <CardHeader>
        <CardTitle>DL STATS</CardTitle>
        <CardDescription>Downlink PRBs</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
      <MacStatsChart attribute="ul_aggr_prb" />
      </CardContent>
      <CardFooter>
       
      </CardFooter>
    </Card>
  )
}
