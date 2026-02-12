import { test, expect, describe, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { ToolInvocationBadge } from "../ToolInvocationBadge";

afterEach(() => {
  cleanup();
});

describe("ToolInvocationBadge - str_replace_editor commands", () => {
  test("displays 'Creating' for create command", () => {
    render(
      <ToolInvocationBadge
        toolName="str_replace_editor"
        args={{ command: "create", path: "/components/Button.tsx" }}
        state="call"
      />
    );
    expect(screen.getByText("Creating Button.tsx")).toBeDefined();
  });

  test("displays 'Viewing' for view command", () => {
    render(
      <ToolInvocationBadge
        toolName="str_replace_editor"
        args={{ command: "view", path: "/lib/utils.ts" }}
        state="call"
      />
    );
    expect(screen.getByText("Viewing utils.ts")).toBeDefined();
  });

  test("displays 'Editing' for str_replace command", () => {
    render(
      <ToolInvocationBadge
        toolName="str_replace_editor"
        args={{ command: "str_replace", path: "/App.jsx" }}
        state="call"
      />
    );
    expect(screen.getByText("Editing App.jsx")).toBeDefined();
  });

  test("displays 'Updating' for insert command", () => {
    render(
      <ToolInvocationBadge
        toolName="str_replace_editor"
        args={{ command: "insert", path: "/components/Card.tsx" }}
        state="call"
      />
    );
    expect(screen.getByText("Updating Card.tsx")).toBeDefined();
  });

  test("displays 'Reverting' for undo_edit command", () => {
    render(
      <ToolInvocationBadge
        toolName="str_replace_editor"
        args={{ command: "undo_edit", path: "/components/Form.jsx" }}
        state="call"
      />
    );
    expect(screen.getByText("Reverting Form.jsx")).toBeDefined();
  });
});

describe("ToolInvocationBadge - file_manager commands", () => {
  test("displays 'Renaming' for rename command in same directory", () => {
    render(
      <ToolInvocationBadge
        toolName="file_manager"
        args={{
          command: "rename",
          path: "/components/Button.tsx",
          new_path: "/components/PrimaryButton.tsx",
        }}
        state="call"
      />
    );
    expect(
      screen.getByText("Renaming Button.tsx to PrimaryButton.tsx")
    ).toBeDefined();
  });

  test("displays 'Moving' for rename command to different directory", () => {
    render(
      <ToolInvocationBadge
        toolName="file_manager"
        args={{
          command: "rename",
          path: "/components/Button.tsx",
          new_path: "/ui/Button.tsx",
        }}
        state="call"
      />
    );
    expect(screen.getByText("Moving Button.tsx")).toBeDefined();
  });

  test("displays 'Deleting' for delete command", () => {
    render(
      <ToolInvocationBadge
        toolName="file_manager"
        args={{ command: "delete", path: "/components/OldComponent.tsx" }}
        state="call"
      />
    );
    expect(screen.getByText("Deleting OldComponent.tsx")).toBeDefined();
  });
});

describe("ToolInvocationBadge - path handling", () => {
  test("extracts basename from full path", () => {
    render(
      <ToolInvocationBadge
        toolName="str_replace_editor"
        args={{
          command: "create",
          path: "/components/ui/buttons/PrimaryButton.tsx",
        }}
        state="call"
      />
    );
    expect(screen.getByText("Creating PrimaryButton.tsx")).toBeDefined();
  });

  test("handles empty path", () => {
    render(
      <ToolInvocationBadge
        toolName="str_replace_editor"
        args={{ command: "create", path: "" }}
        state="call"
      />
    );
    expect(screen.getByText("Creating unnamed file")).toBeDefined();
  });

  test("handles root path", () => {
    render(
      <ToolInvocationBadge
        toolName="str_replace_editor"
        args={{ command: "create", path: "/" }}
        state="call"
      />
    );
    expect(screen.getByText("Creating unnamed file")).toBeDefined();
  });

  test("handles path without extension", () => {
    render(
      <ToolInvocationBadge
        toolName="str_replace_editor"
        args={{ command: "create", path: "/README" }}
        state="call"
      />
    );
    expect(screen.getByText("Creating README")).toBeDefined();
  });

  test("handles path with spaces", () => {
    render(
      <ToolInvocationBadge
        toolName="str_replace_editor"
        args={{ command: "create", path: "/components/My Component.tsx" }}
        state="call"
      />
    );
    expect(screen.getByText("Creating My Component.tsx")).toBeDefined();
  });

  test("handles path with special characters", () => {
    render(
      <ToolInvocationBadge
        toolName="str_replace_editor"
        args={{ command: "create", path: "/components/@special-file.tsx" }}
        state="call"
      />
    );
    expect(screen.getByText("Creating @special-file.tsx")).toBeDefined();
  });
});

describe("ToolInvocationBadge - state display", () => {
  test("shows spinner for loading state (call)", () => {
    const { container } = render(
      <ToolInvocationBadge
        toolName="str_replace_editor"
        args={{ command: "create", path: "/App.jsx" }}
        state="call"
      />
    );
    const spinner = container.querySelector(".animate-spin");
    expect(spinner).toBeDefined();
  });

  test("shows checkmark for completed state (result)", () => {
    const { container } = render(
      <ToolInvocationBadge
        toolName="str_replace_editor"
        args={{ command: "create", path: "/App.jsx" }}
        state="result"
        result="success"
      />
    );
    const checkmark = container.querySelector(".bg-emerald-500");
    expect(checkmark).toBeDefined();
  });

  test("uses present progressive for loading state", () => {
    render(
      <ToolInvocationBadge
        toolName="str_replace_editor"
        args={{ command: "create", path: "/Button.tsx" }}
        state="call"
      />
    );
    expect(screen.getByText("Creating Button.tsx")).toBeDefined();
  });

  test("uses past tense for completed state", () => {
    render(
      <ToolInvocationBadge
        toolName="str_replace_editor"
        args={{ command: "create", path: "/Button.tsx" }}
        state="result"
        result="success"
      />
    );
    expect(screen.getByText("Created Button.tsx")).toBeDefined();
  });
});

describe("ToolInvocationBadge - edge cases", () => {
  test("handles missing command argument", () => {
    render(
      <ToolInvocationBadge
        toolName="str_replace_editor"
        args={{ path: "/App.jsx" }}
        state="call"
      />
    );
    expect(screen.getByText("Running str_replace_editor")).toBeDefined();
  });

  test("handles missing path argument", () => {
    render(
      <ToolInvocationBadge
        toolName="str_replace_editor"
        args={{ command: "create" }}
        state="call"
      />
    );
    expect(screen.getByText("Creating unnamed file")).toBeDefined();
  });

  test("handles unknown command for str_replace_editor", () => {
    render(
      <ToolInvocationBadge
        toolName="str_replace_editor"
        args={{ command: "unknown_command", path: "/App.jsx" }}
        state="call"
      />
    );
    expect(screen.getByText("Running unknown_command")).toBeDefined();
  });

  test("handles unknown tool name", () => {
    render(
      <ToolInvocationBadge
        toolName="unknown_tool"
        args={{ command: "test" }}
        state="call"
      />
    );
    expect(screen.getByText("unknown_tool")).toBeDefined();
  });

  test("handles null/undefined args", () => {
    render(
      <ToolInvocationBadge
        toolName="str_replace_editor"
        args={{}}
        state="call"
      />
    );
    expect(screen.getByText("Running str_replace_editor")).toBeDefined();
  });

  test("handles empty args object", () => {
    render(
      <ToolInvocationBadge
        toolName="file_manager"
        args={{}}
        state="call"
      />
    );
    expect(screen.getByText("Running file_manager")).toBeDefined();
  });
});

describe("ToolInvocationBadge - fallback tests", () => {
  test("falls back to tool name for unknown tools", () => {
    render(
      <ToolInvocationBadge
        toolName="custom_tool"
        args={{ command: "test", path: "/file.js" }}
        state="call"
      />
    );
    expect(screen.getByText("custom_tool")).toBeDefined();
  });

  test("falls back to generic message for missing critical args in str_replace_editor", () => {
    render(
      <ToolInvocationBadge
        toolName="str_replace_editor"
        args={{}}
        state="call"
      />
    );
    expect(screen.getByText("Running str_replace_editor")).toBeDefined();
  });

  test("handles rename without new_path gracefully", () => {
    render(
      <ToolInvocationBadge
        toolName="file_manager"
        args={{ command: "rename", path: "/file.js" }}
        state="call"
      />
    );
    expect(screen.getByText("Renaming file.js")).toBeDefined();
  });
});

describe("ToolInvocationBadge - partial-call state", () => {
  test("shows spinner for partial-call state", () => {
    const { container } = render(
      <ToolInvocationBadge
        toolName="str_replace_editor"
        args={{ command: "create", path: "/App.jsx" }}
        state="partial-call"
      />
    );
    const spinner = container.querySelector(".animate-spin");
    expect(spinner).toBeDefined();
  });

  test("uses present progressive for partial-call state", () => {
    render(
      <ToolInvocationBadge
        toolName="str_replace_editor"
        args={{ command: "create", path: "/Button.tsx" }}
        state="partial-call"
      />
    );
    expect(screen.getByText("Creating Button.tsx")).toBeDefined();
  });
});

describe("ToolInvocationBadge - verb tense conversion", () => {
  test("converts Creating to Created", () => {
    render(
      <ToolInvocationBadge
        toolName="str_replace_editor"
        args={{ command: "create", path: "/file.js" }}
        state="result"
        result="success"
      />
    );
    expect(screen.getByText("Created file.js")).toBeDefined();
  });

  test("converts Editing to Edited", () => {
    render(
      <ToolInvocationBadge
        toolName="str_replace_editor"
        args={{ command: "str_replace", path: "/file.js" }}
        state="result"
        result="success"
      />
    );
    expect(screen.getByText("Edited file.js")).toBeDefined();
  });

  test("converts Deleting to Deleted", () => {
    render(
      <ToolInvocationBadge
        toolName="file_manager"
        args={{ command: "delete", path: "/file.js" }}
        state="result"
        result="success"
      />
    );
    expect(screen.getByText("Deleted file.js")).toBeDefined();
  });

  test("converts Moving to Moved", () => {
    render(
      <ToolInvocationBadge
        toolName="file_manager"
        args={{
          command: "rename",
          path: "/components/Button.tsx",
          new_path: "/ui/Button.tsx",
        }}
        state="result"
        result="success"
      />
    );
    expect(screen.getByText("Moved Button.tsx")).toBeDefined();
  });
});
