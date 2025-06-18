# Simple Phonics phonic-app

![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg) ![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg) ![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB) ![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white) ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

An interactive, multi-language web application designed to make learning phonics fun and accessible for children everywhere.

---

### [🚀 View the Live Demo](https://phonics.sajjadhaq.com)

---

<!-- 
  IMPORTANT: Add a high-quality GIF or screenshot of the app in action here!
  A GIF showing the language switching, zooming, and confetti is highly recommended.
-->
<p align="center">
  <img src="https-link-to-your-screenshot-or-gif.gif" alt="Simple Phonics App Demo" width="800"/>
</p>

## ✨ Key Features

-   **🌍 Multi-Language Support:** Full support for English, **Arabic (RTL)**, Japanese, Korean, and Persian, with proper font rendering and layout direction.
-   **👆 Intuitive Touch Controls:** Custom-built gesture handling for tapping, swiping, and pinch-to-zoom on mobile devices.
-   **🔠 Progressive Learning:** A structured path from learning individual letters to mastering 4-letter words.
-   **🖼️ Visual Hints:** Image cues to help children associate words with real-world objects.
-   **🎉 Fun Feedback:** A celebratory confetti explosion for successful learning moments to keep kids engaged.
-   **📱 Fully Responsive Design:** A flawless and intuitive experience on both desktop and mobile devices.

## 🛠️ Tech Stack

-   **Frontend:** React, TypeScript
-   **Styling:** Tailwind CSS
-   **State Management:** React Hooks (useState, useEffect, useContext)
-   **Gesture Handling:** Custom Touch Event Listeners
-   **Fonts:** Google Fonts API for dynamic loading of international character sets
-   **Audio:** Web Audio API for interactive sound feedback

## 🧠 Technical Highlights & Challenges Solved

This project presented several unique front-end challenges. Here’s how I solved them:

#### 1. Architecting for Right-to-Left (RTL) Languages
-   **Challenge:** Standard CSS layouts break when switching to RTL languages like Arabic and Persian. Text alignment, margins, and element order must be reversed.
-   **Solution:** I implemented a dynamic styling system using CSS logical properties (`margin-inline-start`, `text-align: start`, etc.) and a direction-aware state in React. This allows the entire UI to seamlessly flip its layout based on the selected language, ensuring a native-feeling experience for RTL users.

#### 2. Building Custom Mobile Gesture Controls
-   **Challenge:** Default browser touch events can be unreliable, leading to conflicts between tapping, double-tapping, and multi-finger gestures (like pinch-to-zoom).
-   **Solution:** I engineered custom React hooks that precisely manage touch events. By tracking the number of active touch points and separating `touchstart` from `touchend` events, I was able to create distinct, conflict-free handlers for single-tap navigation and multi-touch zooming, providing a robust, native-like mobile experience.

#### 3. Dynamic, Overflow-Proof Zooming
-   **Challenge:** Longer words would overflow the screen when zoomed in too far, breaking the layout. The maximum zoom level needed to adapt to the content.
-   **Solution:** I developed a function that dynamically calculates the maximum allowable zoom level based on the current word's length and the viewport's width. This calculation runs every time a new word is displayed, ensuring that users can zoom for readability without ever breaking the UI.

## 🚀 Getting Started

To run this project locally:

1.  **Clone the repository:**
    ```sh
    git clone https://github.com/your-username/your-repo-name.git
    ```

2.  **Navigate to the project directory:**
    ```sh
    cd your-repo-name
    ```

3.  **Install dependencies:**
    ```sh
    npm install
    ```

4.  **Start the development server:**
    ```sh
    npm run dev
    ```
    The application will be available at `http://localhost:5173` (or another port if specified).

## ✍️ Author

**Sajjad Haq**

-   **GitHub:** [@sagehawk](https://github.com/sagehawk)
-   **LinkedIn:** [Sajjad Haq](https://www.linkedin.com/in/sajjadhaq/)

## 📜 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
