"use client";

import { CSSProperties, useEffect, useMemo, useState } from "react";

type TestId =
  | "pattern"
  | "pixelBlack"
  | "pixelWhite"
  | "pixelRed"
  | "pixelGreen"
  | "pixelBlue"
  | "uniformity"
  | "colorDistance"
  | "gradients"
  | "sharpness"
  | "viewingAngle"
  | "gamma"
  | "response";

type OverviewId =
  | "pattern"
  | "pixels"
  | "uniformity"
  | "colorDistance"
  | "gradients"
  | "sharpness"
  | "viewingAngle"
  | "gamma"
  | "response";

type Mode = "overview" | "guide" | "test";

type RGB = {
  r: number;
  g: number;
  b: number;
};

const overviewTests: Array<{
  id: OverviewId;
  title: string;
  expandsTo: TestId[];
}> = [
  { id: "pattern", title: "Test Pattern", expandsTo: ["pattern"] },
  {
    id: "pixels",
    title: "Defective Pixels",
    expandsTo: [
      "pixelBlack",
      "pixelWhite",
      "pixelRed",
      "pixelGreen",
      "pixelBlue",
    ],
  },
  { id: "uniformity", title: "Uniformity", expandsTo: ["uniformity"] },
  {
    id: "colorDistance",
    title: "Color Distances",
    expandsTo: ["colorDistance"],
  },
  { id: "gradients", title: "Gradients", expandsTo: ["gradients"] },
  { id: "sharpness", title: "Sharpness", expandsTo: ["sharpness"] },
  { id: "viewingAngle", title: "Viewing Angle", expandsTo: ["viewingAngle"] },
  { id: "gamma", title: "Gamma", expandsTo: ["gamma"] },
  { id: "response", title: "Response Time", expandsTo: ["response"] },
];

const allTestIds = overviewTests.flatMap((test) => test.expandsTo);

const tests: Record<
  TestId,
  {
    title: string;
    shortTitle: string;
    body: string;
  }
> = {
  pattern: {
    title: "Test Pattern",
    shortTitle: "Test Pattern",
    body:
      "Use the test pattern to check image geometry, scaling, line clarity, gradients, and color separation. Circles should be round, grid lines should be even, and fine frequency bars should remain sharply defined.",
  },
  pixelBlack: {
    title: "Defective Pixels on Black",
    shortTitle: "Pixels on Black",
    body:
      "All pixels should be black. Any colored or bright point can indicate a stuck subpixel that remains illuminated.",
  },
  pixelWhite: {
    title: "Defective Pixels on White",
    shortTitle: "Pixels on White",
    body:
      "All pixels should be white. Any dark point can indicate a missing or inactive pixel.",
  },
  pixelRed: {
    title: "Defective Pixels on Red",
    shortTitle: "Pixels on Red",
    body:
      "The entire screen should be pure red. Look closely for black, white, blue, or green dots.",
  },
  pixelGreen: {
    title: "Defective Pixels on Green",
    shortTitle: "Pixels on Green",
    body:
      "The entire screen should be pure green. Any point that does not match the field may indicate a defective subpixel.",
  },
  pixelBlue: {
    title: "Defective Pixels on Blue",
    shortTitle: "Pixels on Blue",
    body:
      "The entire screen should be pure blue. Scan the edges and corners as well as the center.",
  },
  uniformity: {
    title: "Uniformity",
    shortTitle: "Uniformity",
    body:
      "Assess image uniformity at different gray levels. Brightness should be evenly distributed across the full screen without visible tinting or cloudy patches.",
  },
  colorDistance: {
    title: "Color Distances",
    shortTitle: "Color Distances",
    body:
      "Compare two close color patches. The more similar the two colors can be while still remaining distinguishable, the better your display separates nearby tones.",
  },
  gradients: {
    title: "Gradients",
    shortTitle: "Gradients",
    body:
      "Check whether smooth gradients remain even. At high step counts there should be no sudden jumps or banding; at low step counts each band should be easy to distinguish.",
  },
  sharpness: {
    title: "Sharpness",
    shortTitle: "Sharpness",
    body:
      "Use repeated text to check whether your monitor reproduces fine details sharply and without halos, shadows, or unusual color fringes.",
  },
  viewingAngle: {
    title: "Viewing Angle",
    shortTitle: "Viewing Angle",
    body:
      "Move your head to different positions and check whether the circles keep their shape and brightness. Smaller changes are better.",
  },
  gamma: {
    title: "Gamma",
    shortTitle: "Gamma",
    body:
      "Adjust the level until the BenQ mark blends into the striped background as much as possible. The value shown is an approximate visual gamma reference.",
  },
  response: {
    title: "Response Time",
    shortTitle: "Response Time",
    body:
      "Compare moving rectangles against the background. Increase speed until streaks become visible, then adjust the distance to judge motion clarity and pixel transition behavior.",
  },
};

