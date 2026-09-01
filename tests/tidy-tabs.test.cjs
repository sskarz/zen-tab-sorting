const test = require("node:test");
const assert = require("node:assert/strict");

const {
  OPENROUTER_MODEL,
  buildTabContext,
  buildOpenRouterRequest,
  validateGroupingPlan,
  parseAndValidateGroupingResponse,
} = require("../tidy-tabs.uc.js");

const ids = ["t0", "t1", "t2", "t3"];
const validPlan = () => ({
  groups: [{ name: "Boston Travel", tab_ids: ["t0", "t3"] }],
  ungrouped_tab_ids: ["t1", "t2"],
});

test("accepts a valid complete partition", () => {
  assert.deepEqual(validateGroupingPlan(validPlan(), ids, false), validPlan());
});

test("rejects unknown, missing, and duplicated ids", () => {
  const unknown = validPlan();
  unknown.ungrouped_tab_ids[1] = "t9";
  assert.throws(() => validateGroupingPlan(unknown, ids, false), /unknown/);

  const missing = validPlan();
  missing.ungrouped_tab_ids.pop();
  assert.throws(() => validateGroupingPlan(missing, ids, false), /missing/);

  const duplicated = validPlan();
  duplicated.ungrouped_tab_ids[0] = "t0";
  assert.throws(() => validateGroupingPlan(duplicated, ids, false), /more than once/);
});

test("rejects singleton groups and duplicate names", () => {
  assert.throws(
    () => validateGroupingPlan({
      groups: [{ name: "Solo", tab_ids: ["t0"] }],
      ungrouped_tab_ids: ["t1", "t2", "t3"],
    }, ids, false),
    /at least two/
  );

  assert.throws(
    () => validateGroupingPlan({
      groups: [
        { name: "Research", tab_ids: ["t0", "t1"] },
        { name: "research", tab_ids: ["t2", "t3"] },
      ],
      ungrouped_tab_ids: [],
    }, ids, false),
    /unique/
  );
});

test("rejects empty and overlong group names", () => {
  for (const name of ["   ", "A name that exceeds 24 chars"]) {
    assert.throws(
      () => validateGroupingPlan({
        groups: [{ name, tab_ids: ["t0", "t1"] }],
        ungrouped_tab_ids: ["t2", "t3"],
      }, ids, false),
      /1 to 24/
    );
  }
});

test("rejects malformed JSON and extra fields", () => {
  assert.throws(
    () => parseAndValidateGroupingResponse("{oops", ids, false),
    /valid JSON/
  );
  const extra = validPlan();
  extra.explanation = "not allowed";
  assert.throws(() => validateGroupingPlan(extra, ids, false), /only groups/);

  const groupExtra = validPlan();
  groupExtra.groups[0].reason = "not allowed";
  assert.throws(() => validateGroupingPlan(groupExtra, ids, false), /extra/);
});

test("rejects an all-ungrouped result when eligible groups already exist", () => {
  assert.throws(
    () => validateGroupingPlan({ groups: [], ungrouped_tab_ids: ids }, ids, true),
    /dissolve/
  );
  assert.doesNotThrow(() =>
    validateGroupingPlan({ groups: [], ungrouped_tab_ids: ids }, ids, false)
  );
});

test("builds privacy-limited tab context", () => {
  const context = buildTabContext({
    title: "Flights to Boston",
    url: "https://www.example.com/private/path?token=secret#details",
    currentGroup: "Trip",
  }, 0);

  assert.deepEqual(context, {
    id: "t0",
    title: "Flights to Boston",
    hostname: "example.com",
    current_group: "Trip",
  });

  const serialized = JSON.stringify(buildOpenRouterRequest([context]));
  assert.match(serialized, /Flights to Boston/);
  assert.match(serialized, /example\.com/);
  assert.doesNotMatch(serialized, /private\/path|token=secret|#details/);
});

test("uses the exact OpenRouter model and privacy contract", () => {
  const request = buildOpenRouterRequest([]);
  assert.equal(OPENROUTER_MODEL, "deepseek/deepseek-v4-flash");
  assert.equal(request.model, OPENROUTER_MODEL);
  assert.equal(request.temperature, 0);
  assert.equal(request.max_tokens, 8192);
  assert.equal(request.stream, false);
  assert.deepEqual(request.provider, {
    zdr: true,
    data_collection: "deny",
    require_parameters: true,
  });
  assert.equal(request.response_format.type, "json_schema");
  assert.equal(request.response_format.json_schema.strict, true);
  assert.equal(
    request.response_format.json_schema.schema.additionalProperties,
    false
  );
});
