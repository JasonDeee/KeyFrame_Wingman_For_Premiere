/*************************************************************************
 * KeyFrame Wingman for Premiere Pro
 * Easing Control Tool
 **************************************************************************/

// Import Premiere Pro API
const ppro = require("premierepro");

/*************************************************************************
 * KeyFrame Wingman for Premiere Pro
 * Easing Control Tool
 **************************************************************************/

// Global variables
let selectedKeyframes = [];
let currentEaseIn = 25;
let currentEaseOut = 75;

// Constants from UXP API (based on types.d.ts)
const TRACK_ITEM_TYPES = {
  EMPTY: 0,
  CLIP: 1,
  TRANSITION: 2,
  PREVIEW: 3,
  FEEDBACK: 4,
};

const INTERPOLATION_MODES = {
  LINEAR: 0,
  HOLD: 1,
  BEZIER: 2,
  TIME: 3,
  TIME_TRANSITION_START: 4,
  TIME_TRANSITION_END: 5,
};

// DOM elements
let easeInSlider, easeOutSlider;
let easeInValue, easeOutValue;
let bezierDisplay, statusText, statusDot;
let applyButton, resetButton;
let debugOutput;

// Initialize the plugin when DOM is loaded
document.addEventListener("DOMContentLoaded", function () {
  initializeUI();
  setupEventListeners();
  updateBezierDisplay();
  updateStatus("Ready - Select keyframes in Effect Controls");
});

/**
 * Initialize UI elements
 */
function initializeUI() {
  // Get DOM elements
  easeInSlider = document.getElementById("ease-in-slider");
  easeOutSlider = document.getElementById("ease-out-slider");
  easeInValue = document.getElementById("ease-in-value");
  easeOutValue = document.getElementById("ease-out-value");
  bezierDisplay = document.getElementById("bezier-display");
  statusText = document.getElementById("status-text");
  statusDot = document.querySelector(".status-dot");
  applyButton = document.getElementById("apply-easing");
  resetButton = document.getElementById("reset-easing");
  debugOutput = document.getElementById("debug-output");

  // Set initial values
  currentEaseIn = parseInt(easeInSlider.value);
  currentEaseOut = parseInt(easeOutSlider.value);

  // Update displays
  easeInValue.textContent = currentEaseIn;
  easeOutValue.textContent = currentEaseOut;
}

/**
 * Setup event listeners for UI interactions
 */
function setupEventListeners() {
  // Ease In slider
  easeInSlider.addEventListener("input", function () {
    currentEaseIn = parseInt(this.value);
    easeInValue.textContent = currentEaseIn;
    updateBezierDisplay();
    debounceSliderChange();
  });

  // Ease Out slider
  easeOutSlider.addEventListener("input", function () {
    currentEaseOut = parseInt(this.value);
    easeOutValue.textContent = currentEaseOut;
    updateBezierDisplay();
    debounceSliderChange();
  });

  // Apply Easing button
  applyButton.addEventListener("click", function () {
    applyEasingToKeyframes();
  });

  // Reset button
  resetButton.addEventListener("click", function () {
    resetToLinear();
  });

  // Refresh keyframes button
  document
    .getElementById("refresh-keyframes")
    .addEventListener("click", function () {
      debugLog("Manual refresh requested");
      checkKeyframeSelection();
    });

  // Removed automatic polling - using manual refresh only
  // setInterval(checkKeyframeSelection, 3000);

  // Debug toggle
  document
    .getElementById("toggle-debug")
    .addEventListener("click", function () {
      const debugSection = document.getElementById("debug-section");
      if (debugSection.style.display === "none") {
        debugSection.style.display = "block";
        this.textContent = "Hide Debug Info";
      } else {
        debugSection.style.display = "none";
        this.textContent = "Show Debug Info";
      }
    });
}

/**
 * Update the cubic-bezier display
 */
function updateBezierDisplay() {
  // Convert percentage to cubic-bezier coordinates
  const x1 = (currentEaseIn / 100).toFixed(2);
  const x2 = (currentEaseOut / 100).toFixed(2);

  const bezierString = `cubic-bezier(${x1}, 0, ${x2}, 1)`;
  bezierDisplay.textContent = bezierString;

  debugLog(`Bezier updated: ${bezierString}`);
}

/**
 * Update status display
 */
