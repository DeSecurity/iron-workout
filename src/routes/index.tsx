import { createFileRoute } from "@tanstack/react-router";
import Index from "@/pages/Index";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Iron Workout — Track Your Lifts" },
      {
        name: "description",
        content:
          "Iron Workout: log sets, reps, and personal records. A fast, focused workout tracker for serious lifters.",
      },
      { property: "og:title", content: "Iron Workout — Track Your Lifts" },
      {
        property: "og:description",
        content: "Log sets, reps, and PRs. A fast, focused workout tracker.",
      },
    ],
  }),
  component: Index,
});
