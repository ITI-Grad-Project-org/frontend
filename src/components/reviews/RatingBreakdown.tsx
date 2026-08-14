import { useMemo } from "react";
import { Bar, BarChart, XAxis, YAxis, CartesianGrid } from "recharts";
import type { RatingSummary, Review } from "@/types/reviews";
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import CardInk from "@/components/cards/CardInk";
import { StarRating } from "./ReviewCard";

const ratingConfig = {
  count: { label: "Reviews", color: "var(--chart-3)" },
} satisfies ChartConfig;

function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

interface RatingBreakdownProps {
  reviews: Review[];
  summary: RatingSummary;
}

export function RatingBreakdown({ reviews, summary }: RatingBreakdownProps) {
  const data = useMemo(() => {
    const counts = [0, 0, 0, 0, 0];
    for (const review of reviews) {
      const rating = Math.min(5, Math.max(1, Math.round(review.rating)));
      counts[rating - 1] += 1;
    }
    const total = reviews.length;
    return [5, 4, 3, 2, 1].map((rating) => ({
      rating,
      count: counts[rating - 1],
      share: total > 0 ? round1((counts[rating - 1] / total) * 100) : 0,
    }));
  }, [reviews]);

  const hasData = reviews.length > 0;

  return (
    <CardInk className="min-w-0 overflow-hidden">
      <CardHeader>
        <CardTitle className="text-lg">Rating Breakdown</CardTitle>
        <CardDescription>
          How your clients rated you, from 1 to 5 stars
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        {!hasData ? (
          <div className="flex h-[190px] items-center justify-center text-sm text-muted-foreground">
            No reviews yet
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,240px)] lg:grid-cols-[minmax(0,1fr)_minmax(0,260px)] items-center">
            {/* Rating summary */}
            <div className="flex flex-col items-center gap-1 text-center md:order-2">
              <span className="text-5xl font-black text-ink-foreground tabular-nums leading-tight">
                {summary.average > 0 ? summary.average.toFixed(1) : "–"}
              </span>
              <StarRating rating={Math.round(summary.average)} size={18} />
              <span className="text-sm text-muted-foreground mt-1">
                {summary.count} {summary.count === 1 ? "review" : "reviews"}
              </span>
            </div>

            {/* Histogram */}
            <div className="min-w-0 md:order-1">
              <ChartContainer config={ratingConfig} className="h-[170px] w-full min-w-0">
                <BarChart
                  accessibilityLayer
                  data={data}
                  layout="vertical"
                  margin={{ top: 5, right: 16, left: 0, bottom: 5 }}
                >
                  <CartesianGrid horizontal={false} />
                  <XAxis
                    type="number"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    allowDecimals={false}
                    tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
                  />
                  <YAxis
                    type="category"
                    dataKey="rating"
                    width={40}
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tickFormatter={(value: number) => `${value} ★`}
                    tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
                  />
                  <ChartTooltip
                    cursor={false}
                    content={
                      <ChartTooltipContent
                        hideLabel
                        formatter={(value) =>
                          `${value} ${Number(value) === 1 ? "review" : "reviews"}`
                        }
                      />
                    }
                  />
                  <Bar dataKey="count" fill="var(--color-count)" radius={6} barSize={18} />
                </BarChart>
              </ChartContainer>
              <ChartLegend content={<ChartLegendContent />} />
            </div>
          </div>
        )}
      </CardContent>
    </CardInk>
  );
}