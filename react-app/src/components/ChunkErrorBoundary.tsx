import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}
interface State {
  failed: boolean;
}

/**
 * Route chunks are content-hashed and the deploy replaces the whole branch, so
 * a tab left open across a deploy requests a chunk that no longer exists. The
 * dynamic import then rejects during render, which would otherwise unmount the
 * entire app and leave a blank page. Catch it and offer a reload — the fresh
 * HTML references the new hashes.
 */
export default class ChunkErrorBoundary extends Component<Props, State> {
  state: State = { failed: false };

  static getDerivedStateFromError(): State {
    return { failed: true };
  }

  componentDidCatch(error: unknown) {
    console.error("Route failed to load:", error);
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <div className="flex flex-col items-center justify-center py-32 px-4 text-center">
        <p className="text-lg font-medium text-zinc-700 dark:text-zinc-300">
          頁面載入失敗
        </p>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          網站可能剛更新過，重新載入即可。
        </p>
        <button
          onClick={() => window.location.reload()}
          style={{ backgroundColor: "var(--color-primary)" }}
          className="mt-6 px-5 py-2 rounded-lg text-white text-sm font-medium hover:opacity-80 transition-opacity"
        >
          重新載入
        </button>
      </div>
    );
  }
}
