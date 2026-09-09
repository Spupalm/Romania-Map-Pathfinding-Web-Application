import {
  isCityName,
  isRunMode,
  type CreateSavedRouteInput,
  type WorkflowStep,
} from "./pathfinding";

function isFiniteNonNegative(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0;
}

function isWorkflowStep(value: unknown): value is WorkflowStep {
  if (!value || typeof value !== "object") return false;
  const step = value as Record<string, unknown>;
  return (
    typeof step.step === "number" &&
    Number.isInteger(step.step) &&
    step.step >= 0 &&
    typeof step.expanded_node === "string"
  );
}

export function parseSavedRouteInput(value: unknown):
  | { ok: true; data: CreateSavedRouteInput }
  | { ok: false; error: string } {
  if (!value || typeof value !== "object") {
    return { ok: false, error: "Request body must be an object." };
  }

  const body = value as Record<string, unknown>;

  if (!isCityName(body.start_city) || !isCityName(body.goal_city)) {
    return { ok: false, error: "Invalid start or goal city." };
  }
  if (!isRunMode(body.run_mode)) {
    return { ok: false, error: "Invalid run mode." };
  }
  if (
    !Array.isArray(body.route_path) ||
    body.route_path.length === 0 ||
    !body.route_path.every(isCityName) ||
    body.route_path[0] !== body.start_city ||
    body.route_path.at(-1) !== body.goal_city
  ) {
    return { ok: false, error: "Route path is invalid." };
  }
  if (
    !Array.isArray(body.workflow_steps) ||
    body.workflow_steps.length === 0 ||
    !body.workflow_steps.every(isWorkflowStep) ||
    !body.workflow_steps.every(
      (step, index, steps) => index === 0 || step.step > steps[index - 1].step,
    )
  ) {
    return { ok: false, error: "Workflow steps are invalid." };
  }
  if (!isFiniteNonNegative(body.path_cost_km)) {
    return { ok: false, error: "Path cost must be a non-negative number." };
  }
  if (!isFiniteNonNegative(body.execution_time_ms)) {
    return { ok: false, error: "Execution time must be a non-negative number." };
  }
  if (!isFiniteNonNegative(body.peak_memory_kb)) {
    return { ok: false, error: "Peak memory must be a non-negative number." };
  }

  return {
    ok: true,
    data: {
      start_city: body.start_city,
      goal_city: body.goal_city,
      route_path: body.route_path,
      workflow_steps: body.workflow_steps,
      run_mode: body.run_mode,
      path_cost_km: body.path_cost_km,
      execution_time_ms: body.execution_time_ms,
      peak_memory_kb: body.peak_memory_kb,
    },
  };
}