const guideSlides = [
  {
    eyebrow: "Navigation",
    title: "Move Through the Test",
    body:
      "Use your mouse, keyboard arrows, or the left-edge menu to navigate between test screens.",
    icon: "nav",
  },
  {
    eyebrow: "Controls",
    title: "Show and Hide Information",
    body:
      "Press the space key to hide or reveal all operating controls when you need an unobstructed image.",
    icon: "panel",
  },
  {
    eyebrow: "Finish",
    title: "End the Test",
    body:
      "Use the exit button at the top right or press Escape to end the test ahead of time.",
    icon: "exit",
  },
  {
    eyebrow: "Color Note",
    title: "Browser Color Management",
    body:
      "Web color can vary slightly between browsers and operating systems. For critical checks, compare results in more than one browser.",
    icon: "alert",
  },
];

const colorChoices = [
  { name: "Black", value: "#000000", rgb: { r: 0, g: 0, b: 0 } },
  { name: "White", value: "#ffffff", rgb: { r: 255, g: 255, b: 255 } },
  { name: "Red", value: "#ff0000", rgb: { r: 255, g: 0, b: 0 } },
  { name: "Green", value: "#00ff00", rgb: { r: 0, g: 255, b: 0 } },
  { name: "Blue", value: "#0000ff", rgb: { r: 0, g: 0, b: 255 } },
  { name: "Cyan", value: "#00ffff", rgb: { r: 0, g: 255, b: 255 } },
  { name: "Magenta", value: "#ff00ff", rgb: { r: 255, g: 0, b: 255 } },
  { name: "Yellow", value: "#ffff00", rgb: { r: 255, g: 255, b: 0 } },
  { name: "Gray (50%)", value: "#808080", rgb: { r: 128, g: 128, b: 128 } },
];

const sharpnessText =
  "Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua.";

function expandSelection(selected: Set<OverviewId>) {
  const expanded = overviewTests
    .filter((test) => selected.has(test.id))
    .flatMap((test) => test.expandsTo);

  return expanded.length ? expanded : allTestIds;
}

