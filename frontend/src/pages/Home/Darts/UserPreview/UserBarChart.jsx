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
import { format, subDays } from "date-fns"

const chartConfig = {
  normal: {
    label: "Normal",
    color: "hsl(var(--chart-1))",
  },
  doubles: {
    label: "Doubles",
    color: "hsl(var(--chart-2))",
  },
  triples: {
    label: "Triples",
    color: "hsl(var(--chart-3))",
  },
  overthrows: {
    label: "Overthrows",
    color: "hsl(var(--chart-4))",
  },
  doors: {
    label: "Doors",
    color: "hsl(var(--chart-5))",
  },
}

export function UserBarChart({ dartUser }) {
  const [chartData, setChartData] = useState([
    { date: "01.12.2024", normal: 0, doubles: 0, triples: 0, overthrows: 0, doors: 0 },
    { date: "02.12.2024", normal: 0, doubles: 0, triples: 0, overthrows: 0, doors: 0 },
    { date: "03.12.2024", normal: 0, doubles: 0, triples: 0, overthrows: 0, doors: 0 },
    { date: "04.12.2024", normal: 0, doubles: 0, triples: 0, overthrows: 0, doors: 0 },
    { date: "05.12.2024", normal: 0, doubles: 0, triples: 0, overthrows: 0, doors: 0 },
  ])

  const [date, setDate] = useState({
    from: subDays(Date.now(), 30),
    to: Date.now(),
  });

  const handleGetGamesInDateRange = async () => {
    if (date?.from && date?.to) {
      date.from = new Date(date.from).setHours(0, 0, 0, 0);
      date.to = new Date(date.to).setHours(23, 59, 59, 999);

      let sameDateCounter = 0;
      const gamesInRangeChartData = dartUser.games.map((game, i) => {
        if (new Date(game.created_at) >= new Date(date.from) && new Date(game.created_at) <= new Date(date.to)) {
          const dartsGameUser = game.users.find((user) => user.displayName === dartUser.displayName);
          let gameDate = format(game.created_at.split("T")[0], "dd.MM.yyyy");
          const previousGame = dartUser.games[i - 1];
          if (previousGame) {
            const previousGameDate = format(previousGame.created_at.split("T")[0], "dd.MM.yyyy");
            if (previousGameDate === gameDate.split(" ")[0]) {
              gameDate = `${gameDate.split(".")[0]}.${gameDate.split(".")[1]} (${sameDateCounter + 2})`;
              sameDateCounter += 1;
            } else {
              sameDateCounter = 0;
            }
          }
          return {
            date: gameDate,
            normal: dartsGameUser.throws["normal"],
            doubles: dartsGameUser.throws["doubles"],
            triples: dartsGameUser.throws["triples"],
            overthrows: dartsGameUser.throws["overthrows"],
            doors: dartsGameUser.throws["doors"],
          };
        }
      }).filter((game) => game !== undefined);
      setChartData(gamesInRangeChartData);
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
              {new Date(date.from).toLocaleDateString()} - {new Date(date.to).toLocaleDateString()} ({chartData && chartData.length})
            </>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {chartData && (
          <ChartContainer config={chartConfig} className="aspect-auto h-[500px] w-full">
            <LineChart
              accessibilityLayer
              data={chartData}
              margin={{
                left: 35,
                right: 35,
              }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickMargin={8}
              />
              <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
              <Line
                dataKey="normal"
                type="monotone"
                stroke="var(--color-normal)"
                strokeWidth={2}
                dot={false}
              />
              <Line
                dataKey="doubles"
                type="monotone"
                stroke="var(--color-doubles)"
                strokeWidth={2}
                dot={false}
              />
              <Line
                dataKey="triples"
                type="monotone"
                stroke="var(--color-triples)"
                strokeWidth={2}
                dot={false}
              />
              <Line
                dataKey="overthrows"
                type="monotone"
                stroke="var(--color-overthrows)"
                strokeWidth={2}
                dot={false}
              />
              <Line
                dataKey="doors"
                type="monotone"
                stroke="var(--color-doors)"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ChartContainer>
        )}
      </CardContent>
      <CardFooter>
        <div className="flex w-full items-start gap-2 text-sm">
          <DatePickerWithRange date={date} setDate={setDate} />
        </div>
      </CardFooter>
    </Card>
  )
}
