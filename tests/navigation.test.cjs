const test = require("node:test");
const assert = require("node:assert/strict");

const {
  resolveRequestedSection,
  shouldRevealNavigationLink,
} = require("../navigation.js");

test("resolveRequestedSection keeps a valid requested tab", () => {
  assert.equal(
    resolveRequestedSection("#tls", ["about-me", "overview", "tls"]),
    "tls",
  );
});

test("resolveRequestedSection opens the first panel for an empty or unknown hash", () => {
  const sections = ["about-me", "overview", "tls"];

  assert.equal(resolveRequestedSection("", sections), "about-me");
  assert.equal(resolveRequestedSection("#missing", sections), "about-me");
});

test("resolveRequestedSection can refuse an invalid history hash", () => {
  assert.equal(
    resolveRequestedSection("#missing", ["about-me", "overview"], null),
    null,
  );
});

test("shouldRevealNavigationLink detects an active tab outside the visible menu", () => {
  const menu = { top: 180, bottom: 820 };

  assert.equal(
    shouldRevealNavigationLink({ top: 240, bottom: 288 }, menu),
    false,
  );
  assert.equal(
    shouldRevealNavigationLink({ top: 120, bottom: 168 }, menu),
    true,
  );
  assert.equal(
    shouldRevealNavigationLink({ top: 824, bottom: 872 }, menu),
    true,
  );
});
