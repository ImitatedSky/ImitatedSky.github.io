import type { View } from "../types";
import ArrayView from "./ArrayView";
import { GraphView, ListView, TreeView } from "./NodeViews";
import { GridView, IntervalsView, MapView, QueueView, StackView } from "./SimpleViews";

export function ViewRenderer({ view }: { view: View }) {
  switch (view.type) {
    case "array":
      return <ArrayView view={view} />;
    case "grid":
      return <GridView view={view} />;
    case "map":
      return <MapView view={view} />;
    case "stack":
      return <StackView view={view} />;
    case "queue":
      return <QueueView view={view} />;
    case "list":
      return <ListView view={view} />;
    case "tree":
      return <TreeView view={view} />;
    case "graph":
      return <GraphView view={view} />;
    case "intervals":
      return <IntervalsView view={view} />;
  }
}