function rgbString(rgb: RGB) {
  return `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
}

function clampChannel(value: number) {
  if (Number.isNaN(value)) {
    return 0;
  }

  return Math.max(0, Math.min(255, value));
}

function getColorByName(name: string) {
  return colorChoices.find((color) => color.name === name) ?? colorChoices[0];
}

function buildSteppedGradient(colorName: string, steps: number) {
  const color = getColorByName(colorName).rgb;
  const safeSteps = Math.max(2, steps);
  const stops: string[] = [];

  for (let index = 0; index < safeSteps; index += 1) {
    const ratio = safeSteps === 1 ? 1 : index / (safeSteps - 1);
    const red = Math.round(color.r * ratio);
    const green = Math.round(color.g * ratio);
    const blue = Math.round(color.b * ratio);
    const start = (index / safeSteps) * 100;
    const end = ((index + 1) / safeSteps) * 100;
    stops.push(`rgb(${red}, ${green}, ${blue}) ${start}% ${end}%`);
  }

  return `linear-gradient(90deg, ${stops.join(", ")})`;
}

function BenqWordmark({ muted = false }: { muted?: boolean }) {
  return (
    <div className={muted ? "benq-wordmark muted" : "benq-wordmark"}>
      <span className="benq-mark">B</span>
      <span>BenQ</span>
    </div>
  );
}

export default function MonitorTestApp() {
  const [mode, setMode] = useState<Mode>("overview");
  const [selected, setSelected] = useState(
    () => new Set<OverviewId>(overviewTests.map((test) => test.id)),
  );
  const [runIds, setRunIds] = useState<TestId[]>(allTestIds);
  const [guideIndex, setGuideIndex] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [uiVisible, setUiVisible] = useState(true);
  const [infoCollapsed, setInfoCollapsed] = useState(false);
  const [uniformity, setUniformity] = useState(75);
  const [distanceBackground, setDistanceBackground] = useState<RGB>({
    r: 128,
    g: 128,
    b: 128,
  });
  const [distancePatch, setDistancePatch] = useState<RGB>({
    r: 134,
    g: 134,
    b: 134,
  });
  const [gradientColor, setGradientColor] = useState("Green");
  const [gradientSteps, setGradientSteps] = useState(256);
  const [sharpnessColor, setSharpnessColor] = useState<"dark" | "light">(
    "dark",
  );
  const [fontSize, setFontSize] = useState(18);
  const [gamma, setGamma] = useState(1.5);
  const [responseSettings, setResponseSettings] = useState({
    background: "Gray (50%)",
    left: "Blue",
    right: "White",
    speed: 480,
    distance: 75,
    paused: false,
  });
  const [viewportWidth, setViewportWidth] = useState(1920);

  const activeTest = runIds[currentIndex] ?? allTestIds[0];
  const activeNumber = currentIndex + 1;
  const totalTests = runIds.length;

  useEffect(() => {
    const updateWidth = () => setViewportWidth(window.innerWidth);
    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (mode === "overview") {
        return;
      }

      if (event.key === "Escape") {
        event.preventDefault();
        exitTest();
      }

      if (event.key === " ") {
        event.preventDefault();
        setUiVisible((visible) => !visible);
      }

      if (event.key === "ArrowRight" || event.key === "ArrowDown") {
        event.preventDefault();
        mode === "guide" ? nextGuideSlide() : goToTest(currentIndex + 1);
      }

      if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
        event.preventDefault();
        mode === "guide" ? previousGuideSlide() : goToTest(currentIndex - 1);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [currentIndex, guideIndex, mode, runIds]);

  const gradientBackground = useMemo(
    () => buildSteppedGradient(gradientColor, gradientSteps),
    [gradientColor, gradientSteps],
  );

  const responseDuration = useMemo(() => {
    const travel = viewportWidth + responseSettings.distance + 260;
    return Math.max(0.35, travel / responseSettings.speed);
  }, [responseSettings.distance, responseSettings.speed, viewportWidth]);

  const startWithGuide = () => {
    const expanded = expandSelection(selected);
    setRunIds(expanded);
    setCurrentIndex(0);
    setGuideIndex(0);
    setInfoCollapsed(false);
    setUiVisible(true);
    setMode("guide");
    enterFullscreen();
  };

  const startSingle = (id: OverviewId) => {
    const group = overviewTests.find((test) => test.id === id);
    const expanded = group?.expandsTo ?? allTestIds;
    setRunIds(expanded);
    setCurrentIndex(0);
    setGuideIndex(0);
    setInfoCollapsed(false);
    setUiVisible(true);
    setMode("guide");
    enterFullscreen();
  };

  const showGuide = () => {
    setRunIds(expandSelection(selected));
    setGuideIndex(0);
    setMode("guide");
  };

  const jumpToTests = () => {
    setCurrentIndex(0);
    setInfoCollapsed(false);
    setMode("test");
    enterFullscreen();
  };

  function enterFullscreen() {
    document.documentElement.requestFullscreen?.().catch(() => undefined);
  }

  function exitTest() {
    if (document.fullscreenElement) {
      document.exitFullscreen?.().catch(() => undefined);
    }

    setMode("overview");
    setUiVisible(true);
  }

  function nextGuideSlide() {
    setGuideIndex((index) => Math.min(guideSlides.length - 1, index + 1));
  }

  function previousGuideSlide() {
    setGuideIndex((index) => Math.max(0, index - 1));
  }

  function goToTest(index: number) {
    setCurrentIndex(Math.max(0, Math.min(totalTests - 1, index)));
  }

  const toggleSelected = (id: OverviewId) => {
    setSelected((previous) => {
      const next = new Set(previous);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }

      return next;
    });
  };

  const selectNoneOrAll = () => {
    setSelected((previous) =>
      previous.size
        ? new Set<OverviewId>()
        : new Set<OverviewId>(overviewTests.map((test) => test.id)),
    );
  };

  return (
    <main className={`monitor-app mode-${mode} ${uiVisible ? "" : "clean"}`}>
      {mode === "overview" ? (
        <OverviewScreen
          selected={selected}
          onToggle={toggleSelected}
          onStart={startWithGuide}
          onGuide={showGuide}
          onStartSingle={startSingle}
          onSelectNoneOrAll={selectNoneOrAll}
        />
      ) : null}

      {mode === "guide" ? (
        <GuideScreen
          guideIndex={guideIndex}
          onNext={nextGuideSlide}
          onPrevious={previousGuideSlide}
          onDot={setGuideIndex}
          onBack={() => setMode("overview")}
          onJump={jumpToTests}
        />
      ) : null}

      {mode === "test" ? (
        <section
          className={`test-runner test-${activeTest}`}
          aria-label={`${activeNumber}. ${tests[activeTest].title}`}
        >
          <TestStage
            id={activeTest}
            uniformity={uniformity}
            distanceBackground={distanceBackground}
            distancePatch={distancePatch}
            gradientBackground={gradientBackground}
            sharpnessColor={sharpnessColor}
            fontSize={fontSize}
            gamma={gamma}
            responseSettings={responseSettings}
            responseDuration={responseDuration}
          />

          <button
            className="icon-button exit-button chrome-control"
            type="button"
            onClick={exitTest}
            aria-label="Exit test"
            title="Exit test"
          >
            <span className="exit-icon" aria-hidden="true" />
          </button>

          <SideNavigation
            currentIndex={currentIndex}
            totalTests={totalTests}
            runIds={runIds}
            onGoTo={goToTest}
          />

          <InfoPanel
            activeTest={activeTest}
            activeNumber={activeNumber}
            collapsed={infoCollapsed}
            onCollapsedChange={setInfoCollapsed}
            uniformity={uniformity}
            setUniformity={setUniformity}
            distanceBackground={distanceBackground}
            setDistanceBackground={setDistanceBackground}
            distancePatch={distancePatch}
            setDistancePatch={setDistancePatch}
            gradientColor={gradientColor}
            setGradientColor={setGradientColor}
            gradientSteps={gradientSteps}
            setGradientSteps={setGradientSteps}
            sharpnessColor={sharpnessColor}
            setSharpnessColor={setSharpnessColor}
            fontSize={fontSize}
            setFontSize={setFontSize}
            gamma={gamma}
            setGamma={setGamma}
            responseSettings={responseSettings}
            setResponseSettings={setResponseSettings}
          />
        </section>
      ) : null}
    </main>
  );
}

function OverviewScreen({
  selected,
  onToggle,
  onStart,
  onGuide,
  onStartSingle,
  onSelectNoneOrAll,
}: {
  selected: Set<OverviewId>;
  onToggle: (id: OverviewId) => void;
  onStart: () => void;
  onGuide: () => void;
  onStartSingle: (id: OverviewId) => void;
  onSelectNoneOrAll: () => void;
}) {
  return (
    <section className="overview-screen">
      <div className="overview-spectrum" aria-hidden="true" />
      <header className="overview-header">
        <p>Frontend display diagnostics</p>
        <h1>BenQ Monitor Test</h1>
      </header>

      <div className="overview-board">
        <div className="overview-board-header">
          <div>
            <p className="section-kicker">Choose tests</p>
            <h2>Select the checks you want to run</h2>
          </div>
          <button className="text-button" type="button" onClick={onSelectNoneOrAll}>
            {selected.size ? "Select none" : "Select all"}
          </button>
        </div>

        <div className="test-picker">
          {overviewTests.map((test) => (
            <div className="test-choice" key={test.id}>
              <button
                className="play-button"
                type="button"
                onClick={() => onStartSingle(test.id)}
                aria-label={`Start ${test.title}`}
                title={`Start ${test.title}`}
              >
                <span aria-hidden="true" />
              </button>
              <button
                className="choice-label"
                type="button"
                onClick={() => onToggle(test.id)}
              >
                {test.title}
              </button>
              <label className="check-toggle">
                <input
                  type="checkbox"
                  checked={selected.has(test.id)}
                  onChange={() => onToggle(test.id)}
                  aria-label={`Include ${test.title}`}
                />
                <span aria-hidden="true" />
              </label>
            </div>
          ))}
        </div>
      </div>

      <div className="overview-actions">
        <button className="secondary-action" type="button" onClick={onGuide}>
          View Setup Guide
        </button>
        <button
          className="primary-action"
          type="button"
          onClick={onStart}
          disabled={!selected.size}
        >
          Start Test
        </button>
      </div>
    </section>
  );
}

function GuideScreen({
  guideIndex,
  onNext,
  onPrevious,
  onDot,
  onBack,
  onJump,
}: {
  guideIndex: number;
  onNext: () => void;
  onPrevious: () => void;
  onDot: (index: number) => void;
  onBack: () => void;
  onJump: () => void;
}) {
  const slide = guideSlides[guideIndex];

  return (
    <section className="guide-screen">
      <button
        className="guide-arrow guide-arrow-left"
        type="button"
        onClick={onPrevious}
        disabled={guideIndex === 0}
        aria-label="Previous guide slide"
      />
      <button
        className="guide-arrow guide-arrow-right"
        type="button"
        onClick={onNext}
        disabled={guideIndex === guideSlides.length - 1}
        aria-label="Next guide slide"
      />

      <div className={`guide-icon guide-icon-${slide.icon}`} aria-hidden="true">
        <span />
        <span />
        <span />
      </div>

      <div className="guide-copy">
        <p>{slide.eyebrow}</p>
        <h2>{slide.title}</h2>
        <p>{slide.body}</p>
      </div>

      <div className="guide-dots" aria-label="Guide progress">
        {guideSlides.map((item, index) => (
          <button
            key={item.title}
            type="button"
            className={index === guideIndex ? "active" : ""}
            onClick={() => onDot(index)}
            aria-label={`Go to ${item.title}`}
          />
        ))}
      </div>

      <div className="guide-actions">
        <button className="secondary-action" type="button" onClick={onBack}>
          Back to Overview
        </button>
        <button className="primary-action" type="button" onClick={onJump}>
          Jump to the Test
        </button>
      </div>
    </section>
  );
}

function TestStage({
  id,
  uniformity,
  distanceBackground,
  distancePatch,
  gradientBackground,
  sharpnessColor,
  fontSize,
  gamma,
  responseSettings,
  responseDuration,
}: {
  id: TestId;
  uniformity: number;
  distanceBackground: RGB;
  distancePatch: RGB;
  gradientBackground: string;
  sharpnessColor: "dark" | "light";
  fontSize: number;
  gamma: number;
  responseSettings: {
    background: string;
    left: string;
    right: string;
    speed: number;
    distance: number;
    paused: boolean;
  };
  responseDuration: number;
}) {
  if (id === "pattern") {
    return <PatternStage />;
  }

  if (id.startsWith("pixel")) {
    const pixelColors: Record<string, string> = {
      pixelBlack: "#000000",
      pixelWhite: "#ffffff",
      pixelRed: "#ff0000",
      pixelGreen: "#00ff00",
      pixelBlue: "#0000ff",
    };

    return (
      <div
        className="test-stage solid-stage"
        style={{ background: pixelColors[id] }}
      />
    );
  }

  if (id === "uniformity") {
    const value = Math.round(255 * (uniformity / 100));
    return (
      <div
        className="test-stage solid-stage"
        style={{ background: `rgb(${value}, ${value}, ${value})` }}
      />
    );
  }

  if (id === "colorDistance") {
    return (
      <div
        className="test-stage color-distance-stage"
        style={{ background: rgbString(distanceBackground) }}
      >
        <div
          className="distance-swatch"
          style={{ background: rgbString(distancePatch) }}
        />
      </div>
    );
  }

  if (id === "gradients") {
    return (
      <div
        className="test-stage gradient-stage"
        style={{ background: gradientBackground }}
      />
    );
  }

  if (id === "sharpness") {
    const isDark = sharpnessColor === "dark";
    const textRows = Array.from({ length: 42 }, (_, index) => (
      <p key={index}>{sharpnessText}</p>
    ));

    return (
      <div
        className={isDark ? "test-stage sharpness-stage" : "test-stage sharpness-stage invert"}
        style={{ fontSize: `${fontSize}px` }}
      >
        {textRows}
      </div>
    );
  }

  if (id === "viewingAngle") {
    return (
      <div className="test-stage viewing-stage">
        <div className="view-orb orb-a" />
        <div className="view-orb orb-b" />
        <div className="view-orb orb-c" />
        <div className="view-orb orb-d" />
        <div className="view-orb orb-e" />
      </div>
    );
  }

  if (id === "gamma") {
    const logoTone = Math.round(88 + gamma * 36);
    return (
      <div className="test-stage gamma-stage">
        <div
          className="gamma-logo"
          style={{ color: `rgb(${logoTone}, ${logoTone}, ${logoTone})` }}
        >
          <BenqWordmark muted />
        </div>
      </div>
    );
  }

  const background = getColorByName(responseSettings.background).value;
  const left = getColorByName(responseSettings.left).value;
  const right = getColorByName(responseSettings.right).value;

  return (
    <div className="test-stage response-stage" style={{ background }}>
      <div
        className={responseSettings.paused ? "motion-pair paused" : "motion-pair"}
        style={
          {
            "--response-duration": `${responseDuration}s`,
            "--response-distance": `${responseSettings.distance}px`,
          } as CSSProperties
        }
      >
        <div className="motion-bar left" style={{ background: left }} />
        <div className="motion-bar right" style={{ background: right }} />
      </div>
    </div>
  );
}

function PatternStage() {
  return (
    <div className="test-stage pattern-stage">
      <div className="checker checker-top" />
      <div className="checker checker-right" />
      <div className="checker checker-bottom" />
      <div className="checker checker-left" />
      <div className="corner-target target-a" />
      <div className="corner-target target-b" />
      <div className="corner-target target-c" />
      <div className="corner-target target-d" />

      <div className="frequency-block freq-left">
        <span />
        <span />
      </div>
      <div className="frequency-block freq-right">
        <span />
        <span />
      </div>

      <div className="pattern-disc">
        <div className="top-arc" />
        <div className="rgb-bars">
          <span className="red">R</span>
          <span className="green">G</span>
          <span className="blue">B</span>
        </div>
        <div className="gray-rule" />
        <div className="pattern-center">
          <div className="center-gradient">
            <span />
            <span />
            <span />
            <span />
          </div>
          <BenqWordmark />
        </div>
        <div className="gray-rule" />
        <div className="cmy-bars">
          <span className="cyan">C</span>
          <span className="magenta">M</span>
          <span className="yellow">Y</span>
        </div>
      </div>
    </div>
  );
}

function SideNavigation({
  currentIndex,
  totalTests,
  runIds,
  onGoTo,
}: {
  currentIndex: number;
  totalTests: number;
  runIds: TestId[];
  onGoTo: (index: number) => void;
}) {
  return (
    <aside className="side-nav chrome-control" aria-label="Test navigation">
      <div className="stepper">
        <button
          type="button"
          onClick={() => onGoTo(currentIndex - 1)}
          disabled={currentIndex === 0}
          aria-label="Previous test"
        />
        <strong>{currentIndex + 1}</strong>
        <span />
        <small>{totalTests}</small>
        <button
          type="button"
          onClick={() => onGoTo(currentIndex + 1)}
          disabled={currentIndex === totalTests - 1}
          aria-label="Next test"
        />
      </div>

      <nav className="test-menu">
        {runIds.map((id, index) => (
          <button
            type="button"
            key={`${id}-${index}`}
            className={index === currentIndex ? "active" : ""}
            onClick={() => onGoTo(index)}
          >
            <span>{index + 1}.</span> {tests[id].title}
          </button>
        ))}
      </nav>
    </aside>
  );
}

function InfoPanel({
  activeTest,
  activeNumber,
  collapsed,
  onCollapsedChange,
  uniformity,
  setUniformity,
  distanceBackground,
  setDistanceBackground,
  distancePatch,
  setDistancePatch,
  gradientColor,
  setGradientColor,
  gradientSteps,
  setGradientSteps,
  sharpnessColor,
  setSharpnessColor,
  fontSize,
  setFontSize,
  gamma,
  setGamma,
  responseSettings,
  setResponseSettings,
}: {
  activeTest: TestId;
  activeNumber: number;
  collapsed: boolean;
  onCollapsedChange: (collapsed: boolean) => void;
  uniformity: number;
  setUniformity: (value: number) => void;
  distanceBackground: RGB;
  setDistanceBackground: (value: RGB) => void;
  distancePatch: RGB;
  setDistancePatch: (value: RGB) => void;
  gradientColor: string;
  setGradientColor: (value: string) => void;
  gradientSteps: number;
  setGradientSteps: (value: number) => void;
  sharpnessColor: "dark" | "light";
  setSharpnessColor: (value: "dark" | "light") => void;
  fontSize: number;
  setFontSize: (value: number) => void;
  gamma: number;
  setGamma: (value: number) => void;
  responseSettings: {
    background: string;
    left: string;
    right: string;
    speed: number;
    distance: number;
    paused: boolean;
  };
  setResponseSettings: (value: {
    background: string;
    left: string;
    right: string;
    speed: number;
    distance: number;
    paused: boolean;
  }) => void;
}) {
  return (
    <section
      className={collapsed ? "info-panel collapsed chrome-control" : "info-panel chrome-control"}
      aria-label={`${tests[activeTest].title} information`}
    >
      <header>
        <h2>
          {activeNumber}. {tests[activeTest].title}
        </h2>
        <button
          className="collapse-button"
          type="button"
          onClick={() => onCollapsedChange(!collapsed)}
          aria-label={collapsed ? "Show information" : "Hide information"}
          title={collapsed ? "Show information" : "Hide information"}
        >
          <span aria-hidden="true" />
        </button>
      </header>

      {!collapsed ? (
        <div className="info-body">
          <p>{tests[activeTest].body}</p>
          <ControlSet
            activeTest={activeTest}
            uniformity={uniformity}
            setUniformity={setUniformity}
            distanceBackground={distanceBackground}
            setDistanceBackground={setDistanceBackground}
            distancePatch={distancePatch}
            setDistancePatch={setDistancePatch}
            gradientColor={gradientColor}
            setGradientColor={setGradientColor}
            gradientSteps={gradientSteps}
            setGradientSteps={setGradientSteps}
            sharpnessColor={sharpnessColor}
            setSharpnessColor={setSharpnessColor}
            fontSize={fontSize}
            setFontSize={setFontSize}
            gamma={gamma}
            setGamma={setGamma}
            responseSettings={responseSettings}
            setResponseSettings={setResponseSettings}
          />
        </div>
      ) : null}
    </section>
  );
}

function ControlSet({
  activeTest,
  uniformity,
  setUniformity,
  distanceBackground,
  setDistanceBackground,
  distancePatch,
  setDistancePatch,
  gradientColor,
  setGradientColor,
  gradientSteps,
  setGradientSteps,
  sharpnessColor,
  setSharpnessColor,
  fontSize,
  setFontSize,
  gamma,
  setGamma,
  responseSettings,
  setResponseSettings,
}: {
  activeTest: TestId;
  uniformity: number;
  setUniformity: (value: number) => void;
  distanceBackground: RGB;
  setDistanceBackground: (value: RGB) => void;
  distancePatch: RGB;
  setDistancePatch: (value: RGB) => void;
  gradientColor: string;
  setGradientColor: (value: string) => void;
  gradientSteps: number;
  setGradientSteps: (value: number) => void;
  sharpnessColor: "dark" | "light";
  setSharpnessColor: (value: "dark" | "light") => void;
  fontSize: number;
  setFontSize: (value: number) => void;
  gamma: number;
  setGamma: (value: number) => void;
  responseSettings: {
    background: string;
    left: string;
    right: string;
    speed: number;
    distance: number;
    paused: boolean;
  };
  setResponseSettings: (value: {
    background: string;
    left: string;
    right: string;
    speed: number;
    distance: number;
    paused: boolean;
  }) => void;
}) {
  if (activeTest === "uniformity") {
    return (
      <fieldset className="radio-group">
        <legend>Gray Tone</legend>
        {[25, 50, 75].map((tone) => (
          <label key={tone}>
            <input
              type="radio"
              name="gray-tone"
              checked={uniformity === tone}
              onChange={() => setUniformity(tone)}
            />
            <span>{tone} %</span>
          </label>
        ))}
      </fieldset>
    );
  }

  if (activeTest === "colorDistance") {
    return (
      <div className="stacked-controls">
        <RgbControls
          title="Background"
          value={distanceBackground}
          onChange={setDistanceBackground}
        />
        <RgbControls
          title="Rectangle"
          value={distancePatch}
          onChange={setDistancePatch}
        />
        <button
          className="reset-button"
          type="button"
          onClick={() => {
            setDistanceBackground({ r: 128, g: 128, b: 128 });
            setDistancePatch({ r: 134, g: 134, b: 134 });
          }}
        >
          Reset settings
        </button>
      </div>
    );
  }

  if (activeTest === "gradients") {
    return (
      <div className="stacked-controls">
        <ColorSelect
          label="Color at the right edge of the image"
          value={gradientColor}
          onChange={setGradientColor}
          includeGray={false}
        />
        <RangeControl
          label="Steps"
          min={8}
          max={256}
          value={gradientSteps}
          onChange={setGradientSteps}
        />
      </div>
    );
  }

  if (activeTest === "sharpness") {
    return (
      <div className="stacked-controls">
        <fieldset className="radio-group">
          <legend>Color</legend>
          <label>
            <input
              type="radio"
              name="sharpness-color"
              checked={sharpnessColor === "dark"}
              onChange={() => setSharpnessColor("dark")}
            />
            <span>Black on white</span>
          </label>
          <label>
            <input
              type="radio"
              name="sharpness-color"
              checked={sharpnessColor === "light"}
              onChange={() => setSharpnessColor("light")}
            />
            <span>White on black</span>
          </label>
        </fieldset>
        <RangeControl
          label="Font size (point)"
          min={10}
          max={18}
          value={fontSize}
          onChange={setFontSize}
        />
        <button
          className="reset-button"
          type="button"
          onClick={() => {
            setSharpnessColor("dark");
            setFontSize(18);
          }}
        >
          Reset settings
        </button>
      </div>
    );
  }

  if (activeTest === "gamma") {
    return (
      <RangeControl
        label="Levels"
        min={1}
        max={3}
        step={0.1}
        value={gamma}
        displayValue={gamma.toFixed(1)}
        onChange={setGamma}
      />
    );
  }

  if (activeTest === "response") {
    return (
      <div className="response-controls">
        <div className="response-selects">
          <ColorSelect
            label="Background"
            value={responseSettings.background}
            onChange={(background) =>
              setResponseSettings({ ...responseSettings, background })
            }
            includeGray
          />
          <ColorSelect
            label="Left rectangle"
            value={responseSettings.left}
            onChange={(left) => setResponseSettings({ ...responseSettings, left })}
            includeGray={false}
          />
          <ColorSelect
            label="Right rectangle"
            value={responseSettings.right}
            onChange={(right) =>
              setResponseSettings({ ...responseSettings, right })
            }
            includeGray
          />
        </div>
        <div className="response-sliders">
          <RangeControl
            label="Speed (pixels per second)"
            min={480}
            max={3840}
            value={responseSettings.speed}
            onChange={(speed) =>
              setResponseSettings({ ...responseSettings, speed })
            }
          />
          <RangeControl
            label="Distance (pixels)"
            min={0}
            max={150}
            value={responseSettings.distance}
            onChange={(distance) =>
              setResponseSettings({ ...responseSettings, distance })
            }
          />
          <button
            className="pause-button"
            type="button"
            onClick={() =>
              setResponseSettings({
                ...responseSettings,
                paused: !responseSettings.paused,
              })
            }
          >
            <span aria-hidden="true" />
            {responseSettings.paused ? "Resume" : "Pause"}
          </button>
          <button
            className="reset-button"
            type="button"
            onClick={() =>
              setResponseSettings({
                background: "Gray (50%)",
                left: "Blue",
                right: "White",
                speed: 480,
                distance: 75,
                paused: false,
              })
            }
          >
            Reset settings
          </button>
        </div>
      </div>
    );
  }

  return null;
}

function ColorSelect({
  label,
  value,
  onChange,
  includeGray,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  includeGray: boolean;
}) {
  const options = colorChoices.filter((color) =>
    includeGray ? true : color.name !== "Gray (50%)",
  );

  return (
    <label className="color-select">
      <span>{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((color) => (
          <option key={color.name} value={color.name}>
            {color.name}
          </option>
        ))}
      </select>
    </label>
  );
}

function RgbControls({
  title,
  value,
  onChange,
}: {
  title: string;
  value: RGB;
  onChange: (value: RGB) => void;
}) {
  const update = (channel: keyof RGB, next: number) => {
    onChange({ ...value, [channel]: clampChannel(next) });
  };

  return (
    <div className="rgb-controls">
      <h3>{title}</h3>
      {(["r", "g", "b"] as Array<keyof RGB>).map((channel) => (
        <label key={channel} className={`rgb-row rgb-${channel}`}>
          <span>{channel.toUpperCase()}:</span>
          <input
            className="rgb-number"
            type="number"
            min={0}
            max={255}
            value={value[channel]}
            onChange={(event) => update(channel, Number(event.target.value))}
          />
          <input
            className="range-input"
            type="range"
            min={0}
            max={255}
            value={value[channel]}
            onChange={(event) => update(channel, Number(event.target.value))}
          />
        </label>
      ))}
    </div>
  );
}

function RangeControl({
  label,
  min,
  max,
  step = 1,
  value,
  displayValue,
  onChange,
}: {
  label: string;
  min: number;
  max: number;
  step?: number;
  value: number;
  displayValue?: string;
  onChange: (value: number) => void;
}) {
  return (
    <label className="range-control">
      <span>{label}</span>
      <div className="range-line">
        <small>{min.toLocaleString()}</small>
        <input
          className="range-input"
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(event) => onChange(Number(event.target.value))}
        />
        <small>{max.toLocaleString()}</small>
      </div>
      <output>{displayValue ?? value.toLocaleString()}</output>
    </label>
  );
}
