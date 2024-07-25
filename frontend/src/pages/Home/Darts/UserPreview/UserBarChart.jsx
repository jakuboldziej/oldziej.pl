import { CartesianGrid, Line, LineChart, XAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/shadcn/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/shadcn/chart"
import { DatePickerWithRange } from "./DatePickerWithRange"
import { useEffect, useState } from "react"
import { subDays } from "date-fns"

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "hsl(var(--chart-1))",
  },
  mobile: {
    label: "Mobile",
    color: "hsl(var(--chart-2))",
  },
}

export function UserBarChart({ dartUser }) {
  const [gamesInDateRange, setGamesInDateRange] = useState(null);

  const [chartData, setChartData] = useState([
    { date: "01.12.2024", desktop: 186, mobile: 80 },
    { date: "02.12.2024", desktop: 305, mobile: 200 },
    { date: "03.12.2024", desktop: 237, mobile: 120 },
    { date: "04.12.2024", desktop: 73, mobile: 190 },
    { date: "05.12.2024", desktop: 209, mobile: 130 },
    { date: "06.12.2024", desktop: 214, mobile: 140 },
  ])

  const [date, setDate] = useState({
    from: subDays(Date.now(), 5),
    to: new Date(Date.now()),
  });

  const handleGetGamesInDateRange = async () => {
    if (date.from && date.to) {
      const gamesInRange = dartUser.games.filter((game) => {
        if (new Date(game.created_at) > new Date(date.from) && new Date(game.created_at) < new Date(date.to)) {
          return game;
        }
      })
      setGamesInDateRange(gamesInRange);
    }
  }

  useEffect(() => {
    handleGetGamesInDateRange();
  }, [date]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Throws</CardTitle>
        <CardDescription>
          {date?.from && date?.to && (
            <>
              {date.from.toLocaleDateString()} - {date.to.toLocaleDateString()}
            </>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <LineChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickMargin={8}
              tickFormatter={(value) => value.slice(0, 5)}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <Line
              dataKey="desktop"
              type="monotone"
              stroke="var(--color-desktop)"
              strokeWidth={2}
              dot={false}
            />
            <Line
              dataKey="mobile"
              type="monotone"
              stroke="var(--color-mobile)"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
      <CardFooter>
        <div className="flex w-full items-start gap-2 text-sm">
          <DatePickerWithRange date={date} setDate={setDate} />
        </div>
      </CardFooter>
    </Card>
  )
}
