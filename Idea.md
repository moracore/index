# idea.md: Media Tracker Project Specification

## 1. Project Overview

A manual, sequential media tracker designed to log progress through tiered content (TV shows, book series, manga) using a proportional progress model. The system avoids external APIs, relying on user-defined structures to calculate completion.

## 2. Data Architecture

### 2.1 Media Hierarchy

The system supports three primary structures:

- **Atomic:** Single unit tracking (e.g., a Movie or a standalone Book).
- **Linear:** Two-tier tracking (e.g., Book Series $\rightarrow$ Chapters).
- **Nested:** Two-tier tracking with variable segment sizes (e.g., TV Show $\rightarrow$ Seasons $\rightarrow$ Episodes).

### 2.2 Segmented Logic

Each entry consists of a collection of **Segments**.

- **Segment:** A container (Season/Book/Volume) with a defined **Unit Count**.
- **Unit:** The smallest trackable increment (Episode/Chapter/Page).

---

## 3. Progress & Mathematical Model

### 3.1 The "Current Pointer"

Progress is tracked via a single global pointer: $(S_{index}, U_{index})$.

- $S_{index}$: The current segment (e.g., Season 3).
- $U_{index}$: The current unit within that segment (e.g., Episode 5).
- **Sequential Enforcement:** Moving the pointer forward automatically marks all units in all preceding segments as $100\%$ complete. Moving the pointer backward requires confirmation as it destructively reverts completion states.

### 3.2 Proportional Master Bar

The master progress bar is a composite of all segments, where the visual width of each segment is relative to its unit count.

- **Total Units ($T$):** $T = \sum_{j=1}^{n} c_j$ (where $c_j$ is the unit count of segment $j$).
- **Segment Weight ($W_i$):** $W_i = \frac{c_i}{T}$.
- **Total Progress ($P$):**
  $$P = \frac{(\sum_{j=1}^{i-1} c_j) + U_{current}}{T}$$
  _Where $i$ is the current segment index and $U_{current}$ is the current unit position._

---

## 4. UI/UX Specification

### 4.1 Dashboard Card

- **Visual Priority:** Each card displays the **Master Proportional Bar**.
- **Segment Dividers:** Thin vertical lines indicate the boundaries between seasons/books.
- **Multi-Bar View:** Beneath the master bar, individual progress bars for each segment are displayed (e.g., 5 seasons = 5 smaller bars).
- **Color States:**
  - **Completed Segment:** Solid green.
  - **Active Segment:** Partially filled green based on $U_{current}$.
  - **Future Segment:** Dark/Empty.
- **Quick Action:** A `+` increment button that advances the $U_{index}$. If $U_{index}$ reaches the segment maximum, it automatically rolls over to $(S_{i+1}, U_1)$ if a next segment exists.

### 4.2 Settings Modal (Structure Editor)

- **Manual Configuration:** Users manually add/remove segments and define their unit counts.
- **Dynamic Updating:** Changing an episode count in settings immediately triggers a re-render of the Master Bar's proportions and a recalculation of the total progress percentage.
- **Ongoing Toggle:** If "Ongoing," the system allows appending new segments indefinitely. The Master Bar simply "shrinks" existing progress to accommodate new additions.

---

## 5. Implementation Phases

### Phase 1: Core Schema & Pointer Logic

- Define the JSON structure for nested media.
- Implement the "Sequential Pointer" logic (Auto-completing previous segments).
- Set up basic CRUD for media entries.

### Phase 2: Proportional Rendering

- Develop the Master Bar component using CSS Flexbox/Grid where `flex-grow` or `width` is proportional to unit counts.
- Implement the "6-bar" layout (Master bar + individual segment bars).
- Add visual dividers for segments.

### Phase 3: Settings & Manual Entry

- Build the Structure Editor modal.
- Implement real-time math recalculation when segment counts or unit totals are modified.
- Create the "Add Segment" and "Unit Labeling" (Season vs Volume) functionality.

### Phase 4: Interaction & Polish

- Program the dashboard incrementer with rollover logic (S1:E10 -> S2:E1).
- Add confirmation prompts for destructive backward-pointer movements.
- Optimize the UI for quick-glance progress identification.
