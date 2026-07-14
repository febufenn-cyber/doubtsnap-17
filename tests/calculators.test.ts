import { describe, expect, it } from "vitest";
import { runTruthEngine } from "../src/core/pipeline";
import { MockProvider } from "../src/providers/mock";
import {
  deterministicCheck,
  applyDeterministicGate,
} from "../src/lab/calculators";
describe("deterministic calculators", () => {
  it.each([
    ["Convert 72 km/h into m/s.", "unit_conversion", 20],
    [
      "A car increases its velocity from 10 m/s to 25 m/s in 5 s. Find its uniform acceleration.",
      "uniform_acceleration",
      3,
    ],
    [
      "A 5 kg block is pulled horizontally by a 20 N force. Friction opposing the motion is 5 N. Find the acceleration.",
      "net_force",
      3,
    ],
  ])("checks %s", async (text, family, value) => {
    const run = await runTruthEngine(
        { problemText: text },
        new MockProvider(),
        { MODEL_PROVIDER: "mock" },
      ),
      check = deterministicCheck(run);
    expect(check.family).toBe(family);
    expect(check.answer?.value).toBe(value);
    expect(check.agreesWithModel).toBe(true);
  });
  it("blocks teaching on deterministic disagreement", async () => {
    const run = await runTruthEngine(
      { problemText: "Convert 72 km/h into m/s." },
      new MockProvider(),
      { MODEL_PROVIDER: "mock" },
    );
    run.solution!.finalAnswer.value = 99;
    const gated = applyDeterministicGate(run, deterministicCheck(run));
    expect(gated.status).toBe("verification_failed");
    expect(gated.teaching).toBeNull();
  });
});