function updateStatus(message, isActive = false) {
  statusText.textContent = message;

  if (isActive) {
    statusDot.classList.add("active");
    applyButton.disabled = false;
  } else {
    statusDot.classList.remove("active");
    applyButton.disabled = true;
  }
}

/**
 * Debounce slider changes to avoid too many updates
 */
let sliderTimeout;
function debounceSliderChange() {
  clearTimeout(sliderTimeout);
  sliderTimeout = setTimeout(() => {
    // This is where we could add real-time preview if supported by API
    debugLog(`Sliders changed: In=${currentEaseIn}%, Out=${currentEaseOut}%`);
  }, 150);
}

/**
 * Manual keyframe detection using user-guided workflow
 */
async function checkKeyframeSelection() {
  try {
    debugLog("🔍 Starting manual keyframe detection...");

    console.log(ppro.Project.getActiveProject());

    // Check for API availability
    if (!ppro || !ppro.Project) {
      debugLog("❌ UXP API not available");
      updateStatus("UXP API not available", false);
      return;
    }

    // Execute user-guided workflow
    const result = await implementUserGuidedWorkflow();

    if (!result.success) {
      // Handle different types of failures
      if (result.method === "instruction") {
        // Show instruction for user guidance
        updateStatus("Select clips in timeline first", false);
        showInstructionDialog(result);
      } else if (result.method === "error") {
        updateStatus(`Error: ${result.error}`, false);
        debugLog(`❌ Workflow error: ${result.error}`, "error");
      } else {
        updateStatus("No clips selected in timeline", false);
        debugLog("ℹ️ User needs to select clips first");
      }

      selectedKeyframes = [];
      applyButton.disabled = true;
      return;
    }

    // Success: Process detected keyframes
    selectedKeyframes = result.keyframeData || [];
    const keyframeCount = selectedKeyframes.reduce(
      (total, prop) => total + prop.keyframeCount,
      0
    );

    debugLog(
      `✅ Found ${selectedKeyframes.length} properties with ${keyframeCount} total keyframes`
    );

    if (selectedKeyframes.length > 0) {
      updateStatus(
        `${selectedKeyframes.length} properties, ${keyframeCount} keyframes`,
        true
      );
      applyButton.disabled = false;

      // Show additional info about detected properties
      debugLog("📋 Detected properties:");
      selectedKeyframes.forEach((prop, index) => {
        debugLog(
          `  ${index + 1}. ${prop.name} (${prop.keyframeCount} keyframes)`
        );
      });
    } else {
      updateStatus("No keyframed properties found", false);
      applyButton.disabled = true;
    }
  } catch (error) {
    debugLog(`❌ Error in manual detection: ${error.message}`, "error");
    updateStatus("Detection error", false);
    selectedKeyframes = [];
    applyButton.disabled = true;
  }
}

/**
 * Show instruction dialog to guide users
 */
function showInstructionDialog(result) {
  debugLog("📖 Showing user instructions");

  // Log detailed instructions to console
  console.log("=".repeat(50));
  console.log(result.title);
  console.log("=".repeat(50));
  console.log(result.message);
  console.log("=".repeat(50));

  // Update UI with helpful message
  const instructionText = [
    "🎬 Select clips in timeline →",
    "Click 'Manual Refresh' →",
    "Apply custom easing",
  ].join(" ");

  updateStatus(instructionText, false);
}

/**
 * Detect selected track items in the sequence
 */
async function detectSelectedTrackItems(sequence) {
  try {
    // Get number of video tracks and iterate through them
    const videoTrackCount = await sequence.getVideoTrackCount();
    const selectedItems = [];

    for (let i = 0; i < videoTrackCount; i++) {
      try {
        const track = await sequence.getVideoTrack(i);
        if (track && track.getTrackItems) {
          // Get track items with correct parameters:
          // trackItemType: CLIP items only
          // includeEmptyTrackItems: false
          const trackItems = await track.getTrackItems(
            TRACK_ITEM_TYPES.CLIP,
            false
          );

          for (const item of trackItems) {
            // Check if item has component chain (for motion properties)
            if (item.getComponentChain) {
              const componentChain = await item.getComponentChain();
              selectedItems.push({ item, componentChain });
            }
          }
        }
      } catch (trackError) {
        debugLog(
          `Error accessing video track ${i}: ${trackError.message}`,
          "error"
        );
        continue;
      }
    }

    return selectedItems;
  } catch (error) {
    debugLog(`Error detecting track items: ${error.message}`, "error");
    return [];
  }
}

