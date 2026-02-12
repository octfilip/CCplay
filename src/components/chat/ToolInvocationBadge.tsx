import { Loader2 } from "lucide-react";

interface ToolInvocationBadgeProps {
  toolName: string;
  args: Record<string, unknown>;
  state: "partial-call" | "call" | "result";
  result?: unknown;
}

function getBasename(path: string): string {
  if (!path || path === "/") return "unnamed file";
  const parts = path.split("/");
  const basename = parts[parts.length - 1];
  return basename || "unnamed file";
}

function isMove(oldPath: string, newPath: string): boolean {
  if (!oldPath || !newPath) return false;
  const oldDir = oldPath.substring(0, oldPath.lastIndexOf("/"));
  const newDir = newPath.substring(0, newPath.lastIndexOf("/"));
  return oldDir !== newDir;
}

function generateFriendlyMessage(
  toolName: string,
  args: Record<string, unknown>
): string {
  const command = args.command as string | undefined;
  const path = args.path as string | undefined;

  if (toolName === "str_replace_editor") {
    if (!command) {
      return "Running str_replace_editor";
    }

    const filename = path ? getBasename(path) : "unnamed file";

    switch (command) {
      case "create":
        return `Creating ${filename}`;
      case "view":
        return `Viewing ${filename}`;
      case "str_replace":
        return `Editing ${filename}`;
      case "insert":
        return `Updating ${filename}`;
      case "undo_edit":
        return `Reverting ${filename}`;
      default:
        return `Running ${command}`;
    }
  }

  if (toolName === "file_manager") {
    if (!command) {
      return "Running file_manager";
    }

    const filename = path ? getBasename(path) : "unnamed file";
    const newPath = args.new_path as string | undefined;

    switch (command) {
      case "rename":
        if (newPath && path && isMove(path, newPath)) {
          return `Moving ${filename}`;
        }
        if (newPath) {
          const newFilename = getBasename(newPath);
          return `Renaming ${filename} to ${newFilename}`;
        }
        return `Renaming ${filename}`;
      case "delete":
        return `Deleting ${filename}`;
      default:
        return `Running ${command}`;
    }
  }

  return toolName;
}

function getFriendlyVerb(message: string, isPastTense: boolean): string {
  if (!isPastTense) return message;

  const verbMap: Record<string, string> = {
    Creating: "Created",
    Viewing: "Viewed",
    Editing: "Edited",
    Updating: "Updated",
    Reverting: "Reverted",
    Moving: "Moved",
    Renaming: "Renamed",
    Deleting: "Deleted",
    Running: "Ran",
  };

  for (const [present, past] of Object.entries(verbMap)) {
    if (message.startsWith(present)) {
      return message.replace(present, past);
    }
  }

  return message;
}

export function ToolInvocationBadge({
  toolName,
  args,
  state,
  result,
}: ToolInvocationBadgeProps) {
  const isCompleted = state === "result" && result !== undefined;
  const friendlyMessage = generateFriendlyMessage(toolName, args);
  const displayMessage = getFriendlyVerb(friendlyMessage, isCompleted);

  return (
    <div className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 bg-neutral-50 rounded-lg text-xs font-mono border border-neutral-200">
      {isCompleted ? (
        <>
          <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
          <span className="text-neutral-700">{displayMessage}</span>
        </>
      ) : (
        <>
          <Loader2 className="w-3 h-3 animate-spin text-blue-600" />
          <span className="text-neutral-700">{displayMessage}</span>
        </>
      )}
    </div>
  );
}
