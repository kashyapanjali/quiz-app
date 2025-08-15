# React Quiz App

A simple quiz app built with React and lucide-react icons.
It fetches questions from an API, has a countdown timer, tracks your score, and lets you review answers.

---

## Features

- Fetches dynamic questions from Open Trivia DB
- 30-second timer per question
- Tracks score and shows summary
- Navigate to any question
- Review answers at the end
- Difficulty badges (Easy / Medium / Hard)
- Responsive design with custom CSS

---

## Project Structure

public/
  index.html
src/
  components/
    QuizSystem.js – Main quiz logic
    QuizSystem.css – Styles
  App.js
  index.js
package.json
README.md

---

## Installation

1. Clone the repository

```
git clone https://github.com/yourusername/quiz-app.git
cd quiz-app
```

2. Install dependencies

```
npm install
```

3. Start the development server

```
npm start
```

4. Open `http://localhost:3000` in your browser

---

## How It Works

- **Start Screen** – Shows quiz info and start button
- **Question Screen** – Shows question, answers, timer, and navigation
- **Result Screen** – Shows score and review of answers
- **Restart** – Start a new quiz anytime

---

## Customization

- Change API URL in `QuizSystem.js` to use your own questions
- Change `timeLeft` value to set a different timer duration
- Edit colors in `QuizSystem.css` to change the theme