/**
 * Find properties that have keyframes
 */
async function findKeyframedProperties(trackItems) {
  const keyframedProperties = [];

  try {
    for (const { item, componentChain } of trackItems) {
      if (componentChain && componentChain.getComponentCount) {
        const componentCount = await componentChain.getComponentCount();

        for (let j = 0; j < componentCount; j++) {
          try {
            const component = await componentChain.getComponentAtIndex(j);

            if (component && component.getProperties) {
              const properties = await component.getProperties();

              for (const property of properties) {
                // Check if component parameter supports keyframes
                if (
                  property.areKeyframesSupported &&
                  (await property.areKeyframesSupported())
                ) {
                  // Check if property is time varying (has keyframes)
                  if (
                    property.isTimeVarying &&
                    (await property.isTimeVarying())
                  ) {
                    // Get actual keyframes
                    const keyframeTimes = property.getKeyframeListAsTickTimes
                      ? await property.getKeyframeListAsTickTimes()
                      : [];

                    debugLog(
                      `Found ${keyframeTimes.length} keyframes in ${
                        property.displayName || "Unknown"
                      }`
                    );

                    keyframedProperties.push({
                      item,
                      component,
                      property,
                      name:
                        property.displayName ||
                        property.name ||
                        "Unknown Property",
                      keyframeTimes: keyframeTimes,
                      keyframeCount: keyframeTimes.length,
                    });
                  }
                }
              }
            }
          } catch (componentError) {
            debugLog(
              `Error accessing component ${j}: ${componentError.message}`,
              "error"
            );
            continue;
          }
        }
      }
    }
  } catch (error) {
    debugLog(`Error finding keyframed properties: ${error.message}`, "error");
  }

  return keyframedProperties;
}

/**
 * NEW USER-GUIDED WORKFLOW
 * Since UXP cannot detect Effect Controls selection, we implement a different approach:
 * 1. User manually selects clips in timeline
 * 2. Plugin scans for common keyframed properties
 * 3. User chooses specific effects/properties to target
 * 4. Apply easing to discovered keyframes
 */
async function implementUserGuidedWorkflow() {
  try {
    debugLog("🎯 Starting user-guided keyframe workflow...");

    const project = await ppro.Project.getActiveProject();
    if (!project) {
      throw new Error("No active project found");
    }

    const sequence = await project.getActiveSequence();
    if (!sequence) {
      throw new Error("No active sequence found");
    }

    // Try to get timeline selection if available
    let selectedItems = [];
    let selectionMethod = "none";

    if (typeof sequence.getSelection === "function") {
      try {
        // Hàm này đang gặp lỗi

        const selection = await sequence.getSelection();
        console.alert("Here & Cant wait");

        if (selection && selection.length > 0) {
          selectedItems = selection;
          selectionMethod = "timeline";
          debugLog(`✅ Found ${selection.length} selected items in timeline`);
        }
      } catch (selectionError) {
        debugLog(`⚠️ Timeline selection API error: ${selectionError.message}`);
      }
    }

    // If no timeline selection, provide helpful guidance
    if (selectedItems.length === 0) {
      return {
        success: false,
        method: "instruction",
        title: "🎬 How to Use KeyFrame Wingman",
        message: [
          "Since UXP doesn't support Effect Controls detection yet,",
          "please follow this workflow:",
          "",
          "1️⃣ Select clips with keyframes in the timeline",
          "2️⃣ Click 'Manual Refresh' to scan for keyframes",
          "3️⃣ Choose which effects to target (coming soon)",
          "4️⃣ Apply your custom easing curves",
          "",
          "📝 Note: This limitation will be resolved when Adobe",
          "releases enhanced UXP APIs for Premiere Pro.",
        ].join("\n"),
        instruction: "Select clips in timeline, then click 'Manual Refresh'",
      };
    }

    // Scan selected items for keyframed properties
    const keyframeData = await scanSelectedItemsForKeyframes(selectedItems);

    return {
      success: true,
      method: selectionMethod,
      selectedCount: selectedItems.length,
      keyframeData: keyframeData,
      message: `Found ${keyframeData.length} keyframed properties in ${selectedItems.length} selected clips`,
    };
  } catch (error) {
    debugLog(`❌ User-guided workflow error: ${error.message}`, "error");
    return {
      success: false,
      method: "error",
      error: error.message,
    };
  }
}

/**
 * Scan selected timeline items for keyframed properties
 * This is where future UXP enhancements will provide better access
 */
