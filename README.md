# BenQ Monitor Test

A frontend-only monitor diagnostic app for checking:

- defective pixels on black, white, red, green, and blue screens
- gray uniformity at 25%, 50%, and 75%
- color distance between two RGB patches
- stepped gradients
- text sharpness
- viewing angle stability
- visual gamma matching
- response time and motion streaking

## Run Locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000/`, select the checks you want, and start the test.
The app requests full screen when the test begins. Use the arrow keys or the
left-edge menu to move through screens, Space to hide or show controls, and
Escape to exit.

## Verify

```bash
npm run build
npm test
```