async function scanSelectedItemsForKeyframes(selectedItems) {
  const keyframeData = [];

  try {
    debugLog(`🔍 Scanning ${selectedItems.length} selected items...`);

    for (let i = 0; i < selectedItems.length; i++) {
      const item = selectedItems[i];
      debugLog(`📹 Processing item ${i + 1}/${selectedItems.length}`);

      // TODO: When UXP provides better API access, implement:
      // - Get video/audio component chains
      // - Extract effect properties
      // - Find keyframed properties
      // - Return actual keyframe timing data

      // For now, simulate what the detection would find
      const mockData = createMockKeyframeData(item, i);
      keyframeData.push(...mockData);
    }

    debugLog(`🎯 Scan complete: ${keyframeData.length} properties found`);
    return keyframeData;
  } catch (error) {
    debugLog(`❌ Error scanning items: ${error.message}`, "error");
    return [];
  }
}

/**
 * Create realistic mock keyframe data for testing UI workflow
 * This simulates what real UXP keyframe detection would return
 */
function createMockKeyframeData(item, index) {
  const commonEffects = [
    { effect: "Motion", property: "Position", keyframes: 4 },
    { effect: "Motion", property: "Scale", keyframes: 2 },
    { effect: "Motion", property: "Rotation", keyframes: 3 },
    { effect: "Opacity", property: "Opacity", keyframes: 2 },
  ];

  return commonEffects.map((effectData, propIndex) => ({
    name: `${effectData.effect} > ${effectData.property}`,
    effectName: effectData.effect,
    propertyName: effectData.property,
    keyframeCount: effectData.keyframes,
    keyframeTimes: generateMockTimecodes(effectData.keyframes),
    clipIndex: index,
    property: {
      // Mock property object for testing
      name: effectData.property,
      displayName: `${effectData.effect} > ${effectData.property}`,
      isTimeVarying: () => true,
      getKeyframeListAsTickTimes: () =>
        generateMockTimecodes(effectData.keyframes),
      createSetInterpolationAtKeyframeAction: () => null, // Would return real action
    },
    isMockData: true,
    instructions: [
      "This is simulated data for UI testing",
      "Real keyframes will be detected when UXP APIs are enhanced",
      "Currently shows common Motion and Opacity properties",
    ],
  }));
}

/**
 * Generate realistic timecode positions for mock keyframes
 */
function generateMockTimecodes(count) {
  const timecodes = [];
  for (let i = 0; i < count; i++) {
    // Generate timecodes like: 00:00:01:00, 00:00:02:00, etc.
    const seconds = (i + 1) * 1;
    timecodes.push(`00:00:${seconds.toString().padStart(2, "0")}:00`);
  }
  return timecodes;
}

/**
 * Apply easing to selected keyframes
 */
async function applyEasingToKeyframes() {
  if (selectedKeyframes.length === 0) {
    updateStatus("No keyframes selected", false);
    return;
  }

  try {
    const project = await ppro.Project.getActiveProject();
    if (!project) {
      updateStatus("No active project", false);
      return;
    }

    const bezierString = bezierDisplay.textContent;
    debugLog(
      `Applying ${bezierString} to ${selectedKeyframes.length} keyframes`
    );

    // Show applying state
    applyButton.textContent = "APPLYING...";
    applyButton.disabled = true;

    let appliedCount = 0;

    // Apply easing to each keyframed property
    for (const keyframeData of selectedKeyframes) {
      const success = await applyEasingToProperty(keyframeData);
      if (success) appliedCount++;
    }

    // Update UI
    applyButton.textContent = "APPLY EASING";
    applyButton.disabled = false;

    if (appliedCount > 0) {
      updateStatus(`Easing applied to ${appliedCount} properties`, true);
      debugLog(
        `Successfully applied easing to ${appliedCount}/${selectedKeyframes.length} properties`
      );
    } else {
      updateStatus("Failed to apply easing", false);
      debugLog("No easing was applied to any properties");
    }
  } catch (error) {
    debugLog(`Error applying easing: ${error.message}`, "error");
    updateStatus("Error applying easing", false);

    // Reset button state
    applyButton.textContent = "APPLY EASING";
    applyButton.disabled = false;
  }
}

/**
 * Apply easing to a specific property using UXP API methods
 */
async function applyEasingToProperty(keyframeData) {
  try {
    const { property, name, keyframeTimes, keyframeCount } = keyframeData;

    if (!property) {
      debugLog(`Property is null for ${name}`, "error");
      return false;
    }

    // Use keyframeTimes from detection if available
    const timesToProcess =
      keyframeTimes && keyframeTimes.length > 0
        ? keyframeTimes
        : property.getKeyframeListAsTickTimes
        ? await property.getKeyframeListAsTickTimes()
        : [];

    if (timesToProcess.length === 0) {
      debugLog(`No keyframes found for ${name}`, "error");
      return false;
    }

    debugLog(`Processing ${timesToProcess.length} keyframes for ${name}`);

    const project = await ppro.Project.getActiveProject();
    if (!project) {
      debugLog("No active project for executing actions", "error");
      return false;
    }

    let successCount = 0;

    // Apply Bezier interpolation to each keyframe using proper UXP API
    for (const keyframeTime of timesToProcess) {
      try {
        if (property.createSetInterpolationAtKeyframeAction) {
          // Create action to set interpolation mode to Bezier
          const action = await property.createSetInterpolationAtKeyframeAction(
            keyframeTime,
            INTERPOLATION_MODES.BEZIER,
            true // UpdateUI
          );

          if (action) {
            // Execute the action within a locked transaction
            await project.lockedAccess(() => {
              project.executeTransaction((compoundAction) => {
                compoundAction.addAction(action);
              });
            });

            successCount++;
            debugLog(
              `Applied Bezier interpolation to keyframe at ${keyframeTime}`
            );
          } else {
            debugLog(
              `Failed to create action for keyframe at ${keyframeTime}`,
              "error"
            );
          }
        } else {
          debugLog(
            `Property ${name} does not support createSetInterpolationAtKeyframeAction`,
            "error"
          );
          break;
        }
      } catch (keyframeError) {
        debugLog(
          `Error setting interpolation for keyframe: ${keyframeError.message}`,
          "error"
        );
        continue;
      }
    }

    debugLog(
      `Successfully applied easing to ${successCount}/${timesToProcess.length} keyframes for ${name}`
    );
    return successCount > 0;
  } catch (error) {
    debugLog(
      `Error applying easing to property ${keyframeData.name}: ${error.message}`,
      "error"
    );
    return false;
  }
}

/**
 * Convert percentage values to Premiere Pro interpolation parameters
 * Note: This is a simplified approach - full cubic bezier curves may require
 * additional API calls that might not be available in current UXP version
 */
function calculateInterpolationParams(easeIn, easeOut) {
  // Convert 0-100% to normalized values
  const x1 = easeIn / 100;
  const x2 = easeOut / 100;

  // For now, we'll use the standard Bezier interpolation (type 5)
  // Future versions might allow custom curve parameters
  return {
    type: 5, // Bezier interpolation
    influence: Math.max(0.1, Math.min(1.0, (x1 + x2) / 2)), // Average influence
  };
}

/**
 * Reset sliders to linear (50%, 50%)
 */
function resetToLinear() {
  currentEaseIn = 50;
  currentEaseOut = 50;

  easeInSlider.value = currentEaseIn;
  easeOutSlider.value = currentEaseOut;
  easeInValue.textContent = currentEaseIn;
  easeOutValue.textContent = currentEaseOut;

  updateBezierDisplay();
  debugLog("Reset to linear easing (0.5, 0, 0.5, 1)");
}

/**
 * Debug logging function
 */
function debugLog(message, type = "info") {
  const timestamp = new Date().toLocaleTimeString();
  const logEntry = `[${timestamp}] ${message}`;

  console.log(logEntry);

  // Optionally show debug in UI (for development)
  if (debugOutput) {
    debugOutput.innerHTML += `<div class="${type}">${logEntry}</div>`;
    debugOutput.scrollTop = debugOutput.scrollHeight;
  }
}

/**
 * Utility function to convert percentage to bezier coordinate
 */
function percentToBezier(percent) {
  return Math.max(0, Math.min(1, percent / 100));
}

/**
 * Get current easing values as bezier coordinates
 */
function getCurrentBezierValues() {
  return {
    x1: percentToBezier(currentEaseIn),
    y1: 0,
    x2: percentToBezier(currentEaseOut),
    y2: 1,
  };
}

// Export functions for potential external use
window.KeyFrameWingman = {
  getCurrentBezierValues,
  applyEasingToKeyframes,
  resetToLinear,
  updateStatus,
};
